import React, { useEffect, useId, useMemo, useState } from "react";
import { FileDropZone } from "./fileUpload/partials/FileDropZone";
import { FileSelectedCard } from "./fileUpload/partials/FileSelectedCard";
import { FilePreviewModal } from "./fileUpload/partials/FilePreviewModal";
import {
  createObjectUrl,
  isAcceptedFileType,
  revokeObjectUrl,
  validateFileSize,
  formatMaxFileSizeLabel,
} from "./fileUpload/fileUpload.utils";
import type { UploadPreviewItem } from "./fileUpload/fileUpload.utils";
import {
  themeFieldDisabledSurfaceClass,
  themeLabelClass,
} from "@designSystem/theme/styles/componentStyle";
import { cn } from "@app/utilities/cn";
import { AppIcon } from "@app/components/icons";

export type UploadVariant = "file" | "image" | "profile" | "excel";
export type PreviewShape = "rounded" | "circle" | "square";
export type PreviewMode = "card" | "compact" | "avatar" | "panel";

interface FileUploadProps {
  label?: string;
  disabled?: boolean;
  /** Notifies parent when the user selects or clears a file. */
  onFileChange?: (file: File | null) => void;
  layout?: "default" | "panel";
  variant?: UploadVariant;
  previewShape?: PreviewShape;
  previewMode?: PreviewMode;
  accept?: string;
  maxSizeMB?: number;
  helperText?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  showPreview?: boolean;
  enableDocumentPreview?: boolean;
  previewable?: boolean;
  removable?: boolean;
  replaceable?: boolean;
  /** Pre-loaded image for edit flows (data URL + display name). */
  initialPreview?: { url: string; name: string } | null;
  compact?: boolean;
}

