import React, { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { save as saveLS } from '../utils/storage'

const emptyRow = (id)=>({id, date:new Date().toISOString().slice(0,10), nozzle:'', fuel:'Petrol', opening:0, closing:0, testing:0, rate:0, qty:0, amount:0, payment:'Cash', salesman:'', customer:''})

export default function Sales({state,setState, role='Admin', user}){
  const [rows,setRows] = useState(state.sales || [])
  const settings = state.settings || {}
  const fuelRates = settings.rates || {Petrol:0, Diesel:0, CNG:0}
  const nozzleMap = (settings.nozzles||[]).reduce((m,n)=>{ m[n.name]=n.fuel; return m },{})

  const recalc = (r) => {
    const qty = Math.max((Number(r.closing)-Number(r.opening)-Number(r.testing)),0);
    const rate = Number(r.rate || fuelRates[r.fuel] || 0);
    const amount = qty * rate;
    return {...r, qty, rate, amount}
  }

  const update = (idx, field, value)=>{
    let changed = {...rows[idx],[field]:value}
    if(field==='nozzle'){
      const nz = value; const fuel = nozzleMap[nz];
      if(fuel){ changed.fuel = fuel }
    }
    const next = rows.map((r,i)=> i===idx ? recalc(changed) : r );
    setRows(next);
  }

  // Validation: build errors list
  const errors = useMemo(()=>{
    const list = []
    rows.forEach((r,i)=>{
      const opening = Number(r.opening)
      const closing = Number(r.closing)
      const testing = Number(r.testing)
      if(opening<0) list.push(`Row ${i+1}: Opening cannot be negative`)
      if(closing<0) list.push(`Row ${i+1}: Closing cannot be negative`)
      if(testing<0) list.push(`Row ${i+1}: Testing cannot be negative`)
      if(closing<opening) list.push(`Row ${i+1}: Closing must be >= Opening`)
      if(Number(r.rate)<0) list.push(`Row ${i+1}: Rate cannot be negative`)
    })
    return list
  }, [rows])

  const addRow = ()=> setRows([...rows, recalc(emptyRow(Date.now()))]);
  const remove = (idx)=> setRows(rows.filter((_,i)=>i!==idx));
  const calculateAll = ()=> setRows(rows.map(recalc));
  const saveDay = ()=> {
    const who = user?.name || 'Unknown'
    // Recalculate rows to ensure qty/amount are up to date
    const recalculated = rows.map(recalc);
    // Aggregate quantities sold by fuel
    const qtyByFuel = { Petrol:0, Diesel:0, CNG:0 };
    recalculated.forEach(r=>{ qtyByFuel[r.fuel] = (qtyByFuel[r.fuel]||0) + Number(r.qty||0); })

    // Deduct from inventory tanks in order, per fuel
    const inv = (state.inventory || []).map(t=> ({...t, capacity:Number(t.capacity||0), stock:Number(t.stock||0)}));
    const fuels = ['Petrol','Diesel','CNG'];
    const shortages = {};
    fuels.forEach(fuel=>{
      let remaining = Number(qtyByFuel[fuel]||0);
      if(remaining<=0) return;
      const tanks = inv.filter(t=> t.fuel===fuel);
      for(let i=0;i<tanks.length && remaining>0;i++){
        const t = tanks[i];
        const deduct = Math.min(t.stock, remaining);
        t.stock = Number((t.stock - deduct).toFixed(3));
        remaining = Number((remaining - deduct).toFixed(3));
      }
      if(remaining>0){ shortages[fuel] = remaining; }
    })

    // Update customers for credit sales
    const customers = (state.customers || []).map(c=> ({...c, balance:Number(c.balance||0), ledger:[...(c.ledger||[])]}));
    const findCustomer = (name)=> customers.find(c=> (c.name||'').toLowerCase()===String(name||'').toLowerCase());
    recalculated.forEach(r=>{
      if(r.payment !== 'Credit') return;
      const custName = String(r.customer||'').trim();
      if(!custName) return;
      let c = findCustomer(custName);
      if(!c){
        c = { id: Date.now().toString()+Math.random().toString(36).slice(2), name: custName, mobile:'', balance:0, ledger:[] };
        customers.push(c);
      }
      const saleRef = 'sale:'+r.id;
      const already = c.ledger?.some(l=> l.ref===saleRef);
      if(!already){
        c.balance = Number((Number(c.balance||0) + Number(r.amount||0)).toFixed(2));
        c.ledger = [...(c.ledger||[]), { date: r.date, type:'sale', amount: Number(r.amount||0), ref: saleRef }];
      }
    });

    const auditEntry = { id: Date.now().toString(), at:new Date().toISOString(), by:who, action:'save_day', details:{ rows:recalculated.length } }
    const next = {...state, sales: recalculated, inventory: inv, customers, audit:[auditEntry, ...(state.audit||[])] };
    setState(next); saveLS('ppro_state', next);
    const shortKeys = Object.keys(shortages);
    if(shortKeys.length){
      alert('Day saved. Note: Insufficient stock for '+ shortKeys.map(k=>`${k} (${shortages[k]}L)`).join(', ') +'. Inventory went to zero.');
    } else {
      alert('Day saved and inventory updated.');
    }
  }

  const exportCSV = ()=>{
    const header = ['date','nozzle','fuel','opening','closing','testing','rate','qty','amount','payment','salesman','customer']
    const lines = [header.join(',')].concat(rows.map(r=> header.map(h=> r[h]).join(',')))
    const blob = new Blob([lines.join('\n')],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='sales.csv'; a.click(); URL.revokeObjectURL(url)
  }
  const exportXLSX = ()=>{
    const header = ['date','nozzle','fuel','opening','closing','testing','rate','qty','amount','payment','salesman','customer']
    const data = rows.map(r=> header.map(h=> r[h]))
    const ws = XLSX.utils.aoa_to_sheet([header, ...data])
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Sales')
    XLSX.writeFile(wb, 'sales.xlsx')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input type="date" className="input" value={rows[0]?.date || new Date().toISOString().slice(0,10)} onChange={e=>{
          const v=e.target.value; setRows(rows.map(r=>({...r,date:v})))
        }} />
        <button className="btn" onClick={addRow}>➕ Add Row</button>
        <button className="btn" onClick={calculateAll}>🧮 Calculate</button>
        {role!=='Staff' && <button className="btn btn-success-success" disabled={errors.length>0} title={errors.length? 'Fix validation errors first':''} onClick={saveDay}>💾 Save Day</button>}
        <button className="btn" onClick={exportXLSX}>📊 Export Excel</button>
      </div>

      {errors.length>0 && (
        <div className="card p-3 bg-red-900/30 border border-red-700 text-red-200">
          <div className="font-semibold mb-1">Please fix {errors.length} error(s) before saving:</div>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {errors.slice(0,5).map((e,i)=>(<li key={i}>{e}</li>))}
          </ul>
        </div>
      )}

      <div className="card p-4 overflow-auto">
        <table className="table min-w-[1200px]">
          <thead>
            <tr>
              <th>Nozzle</th><th>Fuel</th><th>Opening</th><th>Closing</th><th>Testing</th><th>Rate</th><th>Qty</th><th>Amount</th><th>Payment</th><th>Salesman</th><th>Customer</th><th>Invoice</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,idx)=> (
              <tr key={r.id}>
                <td><input className="input w-24" value={r.nozzle} onChange={e=>update(idx,'nozzle',e.target.value)} /></td>
                <td>
                  <select className="input w-28" value={r.fuel} onChange={e=>update(idx,'fuel',e.target.value)}>
                    <option>Petrol</option><option>Diesel</option><option>CNG</option>
                  </select>
                </td>
                <td><input type="number" className="input w-24" value={r.opening} onChange={e=>update(idx,'opening',e.target.value)} /></td>
                <td><input type="number" className="input w-24" value={r.closing} onChange={e=>update(idx,'closing',e.target.value)} /></td>
                <td><input type="number" className="input w-24" value={r.testing} onChange={e=>update(idx,'testing',e.target.value)} /></td>
                <td><input type="number" className="input w-24" value={r.rate} onChange={e=>update(idx,'rate',e.target.value)} /></td>
                <td className="text-right">{r.qty}</td>
                <td className="text-right">{r.amount}</td>
                <td>
                  <select className="input w-28" value={r.payment} onChange={e=>update(idx,'payment',e.target.value)}>
                    <option>Cash</option><option>UPI</option><option>Card</option><option>Credit</option>
                  </select>
                </td>
                <td><input className="input w-28" value={r.salesman||''} onChange={e=>update(idx,'salesman',e.target.value)} /></td>
                <td><input className="input w-32" value={r.customer||''} onChange={e=>update(idx,'customer',e.target.value)} /></td>
                <td><button className="btn" onClick={()=>{
                  const s = state.settings || {}
                  const win = window.open('', '_blank', 'width=600,height=800')
                  if(!win) return;
                  const html = `<!DOCTYPE html><html><head><title>Invoice</title><style>
                    body{font-family:ui-sans-serif,system-ui; padding:16px;}
                    .h{font-weight:700;font-size:18px}
                    table{width:100%; border-collapse:collapse;}
                    td,th{border:1px solid #ddd; padding:6px; font-size:12px}
                  </style></head><body>
                    <div class="h">${s.station||'Petrol Pump'}</div>
                    <div>GSTIN: ${s.gstin||'-'}</div>
                    <div>${s.address||''}</div>
                    <hr/>
                    <table>
                      <tr><th>Date</th><td>${r.date||''}</td><th>Nozzle</th><td>${r.nozzle||''}</td></tr>
                      <tr><th>Fuel</th><td>${r.fuel}</td><th>Rate</th><td>${r.rate}</td></tr>
                      <tr><th>Qty (L)</th><td>${r.qty}</td><th>Amount</th><td>${r.amount}</td></tr>
                      <tr><th>Customer</th><td>${r.customer||'-'}</td><th>Payment</th><td>${r.payment}</td></tr>
                    </table>
                    <p style="margin-top:20px;font-size:12px">Thank you! Visit again.</p>
                    <script>window.onload=()=>window.print()</script>
                  </body></html>`
                  win.document.write(html); win.document.close();
                }}>🧾</button></td>
                <td><button className="btn-danger" onClick={()=>remove(idx)}>✖</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
