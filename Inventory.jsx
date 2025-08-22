import React, { useEffect, useState } from 'react'

export default function Inventory({state,setState, role='Admin', user}){
  const [rows,setRows] = useState(state.inventory || [])
  const [form,setForm] = useState({name:'', fuel:'Petrol', capacity:'', stock:''})

  const addTank = ()=> {
    if(!form.name) return;
    setRows([...rows, { id: Date.now().toString(), ...form, capacity:Number(form.capacity||0), stock:Number(form.stock||0) }]);
    setForm({name:'', fuel:'Petrol', capacity:'', stock:''})
  }
  const upd = (idx, field, value)=>{
    const next = rows.map((r,i)=> i===idx ? {...r,[field]:value} : r )
    setRows(next)
  }
  const refill = (idx)=>{
    const qtyStr = prompt('Enter refill quantity (L):','');
    if(qtyStr === null) return;
    const qty = Number(qtyStr);
    if(!isFinite(qty) || qty <= 0){ alert('Enter a valid quantity'); return; }
    const tank = rows[idx];
    const current = Number(tank.stock||0);
    const capacity = Number(tank.capacity||0);
    const desired = current + qty;
    const newStock = Math.min(capacity, desired);
    if(newStock < desired) alert('Refill exceeds capacity. Stock set to capacity.');
    const next = rows.map((r,i)=> i===idx ? {...r, stock:newStock} : r );
    setRows(next);
  }
  const validate = ()=>{
    for(const [i,t] of rows.entries()){
      const cap = Number(t.capacity||0); const stk = Number(t.stock||0)
      if(cap<0 || stk<0) { alert(`Row ${i+1}: capacity/stock cannot be negative`); return false }
      if(stk>cap) { alert(`Row ${i+1}: stock cannot exceed capacity`); return false }
    }
    return true
  }
  const save = ()=>{
    if(!validate()) return;
    const auditEntry = { id: Date.now().toString(), at:new Date().toISOString(), by:(user?.name||'Unknown'), action:'inventory_save', details:{ rows:rows.length } }
    const next = {...state, inventory: rows, audit:[auditEntry, ...(state.audit||[])]}
    setState(next); localStorage.setItem('ppro_state', JSON.stringify(next)); alert('Inventory saved')
  }
  useEffect(()=>{
    const next = {...state, inventory: rows}
    setState(next); localStorage.setItem('ppro_state', JSON.stringify(next));
  }, [rows])

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="grid md:grid-cols-5 gap-3">
          <input className="input" placeholder="टैंक का नाम" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <select className="input" value={form.fuel} onChange={e=>setForm({...form,fuel:e.target.value})}><option>Petrol</option><option>Diesel</option><option>CNG</option></select>
          <input className="input" placeholder="Capacity (L)" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/>
          <input className="input" placeholder="Current Stock (L)" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/>
          <div className="flex gap-2">
            {role!=='Staff' && <button className="btn" onClick={addTank}>+ Add Tank</button>}
            {role!=='Staff' && <button className="btn btn-success-success" onClick={save}>Save</button>}
          </div>
        </div>
      </div>
      <div className="card p-4">
        <table className="table">
          <thead><tr><th>Tank</th><th>Fuel</th><th>Capacity</th><th>Stock</th><th>Status</th><th>Refill</th><th>+In</th><th>-Out</th><th>Del</th></tr></thead>
          <tbody>
            {rows.map((r,idx)=>(
              <tr key={r.id}>
                <td>{r.name}</td><td>{r.fuel}</td>
                <td>{r.capacity}</td><td>{r.stock}</td>
                <td>{r.stock > (0.2*r.capacity) ? <span className="text-green-400">OK</span> : <span className="text-yellow-400">LOW</span>}</td>
                <td><button className="btn" onClick={()=>refill(idx)}>Refill</button></td>
                <td><input className="input w-24" placeholder="+ L" onChange={e=>upd(idx,'stock', Number(r.stock)+Number(e.target.value||0))}/></td>
                <td><input className="input w-24" placeholder="- L" onChange={e=>upd(idx,'stock', Math.max(0, Number(r.stock)-Number(e.target.value||0)))}/></td>
                <td><button className="btn-danger" onClick={()=>setRows(rows.filter((_,i)=>i!==idx))}>✖</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
