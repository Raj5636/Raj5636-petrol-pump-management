import React from 'react'
import { fmt } from '../utils/storage'

const Card = ({title, value}) => (
  <div className="card p-5 grad-card">
    <div className="text-white/80 text-sm">{title}</div>
    <div className="text-3xl font-extrabold mt-1">{value}</div>
  </div>
);

const BarChart = ({data=[10,13,8,14,15,9,12]}) => {
  const h = 120; const w = 220; const max = Math.max(...data,1);
  const bw = w / data.length - 6;
  return (
    <svg width={w} height={h} className="block">
      {data.map((v,i)=>{
        const x = i*(bw+6)+3;
        const barH = (v/max)*(h-20);
        return <rect key={i} x={x} y={h-barH} width={bw} height={barH} rx="6" className="fill-white/70" />
      })}
    </svg>
  )
}

export default function Dashboard({state}){
  const { sales=[], settings={} } = state;
  const inventory = state.inventory || [];
  const sum = (f) => sales.reduce((a,s)=>a+f(s),0);
  const tot = {
    Petrol: sum(s=> s.fuel==='Petrol'? s.amount:0),
    Diesel: sum(s=> s.fuel==='Diesel'? s.amount:0),
    CNG: sum(s=> s.fuel==='CNG'? s.amount:0),
  };
  const grand = tot.Petrol + tot.Diesel + tot.CNG;
  const lowStocks = inventory.filter(t=> Number(t.capacity||0)>0 && Number(t.stock||0) <= 0.2*Number(t.capacity||0));

  const nozzles = Array.from(new Set(sales.map(s=>s.nozzle))).map(n=> ({
    nozzle: n, fuel: sales.find(s=>s.nozzle===n)?.fuel || '-', status: 'Active',
    today: sales.filter(s=>s.nozzle===n).reduce((a,b)=>a+b.amount,0)
  }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card title="आज की Petrol बिक्री" value={fmt(tot.Petrol, settings)} />
        <Card title="आज की Diesel बिक्री" value={fmt(tot.Diesel, settings)} />
        <Card title="आज की CNG बिक्री" value={fmt(tot.CNG, settings)} />
        <Card title="कुल दैनिक बिक्री" value={fmt(grand, settings)} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="font-semibold mb-2">7-दिन बिक्री ट्रेंड</div>
          <BarChart />
        </div>
        <div className="card p-5 md:col-span-2">
          <div className="font-semibold mb-2">नोज़ल स्टेटस</div>
          <table className="table">
            <thead><tr><th>Nozzle</th><th>Fuel</th><th>Status</th><th>आज की बिक्री (₹)</th></tr></thead>
            <tbody>
              {nozzles.map((n,i)=>(
                <tr key={i}>
                  <td>{n.nozzle}</td><td>{n.fuel}</td>
                  <td><span className="px-3 py-1 rounded-full bg-green-600/20 text-green-400">Active</span></td>
                  <td>{fmt(n.today, settings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-1 gap-4">
        <div className="card p-5">
          <div className="font-semibold mb-2">⚠️ Low Stock Alerts</div>
          {lowStocks.length===0 ? (
            <div className="text-white/60 text-sm">All tanks are OK (above 20% capacity).</div>
          ) : (
            <table className="table">
              <thead><tr><th>Tank</th><th>Fuel</th><th>Stock</th><th>Capacity</th><th>Level</th></tr></thead>
              <tbody>
                {lowStocks.map((t)=>{
                  const cap = Number(t.capacity||0); const stk = Number(t.stock||0);
                  const pct = cap>0 ? Math.round((stk/cap)*100) : 0;
                  return (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.fuel}</td>
                      <td>{stk}</td>
                      <td>{cap}</td>
                      <td><span className="text-yellow-400 font-semibold">{pct}%</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
