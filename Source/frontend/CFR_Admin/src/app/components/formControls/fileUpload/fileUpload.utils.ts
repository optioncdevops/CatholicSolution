import type { AppIconName } from "@app/components/icons";
export interface UploadPreviewItem {
  file: File;
  url: string | null;
  isImage: boolean;
}

export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx < 0) {return "";}
  return fileName.slice(idx).toLowerCase();
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {return "0 Bytes";}
  const units = ["Bytes", "KB", "MB", "GB"];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exp);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exp]}`;
}

/** Format a max-size limit (stored in MB) for labels — uses KB when under 1 MB. */
export function formatMaxFileSizeLabel(maxSizeMB: number): string {
  if (!Number.isFinite(maxSizeMB) || maxSizeMB <= 0) {return "0 KB";}
  if (maxSizeMB < 1) {
    return `${Math.round(maxSizeMB * 1024)} KB`;
  }
  return Number.isInteger(maxSizeMB)
    ? `${maxSizeMB} MB`
    : `${maxSizeMB.toFixed(2).replace(/\.?0+$/, "")} MB`;
}

export interface FileUploadHelperTextOptions {
  /** Human-readable types, e.g. "JPG, JPEG or PNG". */
  fileTypes: string;
  maxSizeMB: number;
  /** Prefixes with "Optional. " when true. */
  optional?: boolean;
  /** Extra segments after max size, e.g. "recommended 320 × 100 px". */
  extras?: string[];
}

/**
 * Canonical upload helper note:
 * `Optional. JPG, JPEG or PNG · max 2 MB`
 * `PNG, JPG, SVG or WebP · max 2 MB · recommended 320 × 100 px`
 */
export function formatFileUploadHelperText({
  fileTypes,
  maxSizeMB,
  optional = false,
  extras = [],
}: FileUploadHelperTextOptions): string {
  const typePart = optional ? `Optional. ${fileTypes}` : fileTypes;
  const parts = [
    typePart,
    `max ${formatMaxFileSizeLabel(maxSizeMB)}`,
    ...extras.map((part) => part.trim()).filter(Boolean),
  ];
  return parts.join(" · ");
}

/** Common image type labels for helper notes. */
export const FILE_UPLOAD_TYPES = {
  jpgOrPng: "JPG or PNG",
  jpgJpegOrPng: "JPG, JPEG or PNG",
  pngJpgSvgOrWebp: "PNG, JPG, SVG or WebP",
  pdfDocXls: "PDF, DOC, XLS",
} as const;

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

const BLOCKED_UPLOAD_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".msi",
  ".scr",
  ".ps1",
  ".vbs",
  ".jar",
  ".html",
  ".htm",
]);

export function isAcceptedFileType(file: File, accept?: string): boolean {
  if (!accept?.trim()) {return true;}
  const ext = getFileExtension(file.name);
  if (BLOCKED_UPLOAD_EXTENSIONS.has(ext)) {
    return false;
  }
  const rules = accept.split(",").map((rule) => rule.trim().toLowerCase());
  const mime = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) {return ext === rule;}
    if (rule.endsWith("/*")) {return mime.startsWith(rule.slice(0, -1));}
    return mime === rule;
  });
}

export function validateFileSize(file: File, maxSizeMB?: number): boolean {
  if (!maxSizeMB || maxSizeMB <= 0) {return true;}
  return file.size <= maxSizeMB * 1024 * 1024;
}

export function validateFileCount(files: File[], maxCount?: number): boolean {
  if (!maxCount || maxCount <= 0) {return true;}
  return files.length <= maxCount;
}

export function createObjectUrl(file: Blob): string {
  return URL.createObjectURL(file);
}

export function revokeObjectUrl(url: string | null | undefined): void {
  if (!url) {return;}
  URL.revokeObjectURL(url);
}

export function getFileKindIcon(file: File): AppIconName {
  if (isImageFile(file)) {return "fileImage";}
  const ext = getFileExtension(file.name);
  if (ext === ".pdf") {return "filePdf";}
  if ([".doc", ".docx"].includes(ext)) {return "fileWord";}
  if ([".xlsx", ".xls", ".csv"].includes(ext)) {return "fileSpreadsheet";}
  return "fileIcon";
}

const OFFICE_EXTENSIONS = [".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"] as const;

export function isOfficeFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return (OFFICE_EXTENSIONS as readonly string[]).includes(ext);
}

export function isCsvFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return ext === ".csv" || file.type.toLowerCase() === "text/csv";
}

export function isPublicHttpUrl(url: string | null | undefined): boolean {
  if (!url) {return false;}
  return /^https?:\/\//i.test(url);
}

export function getOfficeOnlineEmbedUrl(publicFileUrl: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicFileUrl)}`;
}

export function canInlineIframePreview(
  file: File,
  enableDocumentPreview: boolean,
  url: string | null,
): boolean {
  if (!enableDocumentPreview || !url) {return false;}
  if (isCsvFile(file)) {return true;}
  if (isOfficeFile(file)) {return isPublicHttpUrl(url);}
  const mime = file.type.toLowerCase();
  return (
    mime === "application/pdf" ||
    mime.startsWith("text/") ||
    mime === "application/json"
  );
}
