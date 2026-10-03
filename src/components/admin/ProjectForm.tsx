"use client";

import { useRouter } from "next/navigation";
import { saveProject } from "@/app/admin/(panel)/projects/actions";
import { PROJECT_TYPES } from "@/lib/enquiry-options";
import { ActionForm, Field, SubmitButton } from "./forms";
import { MediaField, MediaGalleryField, type PickedMedia } from "./MediaPicker";
import { Card, inputCls } from "./ui";

export type ProjectFormData = {
  id?: string;
  name: string;
  slug: string;
  client: string;
  location: string;
  projectType: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  startDate: string;
  completionDate: string;
  description: string;
  scopeOfWork: string;
  cover: PickedMedia | null;
  gallery: PickedMedia[];
  services: string[];
  featured: boolean;
  published: boolean;
  order: number;
};

export default function ProjectForm({ initial, services }: { initial: ProjectFormData; services: { id: string; label: string }[] }) {
  const router = useRouter();
  return (
    <ActionForm
      action={saveProject}
      onSuccess={(s) => {
        if (!initial.id && s.id) router.push(`/admin/projects/${s.id}/`);
        else router.refresh();
      }}
      className="space-y-5"
    >
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <Card title="Project details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name *">
            <input name="name" required defaultValue={initial.name} className={inputCls} />
          </Field>
          <Field label="URL slug" hint="Leave blank to generate from the name.">
            <input name="slug" defaultValue={initial.slug} pattern="[a-z0-9\-]*" className={inputCls} />
          </Field>
          <Field label="Client" hint="Only publish a client name you have permission to show.">
            <input name="client" defaultValue={initial.client} className={inputCls} />
          </Field>
          <Field label="Location">
            <input name="location" defaultValue={initial.location} className={inputCls} />
          </Field>
          <Field label="Project type">
            <select name="projectType" defaultValue={initial.projectType} className={inputCls}>
              <option value="">—</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
              {initial.projectType && !(PROJECT_TYPES as readonly string[]).includes(initial.projectType) ? <option>{initial.projectType}</option> : null}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={initial.status} className={inputCls}>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </Field>
          <Field label="Start date">
            <input name="startDate" type="date" defaultValue={initial.startDate} className={inputCls} />
          </Field>
          <Field label="Completion date">
            <input name="completionDate" type="date" defaultValue={initial.completionDate} className={inputCls} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea name="description" rows={4} defaultValue={initial.description} className={inputCls} />
          </Field>
          <Field label="Scope of work" className="sm:col-span-2">
            <textarea name="scopeOfWork" rows={4} defaultValue={initial.scopeOfWork} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="Services provided">
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="services" value={s.id} defaultChecked={initial.services.includes(s.id)} /> {s.label}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Images">
        <div className="space-y-5">
          <MediaField name="coverId" label="Cover image" value={initial.cover} />
          <MediaGalleryField name="gallery" label="Gallery" values={initial.gallery} />
        </div>
      </Card>

      <Card title="Publishing">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="published" defaultChecked={initial.published} /> Published on the Projects page
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="featured" defaultChecked={initial.featured} /> Featured project
          </label>
          <Field label="Display order">
            <input name="order" type="number" min="0" defaultValue={initial.order} className={`${inputCls} !w-28`} />
          </Field>
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="rounded-xl border border-line bg-white/95 p-2 shadow-lg backdrop-blur">
          <SubmitButton variant="teal">{initial.id ? "Save project" : "Create project"}</SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}
