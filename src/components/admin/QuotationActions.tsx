"use client";

import { duplicateQuotation, deleteQuotation, sendQuotation, setQuotationStatus } from "@/app/admin/(panel)/quotations/actions";
import { ActionForm, ConfirmForm, SubmitButton } from "./forms";
import { button } from "./ui";

type Status = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export default function QuotationActions({
  id,
  status,
  canManage,
  canSend,
  hasEmail,
}: {
  id: string;
  status: Status;
  canManage: boolean;
  canSend: boolean;
  hasEmail: boolean;
}) {
  return (
    <div className="space-y-3">
      <a href={`/api/admin/quotations/${id}/pdf/`} target="_blank" rel="noopener noreferrer" className={`${button("secondary")} w-full`}>
        📄 View / download PDF
      </a>

      {canSend && (status === "DRAFT" || status === "SENT" || status === "EXPIRED") ? (
        <ActionForm action={sendQuotation}>
          <input type="hidden" name="id" value={id} />
          <SubmitButton variant="gold" className="w-full" pendingText="Sending…">
            {status === "DRAFT" ? "✉️ Send to customer" : "✉️ Re-send to customer"}
          </SubmitButton>
          {!hasEmail ? <p className="mt-1.5 text-xs text-red-600">Add the customer&rsquo;s email to the draft first.</p> : null}
        </ActionForm>
      ) : null}

      {canManage && status === "SENT" ? (
        <div className="grid grid-cols-2 gap-2">
          <ActionForm action={setQuotationStatus}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="ACCEPTED" />
            <SubmitButton variant="teal" small className="w-full">
              ✓ Accepted
            </SubmitButton>
          </ActionForm>
          <ActionForm action={setQuotationStatus}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value="REJECTED" />
            <SubmitButton variant="danger" small className="w-full">
              ✕ Rejected
            </SubmitButton>
          </ActionForm>
        </div>
      ) : null}

      {canManage && (status === "SENT" || status === "REJECTED") ? (
        <ActionForm action={setQuotationStatus}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="EXPIRED" />
          <SubmitButton variant="secondary" small className="w-full">
            Mark expired
          </SubmitButton>
        </ActionForm>
      ) : null}

      {canManage ? (
        <form action={duplicateQuotation}>
          <input type="hidden" name="id" value={id} />
          <SubmitButton variant="secondary" small className="w-full" pendingText="Copying…">
            Duplicate as new draft
          </SubmitButton>
        </form>
      ) : null}

      {canManage && status === "DRAFT" ? (
        <ConfirmForm
          action={deleteQuotation}
          hidden={{ id }}
          title="Delete this draft?"
          message="The draft quotation will be permanently deleted."
          confirmLabel="Delete draft"
          buttonClassName={`${button("danger", true)} w-full`}
        >
          Delete draft
        </ConfirmForm>
      ) : null}
    </div>
  );
}
