import { CommonButton, BUTTON_PRESETS } from "@app/components/buttons";
import { AppIcon } from "@app/components/icons";
import {
  themeCardSurfaceClass,
  themeHeadingClass,
} from "@designSystem/theme/styles/componentStyle";
import {
  downloadPreviewBlob,
  openPreviewBlob,
  type FilePreviewKind,
} from "./filePreview.utils";
import { formatFileSize, getFileKindIcon } from "../fileUpload.utils";
import type { UploadPreviewItem } from "../fileUpload.utils";

interface UnsupportedPreviewPanelProps {
  item: UploadPreviewItem;
  fileExtension: string;
  previewKind: FilePreviewKind;
  sizeLimitExceeded?: boolean;
  sizeLimitMessage?: string;
}

function getUnsupportedMessage(previewKind: FilePreviewKind): {
  title: string;
  detail: string;
} {
  if (previewKind === "pptx") {
    return {
      title: "PowerPoint preview requires server conversion",
      detail:
        "PPTX files are not rendered directly in the browser. Upload a PDF export or enable backend conversion to PDF/slide images for secure inline preview.",
    };
  }
  if (previewKind === "doc") {
    return {
      title: "Legacy Word (.doc) preview is not supported",
      detail: "Save or export the document as DOCX or PDF to preview it here.",
    };
  }
  return {
    title: "Preview is not available for this file type",
    detail:
      "Open or download the file to view it in the appropriate application.",
  };
}

export function UnsupportedPreviewPanel({
  item,
  fileExtension,
  previewKind,
  sizeLimitExceeded = false,
  sizeLimitMessage,
}: UnsupportedPreviewPanelProps) {
  const FileKindIcon = getFileKindIcon(item.file);
  const canOpenLocally = !!item.url;
  const message = sizeLimitExceeded
    ? {
        title: "File is too large for inline preview",
        detail:
          sizeLimitMessage ?? "Open or download the file locally instead.",
      }
    : getUnsupportedMessage(previewKind);

  return (
    <div
      className={`flex h-full w-full flex-col justify-center p-6 ${themeCardSurfaceClass}`}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-5 flex items-start gap-4">
          <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background-muted text-foreground-muted">
            <AppIcon name={FileKindIcon} size={28} decorative />
          </div>
          <div className="min-w-0">
            <p className={`truncate text-base ${themeHeadingClass}`}>
              {item.file.name}
            </p>
            <p className="mt-1 text-sm text-foreground-muted">
              {message.title}
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              {message.detail}
            </p>
            {canOpenLocally ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <CommonButton
                  {...BUTTON_PRESETS.cancel}
                  type="button"
                  size="sm"
                  iconLeft={<AppIcon name="externalLink" size={14} />}
                  onClick={() => { openPreviewBlob(item); }}
                >
                  Open file
                </CommonButton>
                <CommonButton
                  {...BUTTON_PRESETS.cancel}
                  type="button"
                  size="sm"
                  iconLeft={<AppIcon name="download" size={14} />}
                  onClick={() => { downloadPreviewBlob(item); }}
                >
                  Download
                </CommonButton>
              </div>
            ) : null}
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-background-muted/20 p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-foreground-muted">Extension</dt>
            <dd className="mt-1 text-sm font-medium uppercase text-foreground">
              {fileExtension}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-foreground-muted">Size</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {formatFileSize(item.file.size)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-foreground-muted">MIME type</dt>
            <dd className="mt-1 truncate text-sm font-medium text-foreground">
              {item.file.type || "Unknown type"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
