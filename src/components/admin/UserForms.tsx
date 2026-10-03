"use client";

import { useState } from "react";
import { createUser, resetUserPassword, updateUser } from "@/app/admin/(panel)/users/actions";
import { PERMISSIONS, ROLE_LABELS, ROLE_PERMISSIONS } from "@/server/auth/permissions";
import { ActionForm, Field, Modal, SubmitButton, useToast, type ActionState } from "./forms";
import { button, Card, inputCls } from "./ui";

const ROLES = Object.keys(ROLE_LABELS) as (keyof typeof ROLE_LABELS)[];

function TempPassword({ email, password, onDone }: { email: string; password: string; onDone: () => void }) {
  const toast = useToast();
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Temporary password for {email}</p>
      <p className="mt-2 select-all rounded bg-white px-3 py-2 font-mono text-base text-navy">{password}</p>
      <p className="mt-2 text-xs">Shown only once. Share it securely — they must choose a new password at first sign-in.</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className={button("secondary", true)}
          onClick={async () => {
            await navigator.clipboard.writeText(password).catch(() => {});
            toast("success", "Password copied.");
          }}
        >
          Copy
        </button>
        <button type="button" className={button("primary", true)} onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}

export function NewUserButton({ canCreateSuper }: { canCreateSuper: boolean }) {
  const [secret, setSecret] = useState<{ email: string; password: string } | null>(null);
  return (
    <Modal trigger="+ New user" triggerClassName={button("teal")} title="New admin user">
      {(close) =>
        secret ? (
          <TempPassword
            {...secret}
            onDone={() => {
              setSecret(null);
              close();
            }}
          />
        ) : (
          <ActionForm
            action={createUser}
            onSuccess={(s: NonNullable<ActionState>) => s.data && setSecret({ email: s.data.email, password: s.data.password })}
            className="space-y-3"
          >
            <Field label="Full name *">
              <input name="name" required className={inputCls} />
            </Field>
            <Field label="Email *">
              <input name="email" type="email" required className={inputCls} />
            </Field>
            <Field label="Role" hint="Permissions can be fine-tuned after the user is created.">
              <select name="role" defaultValue="SALES" className={inputCls}>
                {ROLES.filter((r) => canCreateSuper || r !== "SUPER_ADMIN").map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex justify-end">
              <SubmitButton variant="teal" small>
                Create user
              </SubmitButton>
            </div>
          </ActionForm>
        )
      }
    </Modal>
  );
}

export function ResetPassword({ id, name }: { id: string; name: string }) {
  const [secret, setSecret] = useState<{ email: string; password: string } | null>(null);
  return (
    <Modal trigger="Reset password" title={`Reset password for ${name}`}>
      {(close) =>
        secret ? (
          <TempPassword
            {...secret}
            onDone={() => {
              setSecret(null);
              close();
            }}
          />
        ) : (
          <ActionForm action={resetUserPassword} onSuccess={(s) => s.data && setSecret({ email: s.data.email, password: s.data.password })} className="space-y-3">
            <input type="hidden" name="id" value={id} />
            <p className="text-sm text-navy/70">A new temporary password is generated and all of their sessions are signed out. They must change it at next sign-in.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={close} className={button("secondary", true)}>
                Cancel
              </button>
              <SubmitButton variant="danger" small>
                Reset password
              </SubmitButton>
            </div>
          </ActionForm>
        )
      }
    </Modal>
  );
}

export function EditUserForm({
  user,
  canEditSuper,
  isSelf,
}: {
  user: { id: string; name: string; email: string; role: keyof typeof ROLE_LABELS; active: boolean; extraPermissions: string[] };
  canEditSuper: boolean;
  isSelf: boolean;
}) {
  const [role, setRole] = useState(user.role);
  const [extra, setExtra] = useState<string[]>(user.extraPermissions);
  const fromRole = new Set<string>(ROLE_PERMISSIONS[role]);

  return (
    <ActionForm action={updateUser} className="space-y-5">
      <input type="hidden" name="id" value={user.id} />
      <Card title="Account">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" defaultValue={user.name} required className={inputCls} />
          </Field>
          <Field label="Email">
            <input value={user.email} disabled className={inputCls} readOnly />
          </Field>
          <Field label="Role" hint={isSelf ? "You cannot change your own role." : undefined}>
            <select name="role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} disabled={isSelf || (!canEditSuper && user.role === "SUPER_ADMIN")} className={inputCls}>
              {ROLES.filter((r) => canEditSuper || r !== "SUPER_ADMIN").map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            {isSelf ? <input type="hidden" name="role" value={role} /> : null}
          </Field>
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium">
            <input type="checkbox" name="active" defaultChecked={user.active} disabled={isSelf} /> Account active
            {isSelf ? <input type="hidden" name="active" value="on" /> : null}
          </label>
        </div>
      </Card>

      <Card title="Permissions">
        <p className="mb-4 text-sm text-navy/60">
          The <strong>{ROLE_LABELS[role]}</strong> role includes the ticked, locked permissions. Tick extra permissions to grant more without changing the role.
        </p>
        <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {PERMISSIONS.map((p) => {
            const inherited = fromRole.has(p);
            return (
              <label key={p} className={`flex items-center gap-2 text-sm ${inherited ? "text-navy" : "text-navy/70"}`}>
                <input
                  type="checkbox"
                  name={inherited ? undefined : "extra"}
                  value={p}
                  checked={inherited || extra.includes(p)}
                  disabled={inherited || role === "SUPER_ADMIN"}
                  onChange={(e) => setExtra((c) => (e.target.checked ? [...c, p] : c.filter((x) => x !== p)))}
                />
                <code className="text-xs">{p}</code>
                {inherited ? <span className="text-[10px] uppercase text-teal-700">role</span> : null}
              </label>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-end">
        <SubmitButton variant="teal">Save user</SubmitButton>
      </div>
    </ActionForm>
  );
}