export const FileUpload = ({
  label,
  disabled,
  onFileChange,
  variant = "image",
  previewShape,
  previewMode,
  accept,
  maxSizeMB,
  helperText,
  emptyTitle,
  emptyDescription,
  showPreview = true,
  enableDocumentPreview,
  previewable = true,
  removable = true,
  replaceable = true,
  initialPreview = null,
  compact = false,
}: FileUploadProps) => {
  const reactId = useId().replace(/:/g, "");
  const inputBase = `single-upload-${reactId}`;
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [clearedExisting, setClearedExisting] = useState(false);

  // Prop-driven reset, adjusted during render rather than in an effect (React's own recommended
  // pattern for "state that resets when a prop identity changes") — when the parent hands us a
  // different initial file, any earlier user-initiated "clear" no longer applies to it.
  const [renderedForInitialPreview, setRenderedForInitialPreview] = useState({
    url: initialPreview?.url,
    name: initialPreview?.name,
  });
  if (
    renderedForInitialPreview.url !== initialPreview?.url ||
    renderedForInitialPreview.name !== initialPreview?.name
  ) {
    setRenderedForInitialPreview({ url: initialPreview?.url, name: initialPreview?.name });
    setClearedExisting(false);
  }

  const resolvedAccept =
    accept ??
    (variant === "image" || variant === "profile"
      ? "image/*"
      : variant === "excel"
        ? ".xlsx,.xls,.csv"
        : ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg");
  const resolvedMaxSizeMB =
    maxSizeMB ?? (variant === "image" || variant === "profile" ? 2 : 10);
  const resolvedEnableDocumentPreview =
    enableDocumentPreview ?? (variant === "file" || variant === "excel");
  const resolvedShape: PreviewShape =
    previewShape ?? (variant === "profile" ? "circle" : "rounded");
  const resolvedMode: PreviewMode =
    previewMode ?? (variant === "profile" ? "avatar" : "card");

  useEffect(() => {
    if (!file) {
      return;
    }

    const url = createObjectUrl(file);
    // Genuine external-system sync, not derivable state: `createObjectUrl` allocates a real
    // browser resource that must be paired with a `revokeObjectUrl` on cleanup/replacement —
    // exactly what effects exist for. The URL isn't known until this runs, so this setState is
    // necessary, not a derived-render calculation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) {
        revokeObjectUrl(previous);
      }
      return url;
    });
    return () => {
      revokeObjectUrl(url);
    };
  }, [file]);

  const existingPreview =
    !file && !clearedExisting ? initialPreview : null;

  const hasSelectedImage = Boolean(file || existingPreview);
  const displayFile = useMemo(
    () =>
      file ??
      (existingPreview
        ? new File([], existingPreview.name, { type: "image/jpeg" })
        : null),
    [existingPreview, file],
  );

  const resolvedPreviewUrl = file ? previewUrl : existingPreview?.url ?? null;

  const previewItems: UploadPreviewItem[] = useMemo(() => {
    if (!displayFile || !resolvedPreviewUrl) {return [];}
    return [{ file: displayFile, url: resolvedPreviewUrl, isImage: true }];
  }, [displayFile, resolvedPreviewUrl]);

  const setSelectedFile = (next: File | null) => {
    setValidationError("");
    setFile(next);
    if (next) {
      setClearedExisting(false);
    } else {
      setClearedExisting(true);
    }
    onFileChange?.(next);
  };

  const pickFile = (files: File[]) => {
    const next = files[0] ?? null;
    if (!next) {setSelectedFile(null); return;}
    if (!isAcceptedFileType(next, resolvedAccept)) {
      setValidationError("Selected file type is not accepted.");
      return;
    }
    if (!validateFileSize(next, resolvedMaxSizeMB)) {
      setValidationError(
        `File must be ${formatMaxFileSizeLabel(resolvedMaxSizeMB)} or smaller.`,
      );
      return;
    }
    setSelectedFile(next);
  };

  const profileEmpty = (
    <label
      htmlFor={`${inputBase}-upload`}
      className={cn(
        "group flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-full border border-dashed border-border bg-background-muted/40 transition-colors",
        disabled
          ? themeFieldDisabledSurfaceClass
          : "hover:border-primary-400/70 hover:bg-background-muted/60",
      )}
    >
      <AppIcon name="imagePlus" size={22} className="text-foreground-muted" />
      <span className="mt-1 text-[11px] text-foreground-muted">Upload</span>
      <input
        id={`${inputBase}-upload`}
        type="file"
        accept={resolvedAccept}
        disabled={disabled}
        className="hidden"
        onChange={(e) => { pickFile(Array.from(e.target.files ?? [])); }}
      />
    </label>
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label ? <span className={themeLabelClass}>{label}</span> : null}

      {hasSelectedImage && displayFile ? (
        <FileSelectedCard
          file={displayFile}
          previewUrl={resolvedPreviewUrl}
          disabled={disabled}
          canPreview={previewable && showPreview}
          removable={removable}
          replaceable={replaceable}
          onPreview={() => { setIsPreviewOpen(true); }}
          onReplace={pickFile}
          onRemove={() => { setSelectedFile(null); }}
          replaceInputId={`${inputBase}-replace`}
          accept={resolvedAccept}
          previewShape={resolvedShape}
          previewMode={resolvedMode}
        />
      ) : (
        <>
          {variant === "profile" ? (
            profileEmpty
          ) : (
            <FileDropZone
              id={`${inputBase}-upload`}
              title={emptyTitle ?? "Click to upload or drag and drop"}
              description={
                emptyDescription ??
                `Supported: ${resolvedAccept.replaceAll(",", ", ")} · max ${formatMaxFileSizeLabel(resolvedMaxSizeMB)}`
              }
              accept={resolvedAccept}
              disabled={disabled}
              compact={compact}
              onFiles={pickFile}
            />
          )}
        </>
      )}
      {helperText ? (
        <p className="text-xs text-foreground-muted">{helperText}</p>
      ) : null}
      {validationError ? (
        <p className="text-xs text-danger-500">{validationError}</p>
      ) : null}

      <FilePreviewModal
        isOpen={isPreviewOpen}
        items={previewItems}
        currentIndex={0}
        onClose={() => { setIsPreviewOpen(false); }}
        onRemoveCurrent={() => {
          setSelectedFile(null);
          setIsPreviewOpen(false);
        }}
        enableDocumentPreview={resolvedEnableDocumentPreview}
      />
    </div>
  );
};
