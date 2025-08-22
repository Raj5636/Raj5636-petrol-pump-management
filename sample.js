export const todayStr = () => new Date().toISOString().slice(0,10);

export const sample = () => ({
  settings: {
    station: 'Your Pump Name',
    currency: '₹',
    rates: { Petrol: 102.5, Diesel: 94.75, CNG: 85 },
    shifts: { day: ['06:00','14:00'], night: ['14:00','22:00'] }
  },
  inventory: [
    { id:'A', name:'Tank A', fuel:'Petrol', capacity:20000, stock:12000 },
    { id:'B', name:'Tank B', fuel:'Diesel', capacity:25000, stock:15000 },
    { id:'C', name:'CNG Bank', fuel:'CNG', capacity:10000, stock:7000 },
  ],
  staff: [
    { id:'S1', name:'Ravi', role:'Salesman', mobile:'98xxxxxx10', attendance:true, nozzles:['P-01','P-02']},
    { id:'S2', name:'Anita', role:'Clerk', mobile:'98xxxxxx22', attendance:false, nozzles:[]},
    { id:'S3', name:'Sanjay', role:'Manager', mobile:'98xxxxxx33', attendance:false, nozzles:['C-01']},
  ],
  customers: [
    { id:'CUST1', name:'Sharma Transport', mobile:'98xxxxxx1', balance:49215, ledger:[{date:todayStr(), type:'sale', amount:49215, ref:'C-01'}]}
  ],
  sales: [
    { id:1, date: todayStr(), nozzle:'P-01', fuel:'Petrol', opening:1000, closing:1600, testing:0, rate:102.5, qty:600, amount:61500, payment:'UPI', salesman:'Ravi' },
    { id:2, date: todayStr(), nozzle:'P-02', fuel:'Petrol', opening:500, closing:1150, testing:0, rate:102.5, qty:650, amount:66625, payment:'Cash', salesman:'Ravi' },
    { id:3, date: todayStr(), nozzle:'D-01', fuel:'Diesel', opening:200, closing:1100, testing:0, rate:94.75, qty:900, amount:85275, payment:'Card', salesman:'Anita' },
    { id:4, date: todayStr(), nozzle:'C-01', fuel:'CNG', opening:0, closing:579, testing:0, rate:85, qty:579, amount:49215, payment:'Credit', customer:'Sharma Transport', salesman:'Sanjay' },
  ]
});
