import {
  createObjectUrl,
  getFileExtension,
  isPublicHttpUrl,
  revokeObjectUrl,
} from "../fileUpload.utils";
import type { UploadPreviewItem } from "../fileUpload.utils";

export interface ResolvedPreviewBlob {
  file: File;
  blob: Blob;
  /** Set when this utility created a temporary object URL that must be revoked. */
  objectUrl: string | null;
}

export interface ResolvePreviewBlobOptions {
  credentials?: RequestCredentials;
}

function extensionMime(fileName: string): string {
  const ext = getFileExtension(fileName);
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".pptx":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".csv": "text/csv",
    ".txt": "text/plain",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
  };
  return map[ext] ?? "";
}

/** Resolve MIME from header with extension fallback for empty/octet-stream uploads. */
export function resolvePreviewMime(file: File): string {
  const mime = file.type.toLowerCase().trim();
  if (mime && mime !== "application/octet-stream") {return mime;}
  return extensionMime(file.name);
}

/**
 * Resolve a previewable Blob from an upload item.
 * Supports local File objects, blob: URLs, and same-origin/API URLs.
 */
export async function resolvePreviewBlob(
  item: UploadPreviewItem,
  options: ResolvePreviewBlobOptions = {},
): Promise<ResolvedPreviewBlob> {
  const { file } = item;

  if (file.size > 0) {
    return { file, blob: file, objectUrl: null };
  }

  if (item.url?.startsWith("blob:")) {
    const response = await fetch(item.url);
    if (!response.ok) {
      throw new Error("Could not read the uploaded file blob.");
    }
    const blob = await response.blob();
    return { file, blob, objectUrl: null };
  }

  if (item.url && (isPublicHttpUrl(item.url) || item.url.startsWith("/"))) {
    const response = await fetch(item.url, {
      credentials: options.credentials ?? "include",
    });
    if (!response.ok) {
      throw new Error(
        response.status === 403 || response.status === 401
          ? "Preview download was blocked by authentication or CORS."
          : "Could not download this file for preview.",
      );
    }
    const blob = await response.blob();
    const objectUrl = createObjectUrl(
      new File([blob], file.name, {
        type: blob.type || resolvePreviewMime(file) || "application/octet-stream",
      }),
    );
    return {
      file,
      blob,
      objectUrl,
    };
  }

  throw new Error("No preview source is available for this file.");
}

export function revokeResolvedPreviewBlob(resolved: ResolvedPreviewBlob | null | undefined): void {
  if (resolved?.objectUrl) {
    revokeObjectUrl(resolved.objectUrl);
  }
}

export async function resolvePreviewArrayBuffer(
  item: UploadPreviewItem,
  options?: ResolvePreviewBlobOptions,
): Promise<{ buffer: ArrayBuffer; revoke: () => void }> {
  const resolved = await resolvePreviewBlob(item, options);
  const buffer = await resolved.blob.arrayBuffer();
  return {
    buffer,
    revoke: () => { revokeResolvedPreviewBlob(resolved); },
  };
}

export async function resolvePreviewObjectUrl(
  item: UploadPreviewItem,
  options?: ResolvePreviewBlobOptions,
): Promise<{ url: string; revoke: () => void; owned: boolean }> {
  const resolved = await resolvePreviewBlob(item, options);

  if (resolved.objectUrl) {
    return {
      url: resolved.objectUrl,
      owned: true,
      revoke: () => { revokeResolvedPreviewBlob(resolved); },
    };
  }

  if (item.url?.startsWith("blob:") || item.url?.startsWith("http")) {
    return { url: item.url, owned: false, revoke: () => undefined };
  }

  const url = createObjectUrl(resolved.blob);
  return {
    url,
    owned: true,
    revoke: () => { revokeObjectUrl(url); },
  };
}
