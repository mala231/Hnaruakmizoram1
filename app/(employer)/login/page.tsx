import { cookies } from "next/headers";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-container-margin-mobile">
      <LoginForm lang={lang} />
    </div>
  );
}
