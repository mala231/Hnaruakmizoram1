import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCachedCategories, getCachedDistricts } from "@/lib/queries";
import { verifyJWT } from "@/lib/auth";
import EditJobForm from "./EditJobForm";

interface EditJobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;

  // 1. Verify Employer Auth
  const cookieStore = await cookies();
  const token = cookieStore.get("employer_session")?.value;
  if (!token) {
    redirect("/login");
  }

  const payload = await verifyJWT(token);
  if (!payload || payload.role !== "employer") {
    redirect("/login");
  }

  // 2. Fetch Job Details & Check Ownership
  const job = await prisma.jobPost.findUnique({
    where: { id },
  });

  if (!job) {
    redirect("/dashboard");
  }

  if (job.employerId !== payload.userId) {
    redirect("/dashboard");
  }

  // 3. Fetch Category and Location Dropdown lists
  const [categories, locations] = await Promise.all([
    getCachedCategories(),
    getCachedDistricts(),
  ]);

  return (
    <div className="flex-grow bg-background py-12 px-container-margin-mobile md:px-container-margin-desktop">
      <EditJobForm job={job} categories={categories} locations={locations} />
    </div>
  );
}
