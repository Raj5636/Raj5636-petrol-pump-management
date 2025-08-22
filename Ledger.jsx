import React, { useState } from 'react'
import { fmt } from '../utils/storage'

export default function Ledger({state,setState}){
  const [name,setName] = useState('')
  const [mobile,setMobile] = useState('')
  const [sel, setSel] = useState(state.customers?.[0]?.id || null)
  const [receiveAmt,setReceiveAmt] = useState('')
  const [mode,setMode] = useState('Cash')

  const customers = state.customers || []

  const addCustomer = ()=>{
    if(!name) return;
    const c = { id: Date.now().toString(), name, mobile, balance:0, ledger:[] }
    const next = {...state, customers:[...customers,c]}
    setState(next); localStorage.setItem('ppro_state', JSON.stringify(next));
    setName(''); setMobile(''); setSel(c.id)
  }

  const receive = ()=>{
    const id = sel; if(!id) return;
    const amt = Number(receiveAmt||0);
    const next = {...state, customers: customers.map(c=> c.id===id ? {...c, balance: Math.max(0,(c.balance||0)-amt), ledger:[...c.ledger, {date:new Date().toISOString().slice(0,10), type:'receive', amount:amt, ref:mode}] } : c)}
    setState(next); localStorage.setItem('ppro_state', JSON.stringify(next)); setReceiveAmt('')
  }

  const selected = customers.find(c=>c.id===sel)

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-white/60 mb-2">ग्राहक का नाम</div>
          <input className="input w-full" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="card p-4">
          <div className="text-white/60 mb-2">मोबाइल (वैकल्पिक)</div>
          <input className="input w-full" value={mobile} onChange={e=>setMobile(e.target.value)} />
        </div>
        <div className="card p-4 flex items-center justify-center">
          <button className="btn" onClick={addCustomer}>+ Add Customer</button>
        </div>
      </div>

      <div className="card p-4 flex items-center gap-3">
        <select className="input" value={sel||''} onChange={e=>setSel(e.target.value)}>
          <option value="">Select Customer</option>
          {customers.map(c=> <option key={c.id} value={c.id}>{c.name} ({fmt(c.balance, state.settings)})</option>)}
        </select>
        <input className="input" placeholder="Receive Amount (₹)" value={receiveAmt} onChange={e=>setReceiveAmt(e.target.value)}/>
        <select className="input" value={mode} onChange={e=>setMode(e.target.value)}><option>Cash</option><option>UPI</option><option>Card</option></select>
        <button className="btn-success" onClick={receive}>🔥 Receive</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-semibold mb-2">Customers & Balances</div>
          <table className="table">
            <thead><tr><th>ग्राहक</th><th>मोबाइल</th><th>बकाया (₹)</th><th>Del</th></tr></thead>
            <tbody>
              {customers.map(c=> (
                <tr key={c.id}>
                  <td>{c.name}</td><td>{c.mobile||'-'}</td><td>{fmt(c.balance, state.settings)}</td>
                  <td><button className="btn-danger" onClick={()=>{
                    const next = {...state, customers: customers.filter(x=>x.id!==c.id)}
                    setState(next); localStorage.setItem('ppro_state', JSON.stringify(next));
                  }}>✖</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-2">Ledger (Selected Customer)</div>
          <table className="table">
            <thead><tr><th>Date</th><th>Type</th><th>Amount (₹)</th><th>Ref</th></tr></thead>
            <tbody>
              {selected?.ledger?.map((l,idx)=>(
                <tr key={idx}><td>{l.date}</td><td>{l.type}</td><td>{fmt(l.amount, state.settings)}</td><td>{l.ref}</td></tr>
              )) || null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
