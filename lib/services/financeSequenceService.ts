import { prisma } from "@/lib/db";

/** Atomic counter backing invoice/receipt numbering — avoids the collisions/gaps
 *  a `count()`-based numbering scheme risks under concurrent creation. */
export async function nextSequence(key: "INVOICE" | "RECEIPT"): Promise<number> {
  const row = await prisma.financeSequence.upsert({
    where: { key },
    update: { value: { increment: 1 } },
    create: { key, value: 1 },
  });
  return row.value;
}
