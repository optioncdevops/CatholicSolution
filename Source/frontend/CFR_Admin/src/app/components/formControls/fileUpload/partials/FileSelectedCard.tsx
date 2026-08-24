import { AppIcon } from "@app/components/icons";
import { Tooltip } from "@app/components/tooltips/Tooltip";
import {
  themeFieldDisabledActionButtonClass,
  themeFormControlTextClass,
} from "@designSystem/theme/styles/componentStyle";
import { cn } from "@app/utilities/cn";
import {
  formatFileSize,
  getFileExtension,
  getFileKindIcon,
} from "../fileUpload.utils";

type PreviewShape = "rounded" | "circle" | "square";
type PreviewMode = "card" | "compact" | "avatar" | "panel";

function shapeClassFor(previewShape: PreviewShape): string {
  if (previewShape === "circle") {
    return "rounded-full";
  }
  if (previewShape === "square") {
    return "rounded-none";
  }
  return "rounded-md";
}

interface FileSelectedCardProps {
  file: File;
  previewUrl?: string | null;
  disabled?: boolean;
  canPreview?: boolean;
  removable?: boolean;
  replaceable?: boolean;
  onPreview?: () => void;
  onReplace?: (files: File[]) => void;
  onRemove?: () => void;
  replaceInputId: string;
  accept?: string;
  previewShape?: PreviewShape;
  previewMode?: PreviewMode;
}

type FileCardActionsProps = Pick<
  FileSelectedCardProps,
  | "canPreview"
  | "removable"
  | "replaceable"
  | "disabled"
  | "onPreview"
  | "onReplace"
  | "onRemove"
  | "replaceInputId"
  | "accept"
> & {
  compact?: boolean;
};

function FileCardActions({
  canPreview,
  removable,
  replaceable,
  disabled,
  onPreview,
  onReplace,
  onRemove,
  replaceInputId,
  accept,
  compact = false,
}: FileCardActionsProps) {
  const buttonClass = compact
    ? "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-foreground-muted hover:bg-background-muted hover:text-foreground disabled:cursor-not-allowed"
    : "inline-flex h-8 w-8 items-center justify-center rounded text-foreground-muted hover:bg-background-muted hover:text-foreground disabled:cursor-not-allowed";
  const disabledButtonClass = themeFieldDisabledActionButtonClass;
  const iconSize = compact ? 12 : 16;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center",
        compact ? "gap-0.5" : "gap-1",
      )}
    >
      {canPreview ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onPreview}
          className={cn(buttonClass, disabled && disabledButtonClass)}
          aria-label="Preview file"
          title="Preview"
        >
          <AppIcon name="eye" size={iconSize} />
        </button>
      ) : null}
      {replaceable ? (
        <label
          htmlFor={replaceInputId}
          className={cn(
            buttonClass,
            disabled && disabledButtonClass,
            "cursor-pointer",
          )}
          aria-label="Replace file"
          title="Replace"
        >
          <AppIcon name="refreshCw" size={iconSize} />
          <input
            id={replaceInputId}
            type="file"
            className="hidden"
            accept={accept}
            disabled={disabled}
            onChange={(e) => onReplace?.(Array.from(e.target.files ?? []))}
          />
        </label>
      ) : null}
      {removable ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className={cn(
            buttonClass,
            disabled && disabledButtonClass,
            "hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/20",
          )}
          aria-label="Remove file"
          title="Remove"
        >
          <AppIcon name="trash2" size={iconSize} />
        </button>
      ) : null}
    </div>
  );
}

