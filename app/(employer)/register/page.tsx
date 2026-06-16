import { cookies } from "next/headers";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-container-margin-mobile">
      <RegisterForm lang={lang} />
    </div>
  );
}
