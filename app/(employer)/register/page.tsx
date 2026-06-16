import { cookies } from "next/headers";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  return <RegisterForm lang={lang} />;
}
