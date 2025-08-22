import React from 'react'
import { sample } from '../utils/sample'

export default function Sample({state, setState}){
  const loadSample = ()=> {
    setState(sample());
    alert('Sample data loaded (not saved). Use Save to persist.');
  }
  const resetAll = ()=> {
    localStorage.removeItem('ppro_state');
    location.reload();
  }
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="text-lg font-semibold mb-2">Sample Data</div>
        <div className="text-white/70 mb-4">Quickly prefill the app with realistic demo data for testing.</div>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={loadSample}>⚡ Load Sample Data</button>
          <button className="btn btn-danger" onClick={resetAll}>♻️ Reset All</button>
        </div>
      </div>
      <div className="card p-5">
        <div className="font-semibold mb-2">What it includes</div>
        <ul className="list-disc pl-6 text-white/80 space-y-1">
          <li>Settings: rates, shifts, roles, wage rates</li>
          <li>Inventory: 3 tanks with stock</li>
          <li>Staff: 3 members with roles</li>
          <li>Sales: Today’s example entries</li>
        </ul>
      </div>
    </div>
  )
}





