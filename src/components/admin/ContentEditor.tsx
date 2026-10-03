"use client";

import { saveContent } from "@/app/admin/(panel)/content/actions";
import { ICON_NAMES } from "@/components/Icon";
import type { ContentDef } from "@/server/content/defaults";
import { ActionForm, Field, SubmitButton } from "./forms";
import { ObjectListField, StringListField } from "./ListFields";
import { Card, inputCls } from "./ui";

/** Renders an editor form from a content definition (see src/server/content/defaults.ts). */
export default function ContentEditor({ def, values }: { def: ContentDef; values: Record<string, unknown> }) {
  return (
    <ActionForm action={saveContent} className="space-y-5">
      <input type="hidden" name="key" value={def.key} />
      <Card title={def.title}>
        <div className="space-y-5">
          {def.fields.map((f) => {
            const v = values[f.key];
            if (f.kind === "text")
              return (
                <Field key={f.key} label={f.label} hint={f.hint}>
                  <input name={f.key} defaultValue={String(v ?? "")} maxLength={f.max ?? 300} className={inputCls} />
                </Field>
              );
            if (f.kind === "textarea")
              return (
                <Field key={f.key} label={f.label} hint={f.hint}>
                  <textarea name={f.key} rows={4} defaultValue={String(v ?? "")} maxLength={f.max ?? 2000} className={inputCls} />
                </Field>
              );
            if (f.kind === "list")
              return <StringListField key={f.key} name={f.key} label={f.label} hint={f.hint} values={(v as string[]) ?? []} multiline={f.multiline} addLabel="Add item" />;
            return (
              <ObjectListField
                key={f.key}
                name={f.key}
                label={f.label}
                hint={f.hint}
                values={(v as Record<string, string>[]) ?? []}
                fields={f.fields.map((sub) =>
                  sub.type === "icon"
                    ? { key: sub.key, label: sub.label, type: "select" as const, options: ICON_NAMES.map((n): [string, string] => [n, n]) }
                    : { key: sub.key, label: sub.label, type: sub.type === "textarea" ? ("textarea" as const) : ("text" as const) },
                )}
                addLabel="Add item"
              />
            );
          })}
        </div>
      </Card>
      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="rounded-xl border border-line bg-white/95 p-2 shadow-lg backdrop-blur">
          <SubmitButton variant="teal">Save and publish</SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}
