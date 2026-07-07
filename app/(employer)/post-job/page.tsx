import { cookies } from "next/headers";
import PostJobForm from "@/components/PostJobForm";

export default async function PostJobPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  return <PostJobForm lang={lang} />;
}
