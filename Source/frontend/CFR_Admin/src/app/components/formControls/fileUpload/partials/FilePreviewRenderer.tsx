import { themeCardMutedSurfaceClass } from "@designSystem/theme/styles/componentStyle";
import { getFileExtension, getOfficeOnlineEmbedUrl } from "../fileUpload.utils";
import type { UploadPreviewItem } from "../fileUpload.utils";
import { DocxPreviewPanel } from "../filePreview/DocxPreviewPanel";
import { TextPreviewPanel } from "../filePreview/TextPreviewPanel";
import { UnsupportedPreviewPanel } from "../filePreview/UnsupportedPreviewPanel";
import { XlsxPreviewPanel } from "../filePreview/XlsxPreviewPanel";
import {
  getFilePreviewKind,
  getPreviewSizeLimitMessage,
  isPreviewSizeAllowed,
} from "../filePreview/filePreview.utils";

interface FilePreviewRendererProps {
  item: UploadPreviewItem;
  zoom: number;
  viewMode: "fit" | "actual";
  enableDocumentPreview?: boolean;
}

function PublicOfficeEmbedPreview({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  return (
    <div className={`h-full w-full p-3 ${themeCardMutedSurfaceClass}`}>
      <iframe
        src={src}
        title={title}
        className="h-full w-full rounded-lg border border-border bg-background"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}

function ImagePreviewPanel({
  item,
  zoom,
  viewMode,
}: {
  item: UploadPreviewItem;
  zoom: number;
  viewMode: "fit" | "actual";
}) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center overflow-auto p-3 ${themeCardMutedSurfaceClass}`}
    >
      <img
        src={item.url ?? undefined}
        alt={item.file.name}
        style={{ transform: `scale(${zoom})` }}
        className={[
          "object-contain transition-transform duration-150",
          viewMode === "fit"
            ? "h-full w-full max-h-full max-w-full"
            : "h-auto w-auto max-h-none max-w-none",
        ].join(" ")}
      />
    </div>
  );
}

export function FilePreviewRenderer({
  item,
  zoom,
  viewMode,
  enableDocumentPreview = false,
}: FilePreviewRendererProps) {
  const fileExtension = getFileExtension(item.file.name) || "n/a";
  const previewKind = getFilePreviewKind(
    item.file,
    item.url,
    enableDocumentPreview,
  );
  const sizeAllowed = isPreviewSizeAllowed(item.file);

  if (
    !sizeAllowed &&
    previewKind !== "image" &&
    previewKind !== "unsupported"
  ) {
    return (
      <UnsupportedPreviewPanel
        item={item}
        fileExtension={fileExtension}
        previewKind={previewKind}
        sizeLimitExceeded
        sizeLimitMessage={getPreviewSizeLimitMessage(item.file)}
      />
    );
  }

  switch (previewKind) {
    case "image":
      return <ImagePreviewPanel item={item} zoom={zoom} viewMode={viewMode} />;
    case "pdf":
      // PDF rendering (react-pdf) is out of scope — free/OSS DataTable+formControls port
      // deliberately excludes PDF export/preview. Fall back to download/open, same as any
      // other unsupported-inline-preview file type.
      return (
        <UnsupportedPreviewPanel
          item={item}
          fileExtension={fileExtension}
          previewKind={previewKind}
        />
      );
    case "docx":
      return <DocxPreviewPanel item={item} />;
    case "xlsx":
    case "xls":
      return <XlsxPreviewPanel file={item.file} />;
    case "csv":
      return <TextPreviewPanel file={item.file} mode="csv" />;
    case "text":
    case "json":
      return <TextPreviewPanel file={item.file} mode={previewKind} />;
    case "public-office-embed":
      return item.url ? (
        <PublicOfficeEmbedPreview
          src={getOfficeOnlineEmbedUrl(item.url)}
          title={item.file.name}
        />
      ) : (
        <UnsupportedPreviewPanel
          item={item}
          fileExtension={fileExtension}
          previewKind="unsupported"
        />
      );
    case "pptx":
    case "doc":
    case "unsupported":
    default:
      return (
        <UnsupportedPreviewPanel
          item={item}
          fileExtension={fileExtension}
          previewKind={previewKind}
        />
      );
  }
}
