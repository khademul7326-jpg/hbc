import type { Prisma } from "@prisma/client";
import { serializeStoreProduct } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";

export function buildProductSearchWhere(
  query: string,
  scope: "all" | "name" = "all",
): Prisma.AcharProductWhereInput {
  const nameMatches: Prisma.AcharProductWhereInput[] = [
    { name: { contains: query, mode: "insensitive" } },
    { englishName: { contains: query, mode: "insensitive" } },
  ];

  if (scope === "name") {
    return { isActive: true, OR: nameMatches };
  }

  return {
    isActive: true,
    OR: [
      ...nameMatches,
      { category: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { shortDesc: { contains: query, mode: "insensitive" } },
      { ingredients: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { tags: { has: query } },
    ],
  };
}

export async function searchStoreProducts(query: string, take: number, scope: "all" | "name" = "all") {
  const records = await prisma.acharProduct.findMany({
    where: buildProductSearchWhere(query, scope),
    orderBy: { createdAt: "desc" },
    take,
  });

  return records.map(serializeStoreProduct);
}
