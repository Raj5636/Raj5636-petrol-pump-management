import React, { useState } from 'react'

export default function Login({state, setUser}){
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')

  const demoUsers = [
    {id:'u-admin', name:'Administrator', username:'admin', password:'admin123', role:'Admin'},
    {id:'u-manager', name:'Manager', username:'manager', password:'manager123', role:'Manager'},
    {id:'u-staff', name:'Staff', username:'staff', password:'staff123', role:'Staff'},
  ]
  const users = (state.settings?.users && state.settings.users.length>0) ? state.settings.users : demoUsers
  const submit = (e)=>{
    e.preventDefault();
    const u = users.find(u=> u.username===username && u.password===password)
    if(!u){ setError('Invalid username or password'); return; }
    setUser({ id:u.id, name:u.name, role:u.role })
  }

  return (
    <div className="card p-6 max-w-md mx-auto">
      <div className="text-xl font-semibold mb-4">Login</div>
      <form onSubmit={submit} className="space-y-3">
        <input className="input w-full" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" className="input w-full" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-300 text-sm">{error}</div>}
        <button className="btn btn-primary w-full" type="submit">Login</button>
        <div className="text-white/60 text-xs">Demo users: admin/admin123, manager/manager123, staff/staff123</div>
      </form>
    </div>
  )
}


