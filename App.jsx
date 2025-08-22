import React, { useEffect, useState } from 'react'
import Topbar from './components/Topbar.jsx'
import Tabs from './components/Tabs.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Sales from './pages/Sales.jsx'
import Inventory from './pages/Inventory.jsx'
import Reports from './pages/Reports.jsx'
import Ledger from './pages/Ledger.jsx'
import Staff from './pages/Staff.jsx'
import Settings from './pages/Settings.jsx'
import Sample from './pages/Sample.jsx'
import Login from './pages/Login.jsx'
import { load, save } from './utils/storage.js'

export default function App(){
  const [state,setState] = useState(load('ppro_state', { settings:{ currency:'₹', rates:{Petrol:0,Diesel:0,CNG:0}, costRates:{Petrol:0,Diesel:0,CNG:0}, shifts:{day:['06:00','14:00'], night:['14:00','22:00']}, roles:['Manager','Salesman','Sweeper','Guard','Clerk'], wageRates:{Manager:0,Salesman:0,Sweeper:0,Guard:0,Clerk:0}, users:[
    {id:'u-admin', name:'Administrator', username:'admin', password:'admin123', role:'Admin'},
    {id:'u-manager', name:'Manager', username:'manager', password:'manager123', role:'Manager'},
    {id:'u-staff', name:'Staff', username:'staff', password:'staff123', role:'Staff'},
  ], nozzles:[] }, inventory:[], staff:[], customers:[], sales:[], attendance:[], closures:[], audit:[] }))
  const [tab,setTab] = useState('dashboard')
  const [dark,setDark] = useState(()=>{
    const saved = localStorage.getItem('ppro_dark');
    return saved ? saved === '1' : false; // Default to light mode
  })
  const [user, setUser] = useState(()=>{
    try { const raw = localStorage.getItem('ppro_user'); return raw? JSON.parse(raw): null } catch { return null }
  })

  useEffect(()=>{
    if(dark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
  },[dark])

  const onSave = ()=> { save('ppro_state', state); alert('Saved to localStorage') }
  const onPrint = ()=> window.print()
  const onReset = ()=> {
    if(confirm('All saved data will be removed and the app will reload. Continue?')){
      localStorage.removeItem('ppro_state');
      location.reload();
    }
  }
  const onLogout = ()=> { localStorage.removeItem('ppro_user'); setUser(null); }

  // permissions per tab
  const canAccess = (key)=>{
    const role = user?.role || 'Guest'
    const allow = {
      dashboard:['Admin','Manager','Staff'],
      sales:['Admin','Manager','Staff'],
      inventory:['Admin','Manager'],
      reports:['Admin','Manager'],
      ledger:['Admin','Manager'],
      staff:['Admin','Manager'],
      settings:['Admin'],
      sample:['Admin','Manager']
    }
    const allowed = allow[key] || []
    return allowed.includes(role)
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)'
    }}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Topbar onSave={onSave} onPrint={onPrint} dark={dark} setDark={setDark} onSample={()=>setTab('sample')} onReset={onReset} user={user} onLogout={onLogout} />
        {!user ? (
          <Login state={state} setUser={(u)=>{ setUser(u); localStorage.setItem('ppro_user', JSON.stringify(u)); }} />
        ) : (
        <>
        <Tabs tab={tab} setTab={setTab} role={user.role} />
        {tab==='dashboard' && <Dashboard state={state} />}
        {tab==='sales' && (canAccess('sales') ? <Sales state={state} setState={setState} role={user.role} user={user} /> : <div className="text-red-300">Access denied</div>)}
        {tab==='inventory' && (canAccess('inventory') ? <Inventory state={state} setState={setState} role={user.role} user={user} /> : <div className="text-red-300">Access denied</div>)}
        {tab==='reports' && (canAccess('reports') ? <Reports state={state} setState={setState} /> : <div className="text-red-300">Access denied</div>)}
        {tab==='ledger' && (canAccess('ledger') ? <Ledger state={state} setState={setState} /> : <div className="text-red-300">Access denied</div>)}
        {tab==='staff' && (canAccess('staff') ? <Staff state={state} setState={setState} currentRole={user.role} user={user} /> : <div className="text-red-300">Access denied</div>)}
        {tab==='settings' && (canAccess('settings') ? <Settings state={state} setState={setState} user={user} /> : <div className="text-red-300">Access denied</div>)}
        {tab==='sample' && (canAccess('sample') ? <Sample state={state} setState={setState} /> : <div className="text-red-300">Access denied</div>)}
        </>
        )}
      </div>
    </div>
  )
}
