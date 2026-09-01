import {
  getFileExtension,
  isCsvFile,
  isImageFile,
  isOfficeFile,
  isPublicHttpUrl,
} from "../fileUpload.utils";
import type { UploadPreviewItem } from "../fileUpload.utils";
import { resolvePreviewMime } from "./resolvePreviewBlob";

/** Max blob size eligible for client-side document rendering (15 MB). */
export const MAX_PREVIEW_FILE_BYTES = 15 * 1024 * 1024;

export type FilePreviewKind =
  | "image"
  | "pdf"
  | "docx"
  | "doc"
  | "xlsx"
  | "xls"
  | "pptx"
  | "csv"
  | "text"
  | "json"
  | "public-office-embed"
  | "unsupported";

export function isPreviewSizeAllowed(file: File): boolean {
  return file.size > 0 && file.size <= MAX_PREVIEW_FILE_BYTES;
}

export function getFilePreviewKind(
  file: File,
  url: string | null,
  enableDocumentPreview: boolean,
): FilePreviewKind {
  if (isImageFile(file) || resolvePreviewMime(file).startsWith("image/")) {return "image";}

  const ext = getFileExtension(file.name);
  const mime = resolvePreviewMime(file);

  if (
    ext === ".png" ||
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".webp" ||
    ext === ".gif" ||
    ext === ".svg"
  ) {
    return "image";
  }

  if (url) {
    const urlExt = getFileExtension(url.split("?")[0] || "");
    if (
      urlExt === ".png" ||
      urlExt === ".jpg" ||
      urlExt === ".jpeg" ||
      urlExt === ".webp" ||
      urlExt === ".gif" ||
      urlExt === ".svg"
    ) {
      return "image";
    }
  }

  if (ext === ".pdf" || mime === "application/pdf") {return "pdf";}
  if (ext === ".docx" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return "docx";
  }
  if (ext === ".doc") {return "doc";}
  if (ext === ".xlsx" || mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return "xlsx";
  }
  if (ext === ".xls" || mime === "application/vnd.ms-excel") {return "xls";}
  if (ext === ".pptx" || ext === ".ppt" || mime.includes("presentation")) {return "pptx";}
  if (isCsvFile(file)) {return "csv";}
  if (ext === ".json" || mime === "application/json") {return "json";}
  if (mime.startsWith("text/") || ext === ".txt" || ext === ".rtf") {return "text";}

  if (
    enableDocumentPreview &&
    isOfficeFile(file) &&
    isPublicHttpUrl(url)
  ) {
    return "public-office-embed";
  }

  return "unsupported";
}

export function canPreviewZoom(kind: FilePreviewKind): boolean {
  return kind === "image" || kind === "pdf";
}

export function getPreviewSizeLimitMessage(file: File): string {
  return `This file (${formatPreviewLimit(file.size)}) exceeds the ${formatPreviewLimit(MAX_PREVIEW_FILE_BYTES)} preview limit. Open or download it locally instead.`;
}

function formatPreviewLimit(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function openPreviewBlob(item: UploadPreviewItem): void {
  if (!item.url) {return;}
  window.open(item.url, "_blank", "noopener,noreferrer");
}

export function downloadPreviewBlob(item: UploadPreviewItem): void {
  if (!item.url) {return;}
  const anchor = document.createElement("a");
  anchor.href = item.url;
  anchor.download = item.file.name;
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
