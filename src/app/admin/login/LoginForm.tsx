"use client";

import { loginAction } from "../actions";
import { ActionForm, Field, SubmitButton, ToastProvider } from "@/components/admin/forms";
import { inputCls } from "@/components/admin/ui";

export default function LoginForm() {
  return (
    <ToastProvider>
      <ActionForm action={loginAction} className="mt-6 space-y-4">
        <Field label="Email">
          <input name="email" type="email" autoComplete="username" required autoFocus className={inputCls} />
        </Field>
        <Field label="Password">
          <input name="password" type="password" autoComplete="current-password" required className={inputCls} />
        </Field>
        <SubmitButton variant="teal" pendingText="Signing in…" className="w-full !py-3">
          Sign in
        </SubmitButton>
      </ActionForm>
    </ToastProvider>
  );
}
