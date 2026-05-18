const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'comisio',
    password: '12345.',
    port: 5432,
});

async function runMigrate() {
    try {
        console.log('Running migration...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY,
                user_id UUID,
                title VARCHAR(255),
                message TEXT,
                type VARCHAR(50),
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await pool.query(`
            DO $$ BEGIN
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID;
                ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
            EXCEPTION WHEN OTHERS THEN NULL;
            END $$;
        `);
        console.log('Migration done.');
    } catch(err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
runMigrate();
