import { useEffect, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AppIcon } from "@app/components/icons";
import { Tooltip } from "@app/components/tooltips/Tooltip";
import {
  themeFieldDisabledSurfaceClass,
  themeFormControlTextClass,
  themeLabelClass,
} from "@designSystem/theme/styles/componentStyle";
import { cn } from "@app/utilities/cn";
import { FilePreviewModal } from "./fileUpload/partials/FilePreviewModal";
import {
  createObjectUrl,
  formatFileSize,
  formatFileUploadHelperText,
  FILE_UPLOAD_TYPES,
  getFileExtension,
  isAcceptedFileType,
  isImageFile,
  revokeObjectUrl,
  validateFileSize,
} from "./fileUpload/fileUpload.utils";
import type { UploadPreviewItem } from "./fileUpload/fileUpload.utils";

interface ProfileImageUploadProps {
  label?: string;
  disabled?: boolean;
  onFileChange?: (file: File | null) => void;
  helperText?: ReactNode;
  previewable?: boolean;
  removable?: boolean;
  replaceable?: boolean;
  initialPreviewUrl?: string;
  /** Shown when no profile image is available (e.g. first + last initials). */
  fallbackInitials?: string;
  tabIndex?: number;
  /**
   * "circle" (default) is the real profile-photo crop this component was built for. "rectangle"
   * is for a wide brand/banner image (e.g. an email logo) that a circular avatar crop would
   * distort — same component, no separate image-upload widget needed.
   */
  variant?: "circle" | "rectangle";
  /** Overrides the "Upload photo" link text — defaults preserved for existing profile-photo usage. */
  uploadLabel?: string;
  /** Overrides the "Change photo" link text — defaults preserved for existing profile-photo usage. */
  replaceLabel?: string;
  /** Overrides the `alt` text on an already-uploaded image's preview. */
  existingPreviewAlt?: string;
  /** Overrides the "Preview profile image" accessible label on the overlay preview button. */
  previewAriaLabel?: string;
  /** Overrides the "Remove profile image" accessible label on the overlay remove button. */
  removeAriaLabel?: string;
  /**
   * When provided, awaited before an actual removal (overlay trash button, or the preview
   * modal's own Remove) proceeds — resolving `false` cancels it. Omitted by default so the other
   * three consumers of this component keep their existing immediate-remove behavior unchanged.
   */
  confirmRemove?: () => Promise<boolean>;
}

const PROFILE_ACCEPT = "image/jpeg,image/png,.jpg,.jpeg,.png";
const PROFILE_MAX_SIZE_MB = 2;
const PROFILE_HELPER_TEXT = formatFileUploadHelperText({
  fileTypes: FILE_UPLOAD_TYPES.jpgOrPng,
  maxSizeMB: PROFILE_MAX_SIZE_MB,
  optional: true,
});

const CARD_CLASS =
  "inline-flex w-fit max-w-[220px] flex-col items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-sm";

const AVATAR_CLASS_BY_VARIANT: Record<"circle" | "rectangle", string> = {
  circle: "h-24 w-24 rounded-full border border-[var(--line)] object-cover shadow-sm ring-2 ring-[var(--surface)]",
  rectangle: "h-16 w-40 rounded-lg border border-[var(--line)] object-contain bg-[var(--surface-muted)] shadow-sm ring-2 ring-[var(--surface)]",
};

const EMPTY_STATE_CLASS_BY_VARIANT: Record<"circle" | "rectangle", string> = {
  circle: "flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-[var(--line)] bg-[var(--surface-muted)] shadow-sm ring-2 ring-[var(--surface)]",
  rectangle: "flex h-16 w-40 items-center justify-center rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-muted)] shadow-sm ring-2 ring-[var(--surface)]",
};

const OVERLAY_BTN_CLASS =
  "inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/65 disabled:cursor-not-allowed disabled:bg-black/35 disabled:text-white/70 disabled:hover:bg-black/35";

const UPLOAD_LINK_CLASS =
  "mt-2 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]";

interface ProfileOverlayActionsProps {
  disabled?: boolean;
  canPreview?: boolean;
  removable?: boolean;
  onPreview?: () => void;
  onRemove?: () => void;
  previewAriaLabel?: string;
  removeAriaLabel?: string;
}

function ProfileOverlayActions({
  disabled,
  canPreview,
  removable,
  onPreview,
  onRemove,
  previewAriaLabel = "Preview profile image",
  removeAriaLabel = "Remove profile image",
}: ProfileOverlayActionsProps) {
  if (!canPreview && !removable) { return null; }

  return (
    <div className="absolute top-1 right-1 flex items-center gap-0.5">
      {canPreview ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onPreview}
          className={OVERLAY_BTN_CLASS}
          aria-label={previewAriaLabel}
          title="Preview"
        >
          <AppIcon name="eye" size={12} />
        </button>
      ) : null}
      {removable ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className={cn(OVERLAY_BTN_CLASS, "hover:bg-[var(--error)]")}
          aria-label={removeAriaLabel}
          title="Remove"
        >
          <AppIcon name="trash2" size={12} />
        </button>
      ) : null}
    </div>
  );
}

