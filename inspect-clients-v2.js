
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
        console.log('Loaded env vars manually.');
    }
} catch (e) {
    console.error('Failed to load .env', e);
}

const prisma = new PrismaClient();

async function main() {
    const clients = await prisma.client.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { quotes: true }
            }
        }
    });
    console.log('Total Clients:', clients.length);
    const pegaduro = clients.find(c => c.name.toLowerCase().includes('pegaduro') || (c.company && c.company.toLowerCase().includes('pegaduro')));

    if (pegaduro) {
        console.log('Pegaduro Client Found:', pegaduro);
    } else {
        console.log('Pegaduro Client NOT Found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
