const { Client } = require('pg');
const c = new Client({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.zdqxygisywmjoeimjflc',
    password: 'wBJs/y?P!d.%U6w',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
});

c.connect()
    .then(() => c.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name'))
    .then((r) => {
        console.log('✅ All tables in database:');
        r.rows.forEach(row => console.log(`- ${row.table_name}`));
        return c.query('SELECT * FROM wallet LIMIT 5');
    })
    .then((r) => {
        console.log('\n✅ Sample wallet records:');
        console.log(JSON.stringify(r.rows, null, 2));
        c.end();
    })
    .catch((e) => {
        console.log('❌ ERROR:', e.message);
        c.end();
    });