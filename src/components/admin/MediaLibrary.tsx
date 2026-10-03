"use client";

import { useEffect, useState } from "react";
import { assignMedia, checkMediaUsage, deleteMedia, updateMedia, uploadMedia } from "@/app/admin/(panel)/media/actions";
import { MEDIA_CATEGORIES } from "@/lib/media";
import { ActionForm, Field, Modal, SubmitButton, useToast } from "./forms";
import { Badge, button, Card, inputCls } from "./ui";

export type MediaItem = {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  category: string;
  alt: string | null;
  isPublic: boolean;
  url: string; // public url, or "" for private
  createdAt: string;
};

const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const isImage = (m: MediaItem) => m.mimeType.startsWith("image/");

export function MediaUploader({ defaultCategory = "GENERAL" }: { defaultCategory?: string }) {
  return (
    <Card title="Upload files">
      <ActionForm action={uploadMedia} resetOnSuccess encType="multipart/form-data" className="grid gap-4 md:grid-cols-[1fr_12rem_auto] md:items-end">
        <Field label="Files (images, PDF, Word, Excel)" hint="Images are optimised automatically. Up to 20 MB each.">
          <input name="files" type="file" multiple required accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx" className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white`} />
        </Field>
        <Field label="Category">
          <select name="category" defaultValue={defaultCategory} className={inputCls}>
            {MEDIA_CATEGORIES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" name="isPublic" defaultChecked /> Public
          </label>
          <SubmitButton variant="teal" pendingText="Uploading…">
            Upload
          </SubmitButton>
        </div>
      </ActionForm>
      <p className="mt-3 text-xs text-navy/50">
        <strong>Public</strong> files can appear on the website. Untick it for private files such as certificates or contracts; those are only reachable from this admin through expiring links.
      </p>
    </Card>
  );
}

function CopyUrl({ url }: { url: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(new URL(url, window.location.origin).href);
          toast("success", "URL copied.");
        } catch {
          toast("error", "Could not copy — select and copy manually.");
        }
      }}
      className={button("secondary", true)}
    >
      Copy URL
    </button>
  );
}

function DeleteWithUsage({ id, name }: { id: string; name: string }) {
  const [usage, setUsage] = useState<string[] | null>(null);
  return (
    <Modal trigger="Delete" triggerClassName={button("danger", true)} title={`Delete ${name}?`}>
      {(close) => (
        <div>
          <UsageLoader id={id} onLoad={setUsage} />
          {usage && usage.length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">This file is in use:</p>
              <ul className="mt-1 list-disc pl-5">
                {usage.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
              <p className="mt-2">Deleting it will remove the image from those places.</p>
            </div>
          ) : (
            <p className="text-sm text-navy/70">This permanently deletes the file.</p>
          )}
          <form action={deleteMedia} onSubmit={close} className="mt-5 flex justify-end gap-2">
            <input type="hidden" name="id" value={id} />
            <button type="button" onClick={close} className={button("secondary", true)}>
              Cancel
            </button>
            <button type="submit" className={button("danger", true)}>
              Delete file
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
}

function UsageLoader({ id, onLoad }: { id: string; onLoad: (u: string[]) => void }) {
  useEffect(() => {
    let live = true;
    void checkMediaUsage(id).then((u) => live && onLoad(u));
    return () => {
      live = false;
    };
  }, [id, onLoad]);
  return null;
}

export function MediaGrid({
  items,
  canManage,
  projects,
  services,
  privateLinks,
}: {
  items: MediaItem[];
  canManage: boolean;
  projects: { id: string; name: string }[];
  services: { id: string; name: string }[];
  privateLinks: Record<string, string>;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((m) => (
        <li key={m.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(4,18,31,0.04)]">
          <div className="relative flex aspect-[4/3] items-center justify-center bg-mist">
            {isImage(m) && m.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt={m.alt ?? m.fileName} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-3xl font-extrabold text-navy/30">{m.mimeType === "application/pdf" ? "PDF" : isImage(m) ? "IMG" : "DOC"}</span>
            )}
            <span className="absolute left-2 top-2">
              <Badge tone={m.isPublic ? "teal" : "orange"}>{m.isPublic ? "Public" : "Private"}</Badge>
            </span>
          </div>
          <div className="flex flex-1 flex-col p-3">
            <p className="truncate text-sm font-semibold text-navy" title={m.fileName}>
              {m.fileName}
            </p>
            <p className="text-xs text-navy/50">
              {size(m.size)}
              {m.width && m.height ? ` · ${m.width}×${m.height}` : ""} · {MEDIA_CATEGORIES.find(([v]) => v === m.category)?.[1] ?? m.category}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.url ? <CopyUrl url={m.url} /> : null}
              {!m.isPublic && privateLinks[m.id] ? (
                <a href={privateLinks[m.id]} className={button("secondary", true)}>
                  Download
                </a>
              ) : null}
              {canManage ? (
                <>
                  <Modal trigger="Edit" title="Edit file">
                    {(close) => (
                      <ActionForm action={updateMedia} onSuccess={close} className="space-y-3">
                        <input type="hidden" name="id" value={m.id} />
                        <Field label="Name">
                          <input name="fileName" defaultValue={m.fileName} required className={inputCls} />
                        </Field>
                        <Field label="Alt text" hint="Describe the image for accessibility and SEO.">
                          <input name="alt" defaultValue={m.alt ?? ""} className={inputCls} />
                        </Field>
                        <Field label="Category">
                          <select name="category" defaultValue={m.category} className={inputCls}>
                            {MEDIA_CATEGORIES.map(([v, l]) => (
                              <option key={v} value={v}>
                                {l}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name="isPublic" defaultChecked={m.isPublic} /> Public
                        </label>
                        <div className="flex justify-end">
                          <SubmitButton variant="teal" small>
                            Save
                          </SubmitButton>
                        </div>
                      </ActionForm>
                    )}
                  </Modal>
                  {isImage(m) && m.isPublic ? (
                    <Modal trigger="Use on…" title="Use this image">
                      {(close) => (
                        <ActionForm action={assignMedia} onSuccess={close} className="space-y-3">
                          <input type="hidden" name="id" value={m.id} />
                          <AssignFields projects={projects} services={services} />
                          <div className="flex justify-end">
                            <SubmitButton variant="teal" small>
                              Assign
                            </SubmitButton>
                          </div>
                        </ActionForm>
                      )}
                    </Modal>
                  ) : null}
                  <DeleteWithUsage id={m.id} name={m.fileName} />
                </>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AssignFields({ projects, services }: { projects: { id: string; name: string }[]; services: { id: string; name: string }[] }) {
  const [target, setTarget] = useState<"project" | "service">("project");
  const list = target === "project" ? projects : services;
  return (
    <>
      <Field label="Assign to">
        <select name="target" value={target} onChange={(e) => setTarget(e.target.value as "project" | "service")} className={inputCls}>
          <option value="project">A project</option>
          <option value="service">A service</option>
        </select>
      </Field>
      <Field label={target === "project" ? "Project" : "Service"}>
        <select name="targetId" required className={inputCls} defaultValue="">
          <option value="" disabled>
            Choose…
          </option>
          {list.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="As">
        <select name="as" className={inputCls} defaultValue="gallery">
          <option value="gallery">Gallery image</option>
          <option value="cover">Cover image</option>
        </select>
      </Field>
    </>
  );
}
