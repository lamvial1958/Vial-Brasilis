import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/session";

export default async function LicoesLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return <div className="flex-1">{children}</div>;
}
