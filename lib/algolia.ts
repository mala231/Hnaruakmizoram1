import { algoliasearch } from "algoliasearch";
import { prisma } from "./prisma";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "";
const adminKey = process.env.ALGOLIA_ADMIN_API_KEY || "";
const indexName = "job_posts";

/** Safely truncate a string to a max char length */
function truncate(str: string | null | undefined, maxChars: number): string {
  if (!str) return "";
  return str.length > maxChars ? str.slice(0, maxChars) + "…" : str;
}

/** Strip base64 data URIs — they are too large for Algolia records. Return null so UI falls back to placeholder. */
function safeLogoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:")) return null; // base64 blob — too large
  return url;
}

/**
 * Checks if credentials are fully configured and are not placeholder strings.
 */
export const isAlgoliaConfigured = (): boolean => {
  return (
    appId !== "" &&
    appId !== "your_algolia_app_id" &&
    searchKey !== "" &&
    searchKey !== "your_search_only_api_key" &&
    adminKey !== "" &&
    adminKey !== "your_admin_write_api_key"
  );
};

// Initialize admin client only if configured and in server/Node environment
let client: any = null;
if (typeof window === "undefined" && isAlgoliaConfigured()) {
  client = algoliasearch(appId, adminKey);
}

/**
 * Syncs a single job post to Algolia.
 * If the job status is 'live' and employer is active, it adds/updates the record.
 * Otherwise, it deletes it from the index to ensure only active search results exist.
 */
export async function syncJobToAlgolia(jobId: string) {
  if (!isAlgoliaConfigured() || !client) return;

  try {
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { employer: true, category: true, location: true },
    });

    if (!job || job.status !== "live" || job.employer.isDeleted) {
      // Delete from index if not live or if employer is soft-deleted
      await client.deleteObject({
        indexName,
        objectID: jobId,
      });
      return;
    }

    // Save/Update index record (description excluded — too large for Algolia free tier)
    await client.saveObject({
      indexName,
      body: {
        objectID: job.id,
        title: truncate(job.title, 200),
        shortDescription: truncate(job.shortDescription, 500),
        categoryId: job.categoryId,
        categoryName: job.category.name,
        locationId: job.locationId,
        locationName: job.location.name,
        address: truncate(job.address, 200),
        deadline: job.deadline.toISOString(),
        interviewTime: truncate(job.interviewTime, 300),
        status: job.status,
        durationDays: job.durationDays,
        expiresAt: job.expiresAt ? job.expiresAt.toISOString() : null,
        createdAt: job.createdAt.toISOString(),
        employerName: truncate(job.employer.username, 100),
        employerLogoUrl: safeLogoUrl(job.employer.logoUrl),
        employerIsVerified: job.employer.isVerified,
      },
    });
  } catch (error) {
    console.error(`[Algolia Sync Error] Failed to sync job ${jobId}:`, error);
  }
}

/**
 * Deletes a single job post from Algolia.
 */
export async function deleteJobFromAlgolia(jobId: string) {
  if (!isAlgoliaConfigured() || !client) return;

  try {
    await client.deleteObject({
      indexName,
      objectID: jobId,
    });
  } catch (error) {
    console.error(`[Algolia Sync Error] Failed to delete job ${jobId}:`, error);
  }
}

/**
 * Deletes multiple job posts from Algolia.
 */
export async function deleteMultipleJobsFromAlgolia(jobIds: string[]) {
  if (!isAlgoliaConfigured() || !client || jobIds.length === 0) return;

  try {
    await client.deleteObjects({
      indexName,
      objectIDs: jobIds,
    });
  } catch (error) {
    console.error(`[Algolia Sync Error] Failed to delete multiple jobs:`, error);
  }
}

/**
 * Rebuilds the entire Algolia index with all live, active job posts.
 */
export async function rebuildAlgoliaIndex() {
  if (!isAlgoliaConfigured() || !client) return;

  try {
    const jobs = await prisma.jobPost.findMany({
      where: {
        status: "live",
        employer: { isDeleted: false },
      },
      include: { employer: true, category: true, location: true },
    });

    // description excluded — too large for Algolia free tier (10KB/record limit)
    const objects = jobs.map((job) => ({
      objectID: job.id,
      title: truncate(job.title, 200),
      shortDescription: truncate(job.shortDescription, 500),
      categoryId: job.categoryId,
      categoryName: job.category.name,
      locationId: job.locationId,
      locationName: job.location.name,
      address: truncate(job.address, 200),
      deadline: job.deadline.toISOString(),
      interviewTime: truncate(job.interviewTime, 300),
      status: job.status,
      durationDays: job.durationDays,
      expiresAt: job.expiresAt ? job.expiresAt.toISOString() : null,
      createdAt: job.createdAt.toISOString(),
      employerName: truncate(job.employer.username, 100),
      employerLogoUrl: safeLogoUrl(job.employer.logoUrl),
      employerIsVerified: job.employer.isVerified,
    }));

    if (objects.length > 0) {
      await client.saveObjects({
        indexName,
        objects,
      });
    }
  } catch (error) {
    console.error("[Algolia Sync Error] Failed to rebuild Algolia index:", error);
    throw error;
  }
}
