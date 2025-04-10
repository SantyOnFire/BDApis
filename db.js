const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.kpabkzqdblvieyiihhal:Santy2024%233.@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error adquiriendo cliente', err.stack);
  } else {
    console.log('✅ Conexión exitosa a la base de datos');
    release();
  }
});

module.exports = pool;
