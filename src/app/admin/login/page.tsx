import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/admin/");

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-navy-950 px-4 py-12">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_20%_0%,rgba(52,129,113,0.25)_0%,transparent_60%)]"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image src="/images/logo-full-light.c79eecc0.png" alt="Trio Built Gulf Technical Services LLC" width={700} height={502} priority className="h-auto w-44" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
          <span aria-hidden="true" className="block h-[3px] w-10 bg-gold" />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-navy">Admin sign in</h1>
          <p className="mt-1.5 text-sm text-navy/60">Use your Trio Built Gulf admin account.</p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-white/40">
          Authorised staff only. Sign-in attempts are logged.
        </p>
      </div>
    </main>
  );
}