export function FileSelectedCard({
  file,
  previewUrl,
  disabled,
  canPreview = true,
  removable = true,
  replaceable = true,
  onPreview,
  onReplace,
  onRemove,
  replaceInputId,
  accept,
  previewShape = "rounded",
  previewMode = "card",
}: FileSelectedCardProps) {
  const FileKindIcon = getFileKindIcon(file);
  const extension = getFileExtension(file.name) || "n/a";
  const extensionLabel = extension.replace(/^\./, "").toUpperCase() || "N/A";

  if (previewMode === "compact") {
    return (
      <div className="group flex min-w-0 items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 hover:bg-background-muted/40">
        <AppIcon
          name={FileKindIcon}
          size={14}
          decorative
          className="shrink-0 text-foreground-muted"
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          <span className="block min-w-0 max-w-full overflow-hidden [&>span]:block [&>span]:min-w-0 [&>span]:max-w-full">
            <Tooltip content={file.name} side="top">
              <span
                className={cn(
                  "block truncate font-medium leading-tight text-foreground",
                  themeFormControlTextClass,
                )}
              >
                {file.name}
              </span>
            </Tooltip>
          </span>
          <p className="truncate text-[10px] leading-tight text-foreground-muted">
            {formatFileSize(file.size)} • {extensionLabel}
          </p>
        </div>
        <FileCardActions
          canPreview={canPreview}
          removable={removable}
          replaceable={replaceable}
          disabled={disabled}
          onPreview={onPreview}
          onReplace={onReplace}
          onRemove={onRemove}
          replaceInputId={replaceInputId}
          accept={accept}
          compact
        />
      </div>
    );
  }

  /** Stacked preview used by the Business Unit logo panel. */
  if (previewMode === "panel") {
    return (
      <div className="flex w-full min-w-0 flex-col items-center gap-2.5 overflow-hidden rounded-lg border border-border bg-background p-3">
        <div
          className={cn(
            "mx-auto flex h-24 w-full max-w-[10rem] shrink-0 items-center justify-center overflow-hidden border border-border bg-background-muted/40",
            shapeClassFor(previewShape),
          )}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="max-h-full max-w-full object-contain p-1.5"
            />
          ) : (
            <AppIcon
              name={FileKindIcon}
              size={28}
              decorative
              className="text-foreground-muted"
            />
          )}
        </div>

        <div className="w-full min-w-0 overflow-hidden px-1 text-center">
          {/* Tooltip wraps in inline-flex; force full-width so truncate can clip long names. */}
          <span className="block min-w-0 max-w-full overflow-hidden [&>span]:block [&>span]:min-w-0 [&>span]:max-w-full [&>span]:w-full">
            <Tooltip content={file.name} side="top">
              <p
                className={cn(
                  "block w-full truncate font-medium text-foreground",
                  themeFormControlTextClass,
                )}
                title={file.name}
              >
                {file.name}
              </p>
            </Tooltip>
          </span>
          <p className="mt-0.5 truncate text-[11px] text-foreground-muted">
            {file.size > 0 ? `${formatFileSize(file.size)} · ` : null}
            {extensionLabel}
          </p>
        </div>

        <div className="flex w-full shrink-0 justify-center border-t border-border/70 pt-2">
          <FileCardActions
            canPreview={canPreview}
            removable={removable}
            replaceable={replaceable}
            disabled={disabled}
            onPreview={onPreview}
            onReplace={onReplace}
            onRemove={onRemove}
            replaceInputId={replaceInputId}
            accept={accept}
            compact
          />
        </div>
      </div>
    );
  }

  const shapeClass = shapeClassFor(previewShape);
  const cardClass =
    previewMode === "avatar"
      ? "flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-3"
      : "flex min-w-0 items-center gap-3 rounded-lg border border-border bg-background p-3";

  return (
    <div className={cardClass}>
      <div
        className={`h-12 w-12 shrink-0 overflow-hidden border border-border bg-background-muted/50 ${shapeClass}`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-foreground-muted">
            <AppIcon name={FileKindIcon} size={18} decorative />
          </div>
        )}
      </div>
      <div
        className={
          previewMode === "avatar"
            ? "w-full min-w-0 overflow-hidden text-center"
            : "min-w-0 flex-1 overflow-hidden"
        }
      >
        <p
          className={cn(
            "block w-full truncate font-medium text-foreground",
            themeFormControlTextClass,
          )}
          title={file.name}
        >
          {file.name}
        </p>
        <p className="truncate text-xs text-foreground-muted">
          {formatFileSize(file.size)} • {extensionLabel}
        </p>
      </div>
      <FileCardActions
        canPreview={canPreview}
        removable={removable}
        replaceable={replaceable}
        disabled={disabled}
        onPreview={onPreview}
        onReplace={onReplace}
        onRemove={onRemove}
        replaceInputId={replaceInputId}
        accept={accept}
      />
    </div>
  );
}
