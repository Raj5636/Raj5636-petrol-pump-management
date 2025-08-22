import React, { useState } from 'react'
import { fmt } from '../utils/storage'

export default function Staff({state,setState, currentRole='Admin'}){
  const [rows,setRows] = useState(state.staff || [])
  const [name,setName] = useState('')
  const rolesList = state.settings?.roles || ['Manager','Salesman','Sweeper','Guard','Clerk']
  const wageRates = state.settings?.wageRates || { Manager:200, Salesman:120, Sweeper:80, Guard:90, Clerk:100 }
  const [role,setRole] = useState(rolesList[0] || 'Salesman')
  const [mobile,setMobile] = useState('')
  const [from,setFrom] = useState(new Date().toISOString().slice(0,10))
  const [to,setTo] = useState(new Date().toISOString().slice(0,10))
  const [attendance,setAttendance] = useState(state.attendance || [])
  const nozzleList = state.settings?.nozzles || []

  const add = ()=>{
    if(!name) return;
    setRows([...rows,{id:Date.now().toString(), name, role, mobile, attendance:false, nozzles:[]}])
    setName(''); setMobile('')
  }
  const save = ()=>{
    const next = {...state, staff: rows, attendance }
    setState(next); localStorage.setItem('ppro_state', JSON.stringify(next)); alert('Staff saved')
  }

  const sales = state.sales || []
  const inRange = s => (!from || s.date>=from) && (!to || s.date<=to)

  const totalsFor = (who) => {
    const list = sales.filter(inRange).filter(s=> s.salesman===who.name || who.nozzles?.includes(s.nozzle))
    return {
      Petrol: list.filter(s=>s.fuel==='Petrol').reduce((a,b)=>a+b.amount,0),
      Diesel: list.filter(s=>s.fuel==='Diesel').reduce((a,b)=>a+b.amount,0),
      CNG: list.filter(s=>s.fuel==='CNG').reduce((a,b)=>a+b.amount,0),
    }
  }

  const todayStr = () => new Date().toISOString().slice(0,10)
  const isInRangeDate = (dateStr) => (!from || dateStr>=from) && (!to || dateStr<=to)
  const openShiftFor = (staffId) => attendance.find(a=> a.staffId===staffId && !a.checkOut)
  const startShift = (staffId) => {
    if(openShiftFor(staffId)) { alert('Shift already started'); return; }
    const now = new Date().toISOString();
    const entry = { id: Date.now().toString(), staffId, date: todayStr(), checkIn: now };
    setAttendance([entry, ...attendance]);
  }
  const endShift = (staffId) => {
    const open = openShiftFor(staffId); if(!open) { alert('No open shift'); return; }
    const now = new Date().toISOString();
    const next = attendance.map(a=> a.id===open.id ? {...a, checkOut: now} : a);
    setAttendance(next);
  }
  const hoursFor = (staffId) => {
    const list = attendance.filter(a=> a.staffId===staffId && isInRangeDate(a.date));
    const totalMs = list.reduce((sum,a)=>{
      const start = a.checkIn ? new Date(a.checkIn).getTime() : 0;
      const end = a.checkOut ? new Date(a.checkOut).getTime() : Date.now();
      if(!start) return sum; if(end < start) return sum;
      return sum + (end - start);
    }, 0);
    return totalMs / (1000*60*60);
  }

  return (
    <div className="space-y-4">
      <div className="text-white/70">New: Assign Nozzle(s) to staff → Sales entry auto-fills salesman based on nozzle.</div>
      <div className="grid md:grid-cols-6 gap-3">
        <input className="input" placeholder="नाम" value={name} onChange={e=>setName(e.target.value)}/>
        <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
          {rolesList.map(r=> <option key={r}>{r}</option>)}
        </select>
        <input className="input" placeholder="मोबाइल" value={mobile} onChange={e=>setMobile(e.target.value)}/>
        {currentRole!=='Staff' && <button className="btn" onClick={add}>+ Add</button>}
        <input type="date" className="input" value={from} onChange={e=>setFrom(e.target.value)}/>
        <input type="date" className="input" value={to} onChange={e=>setTo(e.target.value)}/>
        <button className="btn btn-primary">▶ Run</button>
      </div>

      <div className="card p-4">
        {currentRole!=='Staff' && <button className="btn mb-3" onClick={save}>💾 Save</button>}
        <div className="overflow-x-auto">
          <table className="table min-w-full">
            <thead><tr><th>नाम</th><th>भूमिका</th><th>मोबाइल</th><th>Nozzles</th><th>Shift</th><th>Hours</th><th>Wage/hr</th><th>Salary</th><th>Petrol (₹)</th><th>Diesel (₹)</th><th>CNG (₹)</th><th>Total (₹)</th><th>Del</th></tr></thead>
          <tbody>
            {rows.map((r,idx)=>{
              const t = totalsFor(r); const total = t.Petrol+t.Diesel+t.CNG;
              const hours = hoursFor(r.id)
              const wage = wageRates[r.role] ?? 0
              const salary = hours * wage
              const open = openShiftFor(r.id)
              return (
                <tr key={r.id}>
                  <td>{r.name}</td><td>{r.role}</td><td>{r.mobile||'-'}</td>
                  <td>
                    <select className="input w-40" multiple value={r.nozzles||[]} onChange={e=>{
                      const opts = Array.from(e.target.selectedOptions).map(o=>o.value)
                      const next = rows.map((row,i)=> i===idx ? {...row, nozzles: opts } : row)
                      setRows(next)
                    }}>
                      {nozzleList.map(n=> <option key={n.id} value={n.name}>{n.name} ({n.fuel})</option>)}
                    </select>
                  </td>
                  <td>
                    {open ? (
                      <button className="btn-danger" onClick={()=>endShift(r.id)}>End Shift</button>
                    ) : (
                      <button className="btn" onClick={()=>startShift(r.id)}>Start Shift</button>
                    )}
                  </td>
                  <td>{hours.toFixed(2)}</td>
                  <td>{fmt(wage, state.settings)}</td>
                  <td>{fmt(salary, state.settings)}</td>
                  <td>{fmt(t.Petrol, state.settings)}</td>
                  <td>{fmt(t.Diesel, state.settings)}</td>
                  <td>{fmt(t.CNG, state.settings)}</td>
                  <td>{fmt(total, state.settings)}</td>
                  <td><button className="btn-danger" onClick={()=>setRows(rows.filter((_,i)=>i!==idx))}>✖</button></td>
                </tr>
              )
            })}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