export function ProfileImageUpload({
  label = "Profile image",
  disabled,
  onFileChange,
  helperText = PROFILE_HELPER_TEXT,
  previewable = true,
  removable = true,
  replaceable = true,
  initialPreviewUrl,
  fallbackInitials,
  tabIndex,
  variant = "circle",
  uploadLabel = "Upload photo",
  replaceLabel = "Change photo",
  existingPreviewAlt = "Current profile",
  previewAriaLabel = "Preview profile image",
  removeAriaLabel = "Remove profile image",
  confirmRemove,
}: ProfileImageUploadProps) {
  const avatarClass = AVATAR_CLASS_BY_VARIANT[variant];
  const emptyStateClass = EMPTY_STATE_CLASS_BY_VARIANT[variant];
  const reactId = useId().replace(/:/g, "");
  const inputBase = `profile-image-${reactId}`;
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [clearedExisting, setClearedExisting] = useState(false);
  // Whether the existing (already-uploaded, server-hosted) preview image failed to load — a
  // stale/removed/invalid file on the server would otherwise show the browser's own broken-image
  // icon; fall back to the same empty-state placeholder used when there's no image at all.
  const [existingPreviewFailed, setExistingPreviewFailed] = useState(false);

  // Prop-driven reset, adjusted during render rather than in an effect (React's own recommended
  // pattern for "state that resets when a prop identity changes") — when the parent hands us a
  // different initial preview URL, any earlier user-initiated "clear" (or load failure) no longer
  // applies to it.
  const [renderedForInitialPreviewUrl, setRenderedForInitialPreviewUrl] = useState(initialPreviewUrl);
  if (renderedForInitialPreviewUrl !== initialPreviewUrl) {
    setRenderedForInitialPreviewUrl(initialPreviewUrl);
    setClearedExisting(false);
    setExistingPreviewFailed(false);
  }

  useEffect(() => {
    if (!file) {
      // Genuine external-system sync, not derivable state: revoking the previous blob URL is a
      // real browser-resource side effect that must happen exactly once per `file` transition —
      // exactly what effects exist for.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl((previous) => {
        revokeObjectUrl(previous);
        return null;
      });
      return;
    }
    const url = createObjectUrl(file);
    setPreviewUrl((previous) => {
      revokeObjectUrl(previous);
      return url;
    });
    return () => { revokeObjectUrl(url); };
  }, [file]);

  const existingPreviewUrl =
    !file && !clearedExisting && !existingPreviewFailed ? initialPreviewUrl?.trim() || null : null;

  const previewItems: UploadPreviewItem[] = useMemo(() => {
    if (file) {
      return [{ file, url: previewUrl, isImage: isImageFile(file) }];
    }

    if (existingPreviewUrl) {
      // The real file name often lives in a query parameter (e.g. GetEmailLogo?fileName=...),
      // not the last path segment - naively splitting the URL on "/" and "?" picked up the raw
      // endpoint/action name ("GetEmailLogo") as the display name instead. Parse it as a real URL
      // and prefer its `fileName` query param; only fall back to the last path segment (still
      // safe for a plain static-file URL with no query string) if that's absent.
      const fileName = (() => {
        try {
          const parsed = new URL(existingPreviewUrl, window.location.origin);
          const queryFileName = parsed.searchParams.get("fileName");
          if (queryFileName) { return queryFileName; }
          const pathSegment = parsed.pathname.split("/").pop();
          if (pathSegment) { return pathSegment; }
        } catch {
          // Not a parseable URL - fall through to the naive split below.
        }
        return existingPreviewUrl.split("/").pop()?.split("?")[0] || "profile-image.png";
      })();
      const ext = fileName.includes(".")
        ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
        : ".png";
      const mimeType =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".svg"
              ? "image/svg+xml"
              : "image/jpeg";
      return [
        {
          file: new File([], fileName, { type: mimeType }),
          url: existingPreviewUrl,
          isImage: true,
        },
      ];
    }

    return [];
  }, [existingPreviewUrl, file, previewUrl]);

  const setSelectedFile = (next: File | null) => {
    setValidationError("");
    setFile(next);
    onFileChange?.(next);
  };

  // Shared by the overlay trash button and the preview modal's own Remove button - both trigger
  // the exact same "clear the current image" action, so both go through the same optional
  // confirmation gate.
  const handleRemoveClick = () => {
    if (confirmRemove) {
      void confirmRemove().then((confirmed) => {
        if (!confirmed) { return; }
        setClearedExisting(true);
        setSelectedFile(null);
      });
      return;
    }

    setClearedExisting(true);
    setSelectedFile(null);
  };

  const pickFile = (files: File[]) => {
    const next = files[0] ?? null;
    if (!next) { setSelectedFile(null); return; }
    if (!isAcceptedFileType(next, PROFILE_ACCEPT)) {
      setValidationError("Selected file type is not accepted.");
      return;
    }
    if (!validateFileSize(next, PROFILE_MAX_SIZE_MB)) {
      setValidationError(`File must be ${PROFILE_MAX_SIZE_MB}MB or smaller.`);
      return;
    }
    setSelectedFile(next);
  };

  const extensionLabel =
    (file
      ? getFileExtension(file.name).replace(/^\./, "")
      : ""
    ).toUpperCase() || "IMG";

  const helperBlock =
    helperText && !validationError ? (
      <p className="mt-2 text-center text-[11px] leading-snug text-[var(--text-muted)]">
        {helperText}
      </p>
    ) : null;

  const replaceControl =
    replaceable && !disabled ? (
      <label
        htmlFor={`${inputBase}-replace`}
        className={cn(UPLOAD_LINK_CLASS, "cursor-pointer")}
        tabIndex={tabIndex}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById(`${inputBase}-replace`)?.click();
          }
        }}
      >
        {replaceLabel}
        <input
          id={`${inputBase}-replace`}
          type="file"
          className="hidden"
          accept={PROFILE_ACCEPT}
          disabled={disabled}
          onChange={(e) => { pickFile(Array.from(e.target.files ?? [])); }}
        />
      </label>
    ) : null;

  return (
    <div className="flex w-fit flex-col gap-1.5">
      {label ? <span className={themeLabelClass}>{label}</span> : null}

      {file ? (
        <div className={CARD_CLASS}>
          <div className="relative mx-auto">
            <img
              src={previewUrl ?? undefined}
              alt={file.name}
              className={avatarClass}
            />
            <ProfileOverlayActions
              disabled={disabled}
              canPreview={previewable}
              removable={removable}
              onPreview={() => { setIsPreviewOpen(true); }}
              onRemove={handleRemoveClick}
              previewAriaLabel={previewAriaLabel}
              removeAriaLabel={removeAriaLabel}
            />
          </div>

          {replaceControl}

          <div className="mt-2 w-full min-w-0 px-1 text-center">
            <span className="block min-w-0 max-w-full overflow-hidden [&>span]:block [&>span]:min-w-0 [&>span]:max-w-full">
              <Tooltip content={file.name} side="top">
                <span
                  className={cn(
                    "block truncate font-semibold text-[var(--text-primary)]",
                    themeFormControlTextClass,
                  )}
                >
                  {file.name}
                </span>
              </Tooltip>
            </span>
            <p className="truncate text-xs text-[var(--text-muted)]">
              {formatFileSize(file.size)} • {extensionLabel}
            </p>
          </div>

          {helperBlock}
        </div>
      ) : existingPreviewUrl ? (
        <div className={CARD_CLASS}>
          <div className="relative mx-auto">
            <img
              src={existingPreviewUrl}
              alt={existingPreviewAlt}
              className={avatarClass}
              onError={() => setExistingPreviewFailed(true)}
            />
            {previewable || removable ? (
              <ProfileOverlayActions
                disabled={disabled}
                canPreview={previewable}
                removable={removable}
                onPreview={() => { setIsPreviewOpen(true); }}
                onRemove={handleRemoveClick}
                previewAriaLabel={previewAriaLabel}
                removeAriaLabel={removeAriaLabel}
              />
            ) : null}
          </div>

          {replaceControl}
          {helperBlock}
        </div>
      ) : (
        <label
          htmlFor={`${inputBase}-upload`}
          className={cn(
            CARD_CLASS,
            disabled
              ? cn(themeFieldDisabledSurfaceClass, "shadow-none")
              : "cursor-pointer hover:bg-[var(--surface-muted)]",
          )}
          tabIndex={disabled ? undefined : tabIndex}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById(`${inputBase}-upload`)?.click();
            }
          }}
        >
          <div className={emptyStateClass}>
            {fallbackInitials ? (
              <span className="text-xl font-bold uppercase tracking-wide text-[var(--primary)]">
                {fallbackInitials}
              </span>
            ) : (
              <AppIcon
                name="imagePlus"
                size={22}
                className="text-[var(--text-muted)]"
                decorative
              />
            )}
          </div>
          <span className={cn(UPLOAD_LINK_CLASS, "text-center")}>
            {uploadLabel}
          </span>
          {helperBlock}
          <input
            id={`${inputBase}-upload`}
            type="file"
            accept={PROFILE_ACCEPT}
            disabled={disabled}
            className="hidden"
            onChange={(e) => { pickFile(Array.from(e.target.files ?? [])); }}
          />
        </label>
      )}

      {validationError ? (
        <p className="max-w-[220px] text-center text-xs text-[var(--error)]">
          {validationError}
        </p>
      ) : null}

      <FilePreviewModal
        isOpen={isPreviewOpen}
        items={previewItems}
        currentIndex={0}
        onClose={() => { setIsPreviewOpen(false); }}
        onRemoveCurrent={() => {
          setIsPreviewOpen(false);
          handleRemoveClick();
        }}
      />
    </div>
  );
}
