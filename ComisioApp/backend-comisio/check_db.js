const {Client} = require('pg');
const c = new Client({user:'postgres', password:'12345.', host:'localhost', database:'comisio'});
c.connect().then(()=>c.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")).then(res=>{console.log(res.rows); c.end()}).catch(console.error);
