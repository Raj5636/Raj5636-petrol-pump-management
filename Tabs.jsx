import React from 'react'

const TabBtn = ({active, label, onClick, icon, colorClass}) => (
  <button onClick={onClick}
    className={`pill ${colorClass} ${active ? 'active ring-2 ring-offset-2 ring-offset-black/0' : ''}`}>
    <span>{icon}</span>{label}
  </button>
);

export default function Tabs({tab, setTab, role='Admin'}){
  const items = [
    ['dashboard','📊','Dashboard','tab-blue',['Admin','Manager','Staff']],
    ['sales','🧾','Sales Entry','tab-green',['Admin','Manager','Staff']],
    ['inventory','📦','Inventory','tab-blue',['Admin','Manager']],
    ['reports','📈','Reports','tab-purple',['Admin','Manager']],
    ['ledger','📒','Credit Ledger','tab-orange',['Admin','Manager']],
    ['staff','👥','Staff','tab-amber',['Admin','Manager']],
    ['settings','⚙️','Settings','tab-slate',['Admin']],
  ];
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {items.filter(([,,, ,roles])=> roles.includes(role)).map(([key,icon,label,color]) => (
        <TabBtn key={key} active={tab===key} onClick={()=>setTab(key)} label={label} icon={icon} colorClass={color}/>
      ))}
    </div>
  )
}
