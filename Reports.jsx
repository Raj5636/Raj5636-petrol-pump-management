import React, { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { fmt } from '../utils/storage'
export default function Reports({state, setState}){
  const [from,setFrom] = useState(new Date().toISOString().slice(0,10))
  const [to,setTo] = useState(new Date().toISOString().slice(0,10))
  const [groupBy, setGroupBy] = useState('daily') // daily | weekly | monthly
  const sales = state.sales || []
  const inRange = s => (!from || s.date>=from) && (!to || s.date<=to)
  const sel = useMemo(()=> sales.filter(inRange), [sales, from, to])

  const totalByFuel = (fuel) => sel.filter(s=>s.fuel===fuel).reduce((a,b)=>a+b.amount,0)
  const paySum = (mode) => sel.filter(s=>s.payment===mode).reduce((a,b)=>a+b.amount,0)

  const expected = { Cash: paySum('Cash'), UPI: paySum('UPI'), Card: paySum('Card') }
  const [counted, setCounted] = useState({ Cash:'', UPI:'', Card:'' })
  const closures = state.closures || []
  const saveClosure = ()=>{
    const rec = { id: Date.now().toString(), from, to, groupBy, expected, counted: { Cash:Number(counted.Cash||0), UPI:Number(counted.UPI||0), Card:Number(counted.Card||0) }, createdAt:new Date().toISOString() }
    const next = {...state, closures:[rec, ...closures]}
    if(setState){ setState(next); }
    localStorage.setItem('ppro_state', JSON.stringify(next)); alert('Shift closed & saved')
  }

  const startOfWeek = (dateStr)=>{
    const d = new Date(dateStr); const day = d.getUTCDay();
    const diff = (day+6)%7; d.setUTCDate(d.getUTCDate()-diff); return d.toISOString().slice(0,10)
  }
  const monthKey = (dateStr)=> dateStr.slice(0,7)
  const groupKey = (dateStr)=> groupBy==='daily' ? dateStr : groupBy==='weekly' ? startOfWeek(dateStr) : monthKey(dateStr)

  const grouped = useMemo(()=>{
    const map = new Map();
    sel.forEach(s=>{
      const key = groupKey(s.date);
      const curr = map.get(key) || { Petrol:0, Diesel:0, CNG:0, total:0 };
      curr[s.fuel] = (curr[s.fuel]||0) + s.amount;
      curr.total += s.amount;
      map.set(key, curr);
    })
    return Array.from(map.entries()).sort((a,b)=> a[0]<b[0]? -1: 1)
  }, [sel, groupBy])

  const cost = state.settings?.costRates || {Petrol:100, Diesel:92, CNG:80}
  const profit = (s)=> s.amount - ((cost[s.fuel]||0) * (s.qty||0))
  const profitSum = (fuel)=> sel.filter(s=>s.fuel===fuel).reduce((a,b)=> a + profit(b), 0)
  const profitTotal = profitSum('Petrol') + profitSum('Diesel') + profitSum('CNG')

  const exportExcel = ()=>{
    const stationName = state.settings?.station || 'PETROL PUMP PRO+ v4';
    const logoRow = [stationName, '', '', '', ''];
    const headerRow = ['Date/Group','Petrol','Diesel','CNG','Total'];
    const dataRows = grouped.map(([k,v])=> [k,v.Petrol||0,v.Diesel||0,v.CNG||0,v.total||0]);
    
    const rows = [logoRow, [''], headerRow].concat(dataRows);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    
    // Style the header with logo
    ws['A1'] = { v: stationName, t: 's', s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } } };
    XLSX.utils.sheet_set_range_style(ws, 'A1:E1', { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, `${stationName.replace(/[^a-zA-Z0-9]/g, '_')}_Sales_Report.xlsx`);
  }
  const exportPDF = ()=>{
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 no-print">
        <button className="pill" onClick={exportExcel}>📊 Export Sales Report (Excel)</button>
        <button className="pill" onClick={exportPDF}>🖨 {state.settings?.station || 'PETROL PUMP PRO+'} - Export (Print/PDF)</button>
      </div>
      <div className="flex items-center gap-3 no-print">
        <input type="date" className="input" value={from} onChange={e=>setFrom(e.target.value)}/>
        <input type="date" className="input" value={to} onChange={e=>setTo(e.target.value)}/>
        <select className="input" value={groupBy} onChange={e=>setGroupBy(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button className="btn btn-primary">▶ Run</button>
        <button className="btn btn-primary" onClick={()=>window.print()}>🖨 Print</button>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-5 grad-card"><div>Total Petrol</div><div className="text-3xl font-extrabold">{fmt(totalByFuel('Petrol'), state.settings)}</div></div>
        <div className="card p-5 grad-card"><div>Total Diesel</div><div className="text-3xl font-extrabold">{fmt(totalByFuel('Diesel'), state.settings)}</div></div>
        <div className="card p-5 grad-card"><div>Total CNG</div><div className="text-3xl font-extrabold">{fmt(totalByFuel('CNG'), state.settings)}</div></div>
        <div className="card p-5 grad-card"><div>Grand Total</div><div className="text-3xl font-extrabold">{fmt(totalByFuel('Petrol')+totalByFuel('Diesel')+totalByFuel('CNG'), state.settings)}</div></div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-semibold mb-2">Payment Summary (Cash / UPI / Card / Credit)</div>
          <table className="table">
            <thead><tr><th>Mode</th><th>Amount (₹)</th></tr></thead>
            <tbody>
              <tr><td>Cash</td><td>{fmt(paySum('Cash'), state.settings)}</td></tr>
              <tr><td>UPI</td><td>{fmt(paySum('UPI'), state.settings)}</td></tr>
              <tr><td>Card</td><td>{fmt(paySum('Card'), state.settings)}</td></tr>
              <tr><td>Credit</td><td>{fmt(paySum('Credit'), state.settings)}</td></tr>
              <tr><td>Total</td><td>{fmt(paySum('Cash')+paySum('UPI')+paySum('Card')+paySum('Credit'), state.settings)}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-2">End of Day Reconciliation</div>
          <table className="table">
            <thead><tr><th>Mode</th><th>Expected</th><th>Counted</th><th>Variance</th></tr></thead>
            <tbody>
              {['Cash','UPI','Card'].map(m=>{
                const exp = expected[m]||0;
                const c = Number(counted[m]||0)
                return <tr key={m}><td>{m}</td><td>{fmt(exp, state.settings)}</td><td><input className="input w-32" value={counted[m]} onChange={e=>setCounted({...counted,[m]:e.target.value})}/></td><td>{fmt(c-exp, state.settings)}</td></tr>
              })}
            </tbody>
          </table>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-success" onClick={saveClosure}>💾 Save Closure</button>
            <button className="btn" onClick={()=>window.print()}>🖨 Print</button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-semibold mb-2">Sales Trend ({groupBy}) — Stacked by Fuel</div>
          <svg width="100%" height="200" viewBox="0 0 340 200" preserveAspectRatio="none">
            {(()=>{
              const max = Math.max(...grouped.map(([_,g])=>g.total||0),1)
              const barW = 14; const gap = 10; const left=20; const bottom=180
              return grouped.map(([k,v],i)=>{
                const x = left + i*(barW+gap)
                const totalH = ((v.total||0)/max)*150
                const hP = ((v.Petrol||0)/max)*150
                const hD = ((v.Diesel||0)/max)*150
                const hC = ((v.CNG||0)/max)*150
                return (
                  <g key={k}>
                    <rect x={x} y={bottom-hP} width={barW} height={hP} rx="3" className="fill-blue-400/70" />
                    <rect x={x} y={bottom-hP-hD} width={barW} height={hD} rx="3" className="fill-green-400/70" />
                    <rect x={x} y={bottom-totalH} width={barW} height={hC} rx="3" className="fill-yellow-400/70" />
                  </g>
                )
              })
            })()}
          </svg>
          <div className="text-xs text-white/60 mt-2">Legend: Blue=Petrol, Green=Diesel, Yellow=CNG</div>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-2">Profit Analysis</div>
          <table className="table">
            <thead><tr><th>Fuel</th><th>Profit (₹)</th></tr></thead>
            <tbody>
              <tr><td>Petrol</td><td>{fmt(profitSum('Petrol'), state.settings)}</td></tr>
              <tr><td>Diesel</td><td>{fmt(profitSum('Diesel'), state.settings)}</td></tr>
              <tr><td>CNG</td><td>{fmt(profitSum('CNG'), state.settings)}</td></tr>
              <tr><td>Total</td><td>{fmt(profitTotal, state.settings)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="print-only">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">⛽</div>
            <div className="text-xl font-bold">{state.settings?.station || 'PETROL PUMP PRO+ v4'}</div>
          </div>
          <div className="text-lg font-semibold">{groupBy.toUpperCase()} Sales Report</div>
          <div className="text-sm">From {from} to {to}</div>
        </div>
        <table className="table">
          <thead><tr><th>Date/Group</th><th>Petrol</th><th>Diesel</th><th>CNG</th><th>Total</th></tr></thead>
          <tbody>
            {grouped.map(([k,v])=> (
              <tr key={k}><td>{k}</td><td>{fmt(v.Petrol||0, state.settings)}</td><td>{fmt(v.Diesel||0, state.settings)}</td><td>{fmt(v.CNG||0, state.settings)}</td><td>{fmt(v.total||0, state.settings)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
