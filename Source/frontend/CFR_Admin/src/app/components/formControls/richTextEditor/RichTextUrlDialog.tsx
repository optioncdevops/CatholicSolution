import { useEffect, useState } from "react";
import { BaseModal } from "@app/components/modal/BaseModal";
import { CommonButton } from "@app/components/buttons";
import { InputField } from "../InputField";
import { sanitizeRichTextUrl } from "./richTextEditor.utils";

export type RichTextUrlDialogKind = "link" | "image";

export interface RichTextUrlDialogState {
  kind: RichTextUrlDialogKind;
  initialValue: string;
  // The editor's selection/caret at the moment the toolbar button was clicked, captured before
  // focus moves to this dialog's own input - `document.getSelection()` is a single global object,
  // so without restoring this exact Range first, confirming would apply the link/image wherever
  // the browser's selection happens to be after the dialog closes, not where the admin intended.
  savedRange: Range | null;
}

interface RichTextUrlDialogProps {
  state: RichTextUrlDialogState | null;
  onCancel: () => void;
  onConfirm: (url: string) => void;
}

/**
 * Replaces the editor toolbar's former `window.prompt`/`window.alert` for Insert Link/Insert
 * Image - those blocked the entire tab, couldn't be styled or made accessible, and gave no way
 * to see/edit an existing link's target inline. Built on the same BaseModal every other in-app
 * dialog in this app uses, not a new modal library.
 */
export function RichTextUrlDialog({ state, onCancel, onConfirm }: RichTextUrlDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state) {
      setValue(state.initialValue);
      setError(null);
    }
  }, [state]);

  if (!state) {return null;}

  const isLink = state.kind === "link";
  const label = isLink ? "Link URL" : "Image URL";
  const helperText = isLink
    ? "Allowed: https://, http://, mailto:, or tel: links."
    : "Allowed: https:// or http:// image links.";

  const handleConfirm = () => {
    const safe = sanitizeRichTextUrl(value);
    if (!safe) {
      setError(`Enter a valid URL. ${helperText}`);
      return;
    }

    onConfirm(safe);
  };

  return (
    <BaseModal
      isOpen
      onClose={onCancel}
      title={isLink ? "Insert link" : "Insert image"}
      size="sm"
      footer={(
        <>
          <CommonButton id="btnCancelRichTextUrl" variant="outline" onClick={onCancel}>Cancel</CommonButton>
          <CommonButton id="btnConfirmRichTextUrl" variant="primary" onClick={handleConfirm}>Insert</CommonButton>
        </>
      )}
    >
      <InputField
        id={isLink ? "txtRichTextLinkUrl" : "txtRichTextImageUrl"}
        label={label}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleConfirm();
          }
        }}
        placeholder="https://"
        helperText={error ? undefined : helperText}
        error={error ?? undefined}
        autoFocus
      />
    </BaseModal>
  );
}
