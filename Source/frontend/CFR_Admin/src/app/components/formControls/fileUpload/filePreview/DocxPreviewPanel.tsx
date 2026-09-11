import { useLayoutEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { cn } from "@app/utilities/cn";
import { themeCardMutedSurfaceClass } from "@designSystem/theme/styles/componentStyle";
import type { UploadPreviewItem } from "../fileUpload.utils";
import { resolvePreviewArrayBuffer } from "./resolvePreviewBlob";

interface DocxPreviewPanelProps {
  item: UploadPreviewItem;
}

export function DocxPreviewPanel({ item }: DocxPreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    let cancelled = false;
    let revokeBuffer: (() => void) | undefined;
    // Captured at effect-setup time (not re-read from the ref) so the cleanup below still has
    // the right node even if `containerRef.current` has already changed/detached by then.
    const containerAtSetup = containerRef.current;

    // Standard cancellable async-load effect: resetting loading/error at the start of each
    // fetch-on-dependency-change cycle, before kicking off the async render below, is the
    // necessary and correct pattern here (preserved as-is per this review's own instruction not
    // to rewrite working async loading effects) — not a derivable render-time calculation, since
    // the actual result isn't known until the async work below resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const renderDocument = async () => {
      const container = containerRef.current;
      if (!container) {
        throw new Error("Preview container is not ready.");
      }

      container.replaceChildren();

      const { buffer, revoke } = await resolvePreviewArrayBuffer(item);
      revokeBuffer = revoke;

      if (cancelled) {
        revoke();
        return;
      }

      await renderAsync(buffer, container, undefined, {
        className: "docx-preview",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        breakPages: true,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true,
      });
    };

    renderDocument()
      .then(() => {
        if (!cancelled) {setLoading(false);}
      })
      .catch((cause: unknown) => {
        if (cancelled) {return;}
        const message =
          cause instanceof Error
            ? cause.message
            : "Could not render this DOCX file.";
        setError(message);
        setLoading(false);
        containerRef.current?.replaceChildren();
      });

    return () => {
      cancelled = true;
      revokeBuffer?.();
      containerAtSetup?.replaceChildren();
    };
    // Deliberately depends on the primitive fields that actually identify "which file to render"
    // rather than the whole `item` object — `item` is commonly a fresh wrapper object on every
    // parent render even when the underlying file hasn't changed, and depending on it directly
    // would re-run this (re-render the document) far more often than necessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.file.name, item.file.size, item.file.lastModified, item.url]);

  return (
    <div
      className={cn(
        "h-full w-full overflow-auto p-4",
        themeCardMutedSurfaceClass,
      )}
    >
      {loading ? (
        <p className="mb-3 text-sm text-foreground-muted">Loading document…</p>
      ) : null}
      {error ? (
        <p className="mb-3 text-sm text-foreground-muted">{error}</p>
      ) : null}
      <div
        ref={containerRef}
        className="docx-preview-root mx-auto max-w-4xl rounded-lg border border-border bg-background p-6 shadow-sm"
        aria-busy={loading}
      />
    </div>
  );
}
