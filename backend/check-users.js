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
    .then(() => c.query('SELECT id, phone, "fullName", role, status, "createdAt" FROM users ORDER BY "createdAt" DESC'))
    .then((r) => {
        console.log('✅ All users in database:');
        console.log(JSON.stringify(r.rows, null, 2));
        console.log(`Total users: ${r.rows.length}`);
        c.end();
    })
    .catch((e) => {
        console.log('❌ ERROR:', e.message);
        c.end();
    });