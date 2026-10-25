import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/editor";

  return (
    <div className="min-h-dvh bg-table text-bone">
      <SiteHeader />
      <main className="px-5 py-12 md:px-10">
        <AuthForm mode="login" callbackUrl={next} />
      </main>
      <SiteFooter />
    </div>
  );
}
