
import { PrismaClient } from '@prisma/client'

async function testConnection(url: string, name: string) {
    console.log(`Testing ${name}...`);
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });

    try {
        await prisma.$connect();
        console.log(`✅ ${name} connected successfully!`);
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);
        return true;
    } catch (error: any) {
        console.log(`❌ ${name} failed: ${error.message}`);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const urls = [
        {
            name: "Current .env (llmjxownrgthtinxnshf)",
            url: "postgresql://postgres.llmjxownrgthtinxnshf:1LH3u8ItJw07Q8Fy@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
        },
        {
            name: "Alternative (itgmrlrjbnlawkwpgnuw)",
            url: "postgresql://postgres.itgmrlrjbnlawkwpgnuw:WKZwwlw7hMfy5YxJ@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
        },
        {
            name: "Direct Host (llmjxownrgthtinxnshf)",
            url: "postgresql://postgres:1LH3u8ItJw07Q8Fy@db.llmjxownrgthtinxnshf.supabase.com:5432/postgres" // Note: it's usually .com not .co, though both might resolve
        },
        {
            name: "History ID (kwwcuusshxtgxjicmzbv)",
            url: "postgresql://postgres.kwwcuusshxtgxjicmzbv:OJ2fKLERDlDY0jaS@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
        },
        {
            name: "Current ID with Pooler Port (6543)",
            url: "postgresql://postgres.llmjxownrgthtinxnshf:1LH3u8ItJw07Q8Fy@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
        }
    ];

    for (const item of urls) {
        await testConnection(item.url, item.name);
        console.log('---');
    }
}

main();
