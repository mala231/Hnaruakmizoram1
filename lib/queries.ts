import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";

export const getCachedCategories = unstable_cache(
  async () => {
    try {
      return await prisma.category.findMany({ orderBy: { name: "asc" } });
    } catch (error) {
      console.error("[getCachedCategories] Database query failed:", error);
      throw error;
    }
  },
  ["categories-list"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getCachedDistricts = unstable_cache(
  async () => {
    try {
      return await prisma.location.findMany({ orderBy: { name: "asc" } });
    } catch (error) {
      console.error("[getCachedDistricts] Database query failed:", error);
      throw error;
    }
  },
  ["districts-list"],
  { revalidate: 3600, tags: ["districts"] }
);

export const getCachedAdvertisements = unstable_cache(
  async () => {
    try {
      return await prisma.advertisement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("[getCachedAdvertisements] Database query failed:", error);
      throw error;
    }
  },
  ["active-advertisements"],
  { revalidate: 600, tags: ["advertisements"] }
);

