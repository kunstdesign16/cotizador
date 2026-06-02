/**
 * Script de Migración: Corregir IVA en egresos de órdenes de compra históricas.
 *
 * PROBLEMA ANTERIOR:
 *   En registerOrderPayment, el campo `amount` almacenaba el monto TOTAL (con IVA incluido),
 *   y el campo `iva` se calculaba como: amount - (amount / 1.16), que es el IVA inclusivo.
 *   Esto causaba que:
 *     - `amount` = totalConIVA (incorrecto, debería ser subtotal)
 *     - `iva` = amount - amount/1.16 (IVA calculado sobre el total, no sobre el subtotal)
 *
 * CORRECCIÓN:
 *   Después de esta migración:
 *     - `amount` = subtotal (sin IVA) = totalConIVA / 1.16
 *     - `iva` = subtotal * 0.16 = amount * 0.16
 *
 * NOTA: Esta migración es IDEMPOTENTE. Si el campo `iva` ya es ~16% del `amount`,
 *       significa que ya fue migrado y se omite.
 *
 * Para ejecutar:
 *   npx ts-node -e "require('./scripts/migrate-expenses.ts')"
 *   O: npx tsx scripts/migrate-expenses.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Iniciando migración de IVA en egresos de órdenes de compra...\n')

    // Obtener todos los egresos vinculados a una orden de compra
    const expenses = await prisma.variableExpense.findMany({
        where: {
            supplierOrderId: { not: null }
        },
        select: {
            id: true,
            amount: true,
            iva: true,
            description: true
        }
    })

    console.log(`📊 Encontrados ${expenses.length} egresos vinculados a órdenes de compra.\n`)

    let corrected = 0
    let skipped = 0

    for (const expense of expenses) {
        const { id, amount, iva, description } = expense
        const expectedIva = amount * 0.16
        const tolerance = 0.02 // 2 centavos de tolerancia

        // Si el IVA ya es ~16% del amount, ya está correcto (fue migrado o registrado correctamente)
        const isAlreadyCorrect = Math.abs((iva || 0) - expectedIva) < tolerance

        if (isAlreadyCorrect) {
            // console.log(`  ✓ SKIP: ${description} — amount: ${amount}, iva: ${iva} (ya correcto)`)
            skipped++
            continue
        }

        // El IVA actual NO es ~16% del amount. Esto puede significar:
        // A) El amount incluye IVA (amount = totalConIVA, iva = amount - amount/1.16)
        //    → En este caso, el verdadero subtotal es amount/1.16
        //    → El verdadero iva es subtotal * 0.16 = amount/1.16 * 0.16

        const subtotal = amount / 1.16
        const correctIva = subtotal * 0.16

        console.log(`  🔄 Corrigiendo: "${description}"`)
        console.log(`     ANTES: amount=${amount.toFixed(2)}, iva=${(iva || 0).toFixed(2)}`)
        console.log(`     DESPUÉS: amount=${subtotal.toFixed(2)}, iva=${correctIva.toFixed(2)}\n`)

        await (prisma as any).variableExpense.update({
            where: { id },
            data: {
                amount: parseFloat(subtotal.toFixed(2)),
                iva: parseFloat(correctIva.toFixed(2))
            }
        })

        corrected++
    }

    console.log('\n✅ Migración completada:')
    console.log(`   - Corregidos: ${corrected}`)
    console.log(`   - Omitidos (ya correctos): ${skipped}`)
    console.log(`   - Total procesados: ${expenses.length}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
