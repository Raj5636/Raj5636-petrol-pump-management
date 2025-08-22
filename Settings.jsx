import React, { useState } from 'react'

export default function Settings({state,setState}){
  const s = state.settings || {}
  const [station,setStation] = useState(s.station || 'Your Pump Name')
  const [gstin,setGstin] = useState(s.gstin || '')
  const [address,setAddress] = useState(s.address || '')
  const [currency,setCurrency] = useState(s.currency || '₹')
  const [rates,setRates] = useState(s.rates || {Petrol:102.5, Diesel:94.75, CNG:85})
  const [costRates,setCostRates] = useState(s.costRates || {Petrol:100, Diesel:92, CNG:80})
  const [day1,setDay1] = useState(s.shifts?.day?.[0] || '06:00')
  const [day2,setDay2] = useState(s.shifts?.day?.[1] || '14:00')
  const [night1,setNight1] = useState(s.shifts?.night?.[0] || '14:00')
  const [night2,setNight2] = useState(s.shifts?.night?.[1] || '22:00')
  const [roles,setRoles] = useState(s.roles || ['Manager','Salesman','Sweeper','Guard','Clerk'])
  const [wageRates,setWageRates] = useState(s.wageRates || { Manager:200, Salesman:120, Sweeper:80, Guard:90, Clerk:100 })
  const [newRole,setNewRole] = useState('')
  const [nozzles,setNozzles] = useState(s.nozzles || [])
  const [nzName,setNzName] = useState('')
  const [nzFuel,setNzFuel] = useState('Petrol')
  const [users,setUsers] = useState(s.users || [])
  const [uName,setUName] = useState('')
  const [uUser,setUUser] = useState('')
  const [uPass,setUPass] = useState('')
  const [uRole,setURole] = useState('Staff')

  const apply = ()=>{
    const next = {...state, settings:{ station:station, gstin, address, currency, rates, costRates, shifts:{day:[day1,day2], night:[night1,night2]}, roles, wageRates, users, nozzles } }
    setState(next); localStorage.setItem('ppro_state', JSON.stringify(next)); alert('Settings applied')
  }
  const reset = ()=>{
    if(confirm('All saved data will be removed and the app will reload. Continue?')){
      localStorage.removeItem('ppro_state');
      location.reload();
    }
  }
  const backup = ()=>{
    const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'petrol-pump-backup.json'; a.click(); URL.revokeObjectURL(url);
  }
  const restore = ()=>{
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0]; if(!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if(!confirm('Restore this backup? Current data will be replaced.')) return;
        setState(data); localStorage.setItem('ppro_state', JSON.stringify(data)); alert('Backup restored');
      } catch(e) { alert('Invalid backup file'); }
    };
    input.click();
  }
  const addUser = ()=>{
    if(!uUser || !uPass){ alert('Username and password required'); return; }
    if(users.some(x=> x.username===uUser)){ alert('Username already exists'); return; }
    setUsers([...users, { id: Date.now().toString(), name: uName || uUser, username: uUser, password: uPass, role: uRole }]);
    setUName(''); setUUser(''); setUPass(''); setURole('Staff');
  }
  const saveUsers = ()=>{
    const next = {...state, settings:{ ...state.settings, station:station, currency, rates, costRates, shifts:{day:[day1,day2], night:[night1,night2]}, roles, wageRates, users } }
    setState(next); localStorage.setItem('ppro_state', JSON.stringify(next)); alert('Users saved')
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 space-y-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Station Name</label>
            <input className="input" placeholder="e.g. Sumit Refueling Station" value={station} onChange={e=>setStation(e.target.value)}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GSTIN</label>
            <input className="input" placeholder="e.g. 27ABCDE1234F1Z5" value={gstin} onChange={e=>setGstin(e.target.value)}/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input className="input" placeholder="e.g. Parora, Meerganj, Bareilly - 243001" value={address} onChange={e=>setAddress(e.target.value)}/>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Currency Symbol</label>
            <input className="input" placeholder="e.g. ₹" value={currency} onChange={e=>setCurrency(e.target.value)}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Default Fuel Rates (₹/L, comma: Petrol,Diesel,CNG)</label>
            <input className="input" placeholder="e.g. 102.50" value={rates.Petrol} onChange={e=>setRates({...rates,Petrol:Number(e.target.value||0)})}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Diesel Rate</label>
            <input className="input" placeholder="e.g. 94.75" value={rates.Diesel} onChange={e=>setRates({...rates,Diesel:Number(e.target.value||0)})}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CNG Rate</label>
            <input className="input" placeholder="e.g. 85.00" value={rates.CNG} onChange={e=>setRates({...rates,CNG:Number(e.target.value||0)})}/>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Cost Petrol</label>
            <input className="input" placeholder="e.g. 100.00" value={costRates.Petrol} onChange={e=>setCostRates({...costRates,Petrol:Number(e.target.value||0)})}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost Diesel</label>
            <input className="input" placeholder="e.g. 92.00" value={costRates.Diesel} onChange={e=>setCostRates({...costRates,Diesel:Number(e.target.value||0)})}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost CNG</label>
            <input className="input" placeholder="e.g. 80.00" value={costRates.CNG} onChange={e=>setCostRates({...costRates,CNG:Number(e.target.value||0)})}/>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-success" onClick={apply}>✅ Apply</button>
          <button className="btn-danger" onClick={reset}>♻️ Reset All</button>
          <button className="btn" onClick={backup}>⬇️ Export Backup (JSON)</button>
          <button className="btn" onClick={restore}>⬆️ Import Backup</button>
        </div>
        <div className="text-xs text-red-300 md:col-span-4">
          Warning: Reset karne par saara unsaved data turant delete ho jayega. Yeh action undo nahi ho sakta.
        </div>
      </div>

      <div className="card p-4">
        <div className="font-semibold mb-2">⏰ Shift Timings</div>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2"><span>Day Shift:</span><input type="time" className="input" value={day1} onChange={e=>setDay1(e.target.value)}/><input type="time" className="input" value={day2} onChange={e=>setDay2(e.target.value)}/></div>
          <div className="flex items-center gap-2"><span>Night Shift:</span><input type="time" className="input" value={night1} onChange={e=>setNight1(e.target.value)}/><input type="time" className="input" value={night2} onChange={e=>setNight2(e.target.value)}/></div>
        </div>
      </div>
      
      <div className="card p-4 space-y-3">
        <div className="font-semibold">👤 Users & Roles</div>
        <div className="grid md:grid-cols-5 gap-2">
          <input className="input" placeholder="e.g. Rajesh Kumar" value={uName} onChange={e=>setUName(e.target.value)}/>
          <input className="input" placeholder="e.g. rajesh123" value={uUser} onChange={e=>setUUser(e.target.value)}/>
          <input className="input" placeholder="e.g. pass@123" value={uPass} onChange={e=>setUPass(e.target.value)}/>
          <select className="input" value={uRole} onChange={e=>setURole(e.target.value)}>
            <option>Admin</option><option>Manager</option><option>Staff</option>
          </select>
          <button className="btn" onClick={addUser}>+ Add User</button>
        </div>
        <table className="table">
          <thead><tr><th>Name</th><th>Username</th><th>Password</th><th>Role</th><th>Del</th></tr></thead>
          <tbody>
            {users.map((u,i)=> (
              <tr key={u.id}>
                <td><input className="input w-40" value={u.name} onChange={e=>setUsers(users.map((x,idx)=> idx===i? {...x,name:e.target.value}:x))}/></td>
                <td><input className="input w-36" value={u.username} onChange={e=>setUsers(users.map((x,idx)=> idx===i? {...x,username:e.target.value}:x))}/></td>
                <td><input className="input w-36" value={u.password} onChange={e=>setUsers(users.map((x,idx)=> idx===i? {...x,password:e.target.value}:x))}/></td>
                <td>
                  <select className="input w-32" value={u.role} onChange={e=>setUsers(users.map((x,idx)=> idx===i? {...x,role:e.target.value}:x))}>
                    <option>Admin</option><option>Manager</option><option>Staff</option>
                  </select>
                </td>
                <td><button className="btn-danger" onClick={()=>setUsers(users.filter((_,idx)=> idx!==i))}>✖</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <button className="btn-success" onClick={saveUsers}>💾 Save Users</button>
        </div>
        <div className="text-white/60 text-xs">Note: This simple demo stores passwords in localStorage for offline use.</div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="font-semibold">⛽ Nozzles Mapping</div>
        <div className="grid md:grid-cols-5 gap-2">
          <input className="input" placeholder="e.g. P-01, D-01, C-01" value={nzName} onChange={e=>setNzName(e.target.value)}/>
          <select className="input" value={nzFuel} onChange={e=>setNzFuel(e.target.value)}>
            <option>Petrol</option><option>Diesel</option><option>CNG</option>
          </select>
          <button className="btn" onClick={()=>{
            const name = nzName.trim(); if(!name) return;
            if(nozzles.some(z=>z.name.toLowerCase()===name.toLowerCase())){ alert('Nozzle already exists'); return; }
            setNozzles([...nozzles, { id: Date.now().toString(), name, fuel: nzFuel }]); setNzName(''); setNzFuel('Petrol');
          }}>+ Add Nozzle</button>
        </div>
        <table className="table">
          <thead><tr><th>Nozzle</th><th>Fuel</th><th>Del</th></tr></thead>
          <tbody>
            {nozzles.map((z,i)=> (
              <tr key={z.id}>
                <td><input className="input w-32" value={z.name} onChange={e=>setNozzles(nozzles.map((x,idx)=> idx===i? {...x,name:e.target.value}:x))}/></td>
                <td>
                  <select className="input w-28" value={z.fuel} onChange={e=>setNozzles(nozzles.map((x,idx)=> idx===i? {...x,fuel:e.target.value}:x))}>
                    <option>Petrol</option><option>Diesel</option><option>CNG</option>
                  </select>
                </td>
                <td><button className="btn-danger" onClick={()=>setNozzles(nozzles.filter((_,idx)=> idx!==i))}>✖</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-4 space-y-3">
        <div className="font-semibold">👥 Staff Roles & Wages</div>
        <div className="flex gap-2">
          <input className="input" placeholder="e.g. Supervisor, Mechanic, Cashier" value={newRole} onChange={e=>setNewRole(e.target.value)}/>
          <button className="btn" onClick={()=>{
            const r = newRole.trim(); if(!r) return; if(roles.includes(r)) { alert('Role already exists'); return; }
            setRoles([...roles, r]); setWageRates({...wageRates, [r]: 100}); setNewRole('');
          }}>+ Add Role</button>
        </div>
        <table className="table">
          <thead><tr><th>Role</th><th>Wage / hour</th><th>Del</th></tr></thead>
          <tbody>
            {roles.map(role=> (
              <tr key={role}>
                <td>{role}</td>
                <td><input className="input w-32" value={wageRates[role] ?? 0} onChange={e=>{
                  const val = Number(e.target.value||0); setWageRates({...wageRates, [role]: val});
                }}/></td>
                <td><button className="btn-danger" onClick={()=>{
                  const nextRoles = roles.filter(r=>r!==role);
                  const {[role]:_, ...rest} = wageRates; setRoles(nextRoles); setWageRates(rest);
                }}>✖</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-white/60 text-sm">Note: Salaries on Staff page = Total hours × wage/hour per role.</div>
      </div>
      <div className="text-white/60">Tip: सभी डेटा आपके ब्राउज़र के localStorage में सुरक्षित रहता है—इंटरनेट के बिना भी काम करेगा।</div>
    </div>
  )
}
