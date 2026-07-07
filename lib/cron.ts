import cron from "node-cron";
import { prisma } from "./prisma";
import { sendPreExpiryWarnings } from "./email";
import { deleteMultipleJobsFromAlgolia } from "./algolia";

const globalForCron = global as unknown as { isCronStarted?: boolean };

/**
 * Initializes and registers the background cron scheduler tasks.
 * Prevents double-registration on server reloads.
 */
export function startCronJobs() {
  if (globalForCron.isCronStarted) {
    console.log("[Cron Service] Already started. Skipping double-registration.");
    return;
  }

  globalForCron.isCronStarted = true;
  console.log("[Cron Service] Initializing background task scheduler...");

  // Schedule task to run at midnight every day (0 0 * * *)
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron Task] Running daily job posts status checks...");
    try {
      const now = new Date();

      // Fetch IDs of live jobs matching expiry condition to remove from Algolia
      const jobsToExpire = await prisma.jobPost.findMany({
        where: {
          status: "live",
          expiresAt: {
            lte: now,
          },
        },
        select: { id: true }
      });
      const expiredIds = jobsToExpire.map((job) => job.id);

      // 1. Soft-expire job postings that are live and past their expiresAt date
      const expiredCount = await prisma.jobPost.updateMany({
        where: {
          id: { in: expiredIds },
        },
        data: {
          status: "expired",
        },
      });

      // Remove from Algolia
      if (expiredIds.length > 0) {
        await deleteMultipleJobsFromAlgolia(expiredIds);
      }

      console.log(
        `[Cron Task] Expired check complete. Marked ${expiredCount.count} posts as expired.`
      );

      // 2. Dispatch pre-expiry notifications to employers (expiring in 3 days)
      const warningsSent = await sendPreExpiryWarnings();
      console.log(
        `[Cron Task] Daily checks successfully completed. Warnings sent: ${warningsSent}`
      );
    } catch (err) {
      console.error("[Cron Task Error] Daily post checking failed:", err);
    }
  });

  console.log("[Cron Service] Scheduler successfully registered midnight cron (0 0 * * *).");
}
export default startCronJobs;
