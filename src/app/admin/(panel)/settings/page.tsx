import { ContactSettingsForm, CrmSettingsForm } from "@/components/admin/SettingsForms";
import { Card, PageHeading } from "@/components/admin/ui";
import { requirePage } from "@/server/auth/guard";
import { staffForAssignment } from "@/server/leads/queries";
import { getContactSettingsFresh, getCrmSettings } from "@/server/settings";
import { usingCloudStorage } from "@/server/storage";

export default async function SettingsPage() {
  await requirePage("settings:manage");
  const [contact, crm, staff] = await Promise.all([getContactSettingsFresh(), getCrmSettings(), staffForAssignment()]);

  const status = [
    ["Email (Resend)", Boolean(process.env.RESEND_API_KEY), "Set RESEND_API_KEY to send real emails."],
    ["File storage", usingCloudStorage(), "Set the S3_* variables to use cloud storage (local disk is used otherwise)."],
    ["Site URL", Boolean(process.env.SITE_URL), "Set SITE_URL so links in emails point to the live site."],
    ["Auth secret", Boolean(process.env.AUTH_SECRET), "Set AUTH_SECRET (used to sign local file links)."],
  ] as const;

  return (
    <>
      <PageHeading title="Settings" subtitle="Changes to contact details update the header, footer, contact page, WhatsApp buttons and search data." />

      <Card title="System status" className="mb-6">
        <ul className="grid gap-3 sm:grid-cols-2">
          {status.map(([label, ok, hint]) => (
            <li key={label} className="flex items-start gap-3 text-sm">
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} aria-hidden="true" />
              <span>
                <span className="font-semibold text-navy">{label}</span> — {ok ? "configured" : "not configured"}
                {!ok ? <span className="block text-xs text-navy/55">{hint}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mb-3 font-display text-lg font-bold text-navy">Contact details</h2>
      <ContactSettingsForm initial={contact} />

      <h2 className="mb-3 mt-10 font-display text-lg font-bold text-navy">CRM &amp; quotations</h2>
      <CrmSettingsForm initial={crm} staff={staff.map((s) => ({ id: s.id, name: s.name }))} />
    </>
  );
}
