"use client";

import { changePasswordAction } from "../actions";
import { ActionForm, Field, SubmitButton, ToastProvider } from "@/components/admin/forms";
import { inputCls } from "@/components/admin/ui";

export default function AccountForm() {
  return (
    <ToastProvider>
      <ActionForm action={changePasswordAction} className="mt-6 space-y-4">
        <Field label="Current password">
          <input name="current" type="password" autoComplete="current-password" required className={inputCls} />
        </Field>
        <Field label="New password" hint="At least 10 characters with upper and lower case letters and a number.">
          <input name="next" type="password" autoComplete="new-password" required minLength={10} className={inputCls} />
        </Field>
        <Field label="Confirm new password">
          <input name="confirm" type="password" autoComplete="new-password" required minLength={10} className={inputCls} />
        </Field>
        <SubmitButton variant="teal" className="w-full !py-3">
          Update password
        </SubmitButton>
      </ActionForm>
    </ToastProvider>
  );
}
