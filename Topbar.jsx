import React from 'react'

export default function Topbar({onSave,onPrint,dark, setDark, onSample, onReset, user, onLogout}){
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    const html = document.documentElement;
    if(next) html.classList.add('dark'); else html.classList.remove('dark');
    localStorage.setItem('ppro_dark', next ? '1':'0');
  }
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {/* Logo placeholder */}
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain" />
        </div>
        <div>
          <div className="font-bold text-lg">PETROL PUMP PRO+ v4</div>
          <div className="text-xs text-white/60">Invoice PDF • Credit Modes • Staff Roles</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {onSample && (!user || user.role!=='Staff') && (
          <button className="btn btn-primary" onClick={onSample}>⚡ Sample Data</button>
        )}
        {onReset && user?.role==='Admin' && (
          <button className="btn btn-danger" onClick={onReset}>♻️ Reset</button>
        )}
        {user?.role!=='Staff' && <button className="btn btn-success" onClick={onSave}>💾 Save</button>}
        <button className="btn btn-primary" onClick={onPrint}>🖨 Print</button>
        <div className="relative">
          <button className="btn" onClick={toggleDark}>{dark ? '🌞 Light' : '🌙 Dark'}</button>
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{color: 'var(--text-color)'}}>{user.name} ({user.role})</span>
            <button className="btn" onClick={onLogout}>↩ Logout</button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
