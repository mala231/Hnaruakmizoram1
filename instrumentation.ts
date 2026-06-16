export async function register() {
  // We only run this in Node.js server side environment to prevent client-side execution issues
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCronJobs } = await import("./lib/cron");
    startCronJobs();
  }
}
