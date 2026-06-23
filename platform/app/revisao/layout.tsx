import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/session";

export default async function RevisaoLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.emailVerified) redirect("/verificar-email");

  return <div className="flex-1">{children}</div>;
}
