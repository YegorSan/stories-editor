import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}
