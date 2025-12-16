
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
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

    console.log('All Clients:', clients.map(c => ({ id: c.id, name: c.name, company: c.company, quotes: c._count.quotes })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
