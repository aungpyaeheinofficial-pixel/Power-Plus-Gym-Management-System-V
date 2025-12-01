import { pool } from './db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    console.log('Test query result:', rows);
    
    // Test table existence
    const [tables]: any = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'power_plus_gym'
    `);
    
    console.log(`\n📊 Found ${tables.length} tables:`);
    tables.forEach((table: any) => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();

