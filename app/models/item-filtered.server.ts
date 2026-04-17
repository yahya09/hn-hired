import { prisma } from "~/db.server";
import { Prisma } from "@prisma/client";
import type { Tag } from "~/models/tag.server";
import type { Item } from "@prisma/client";

type ItemWithTags = Item & {
  tags: Tag[];
};

export type { ItemWithTags };

interface FilteredQueryOptions {
  storyId: number;
  sort?: "asc" | "desc";
}

/**
 * Returns items flagged as "forMe" — curated by AI classification:
 * - Genuinely remote, open to non-US/EU candidates
 * - Software engineer / fullstack / backend roles
 */
export async function getFilteredItems(options: FilteredQueryOptions) {
  const { storyId, sort = "desc" } = options;
  const firebaseCreatedAt =
    sort === "desc" ? Prisma.SortOrder.desc : Prisma.SortOrder.asc;

  const where = { storyId, forMe: true };

  return prisma.$transaction([
    // @ts-ignore
    prisma.item.count({ where }),
    prisma.item.findMany({
      take: 200,
      // @ts-ignore
      where,
      orderBy: [{ firebaseCreatedAt }],
      include: { tags: true },
    }),
  ]);
}
