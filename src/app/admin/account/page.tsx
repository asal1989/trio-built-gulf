import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/server/auth/guard";
import AccountForm from "./AccountForm";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ required?: string }> }) {
  const user = await requireUser();
  const { required } = await searchParams;

  return (
    <main className="mx-auto flex min-h-svh max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-line bg-white p-7 shadow-xl sm:p-9">
        <span aria-hidden="true" className="block h-[3px] w-10 bg-gold" />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-navy">
          {required || user.mustChangePassword ? "Choose a new password" : "Change password"}
        </h1>
        <p className="mt-1.5 text-sm text-navy/60">
          {required || user.mustChangePassword
            ? "For security, you must set your own password before continuing."
            : `Signed in as ${user.email}.`}
        </p>
        <AccountForm />
        {!(required || user.mustChangePassword) ? (
          <Link href="/admin/" className="mt-5 block text-center text-sm text-teal-700 hover:text-navy">
            ← Back to dashboard
          </Link>
        ) : null}
      </div>
    </main>
  );
}
