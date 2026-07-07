import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // 1. Verify Employer Session Auth
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("employer_session")?.value;
  const lang = cookieStore.get("lang")?.value || "mz";

  if (!sessionCookie) {
    redirect("/login");
  }

  const payload = await verifyJWT(sessionCookie);
  if (!payload || payload.role !== "employer") {
    redirect("/login");
  }

  // 2. Fetch Employer Profile
  const employer = await prisma.employer.findUnique({
    where: { id: payload.userId },
  });

  if (!employer || employer.isDeleted) {
    // Clear session and redirect if employer is deleted
    redirect("/login");
  }

  // 3. Fetch Job Listings (excluding only soft-deleted ones)
  const jobs = await prisma.jobPost.findMany({
    where: {
      employerId: payload.userId,
      status: { not: "deleted" }, // Show all statuses: live, pending, rejected, expired, draft
    },
    include: {
      category: true,
      location: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 4. Fetch confirmed payments
  const payments = await prisma.payment.findMany({
    where: {
      employerId: payload.userId,
      status: "confirmed", // Only show successful payments
    },
    include: {
      jobPost: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <DashboardClient
      lang={lang}
      employer={{
        username: employer.username,
        email: employer.email,
        phone: employer.phone,
        address: employer.address,
        logoUrl: employer.logoUrl,
        isVerified: employer.isVerified,
      }}
      jobs={jobs.map((j) => ({
        id: j.id,
        title: j.title,
        shortDescription: j.shortDescription,
        status: j.status,
        durationDays: j.durationDays,
        expiresAt: j.expiresAt ? j.expiresAt.toISOString() : null,
        deadline: j.deadline.toISOString(),
        createdAt: j.createdAt.toISOString(),
        category: { name: j.category.name },
        location: { name: j.location.name },
      }))}
      payments={payments.map((p) => ({
        id: p.id,
        razorpayOrderId: p.razorpayOrderId,
        razorpayPaymentId: p.razorpayPaymentId,
        amount: Number(p.amount),
        durationDays: p.durationDays,
        createdAt: p.createdAt.toISOString(),
        jobPost: { title: p.jobPost?.title || "Deleted Listing" },
      }))}
    />
  );
}
