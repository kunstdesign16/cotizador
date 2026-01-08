import { Client } from 'pg';

async function test() {
    const connectionString = 'postgresql://postgres:1LH3u8ItJw07Q8Fy@db.llmjxownrgthtinxnshf.supabase.co:5432/postgres';
    console.log('Testing connection to:', connectionString);
    const client = new Client({
        connectionString: connectionString,
        connectionTimeoutMillis: 5000,
    });

    try {
        await client.connect();
        console.log('Successfully connected!');
        const res = await client.query('SELECT NOW()');
        console.log('Result:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

test();
