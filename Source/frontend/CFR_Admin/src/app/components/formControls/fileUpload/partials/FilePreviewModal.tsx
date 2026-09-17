import { useEffect, useState } from "react";
import {
  CommonButton,
  BUTTON_PRESETS,
  CommonIconButton,
} from "@app/components/buttons";
import {
  themeFormControlTextClass,
} from "@designSystem/theme/styles/componentStyle";
import { cn } from "@app/utilities/cn";
import { formatFileSize, getFileExtension } from "../fileUpload.utils";
import type { UploadPreviewItem } from "../fileUpload.utils";
import {
  canPreviewZoom,
  getFilePreviewKind,
} from "../filePreview/filePreview.utils";
import { FilePreviewRenderer } from "./FilePreviewRenderer";
import { AppIcon } from "@app/components/icons";

interface FilePreviewModalProps {
  isOpen: boolean;
  items: UploadPreviewItem[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  onRemoveCurrent?: (index: number) => void;
  enableDocumentPreview?: boolean;
}

export function FilePreviewModal({
  isOpen,
  items,
  currentIndex,
  onClose,
  onIndexChange,
  onRemoveCurrent,
  enableDocumentPreview = false,
}: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<"fit" | "actual">("fit");
  const safeIndex = Math.max(0, Math.min(currentIndex, items.length - 1));
  const item = items[safeIndex];
  const hasNav = items.length > 1;
  const atFirst = safeIndex <= 0;
  const atLast = safeIndex >= items.length - 1;

  const previewKind = item?.file
    ? getFilePreviewKind(item.file, item.url, enableDocumentPreview)
    : "unsupported";
  const zoomEnabled = canPreviewZoom(previewKind);

  // Prop-driven reset, adjusted during render rather than in an effect (React's own recommended
  // pattern for "state that resets when a prop identity changes") — zoom/view-mode reset whenever
  // the modal opens or navigates to a different item. The sentinel tracks every isOpen/safeIndex
  // change (matching the old effect's `[isOpen, safeIndex]` dependency exactly); the reset itself
  // still only fires while open, same as the original `if (isOpen)` guard.
  const [renderedForOpenState, setRenderedForOpenState] = useState({ isOpen, safeIndex });
  if (renderedForOpenState.isOpen !== isOpen || renderedForOpenState.safeIndex !== safeIndex) {
    setRenderedForOpenState({ isOpen, safeIndex });
    if (isOpen) {
      setZoom(1);
      setViewMode("fit");
    }
  }

  useEffect(() => {
    if (!isOpen) {return;}
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      setZoom(1);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {return;}
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowLeft" && !atFirst) {
        event.preventDefault();
        onIndexChange?.(safeIndex - 1);
      }
      if (event.key === "ArrowRight" && !atLast) {
        event.preventDefault();
        onIndexChange?.(safeIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); };
  }, [isOpen, atFirst, atLast, onIndexChange, safeIndex, onClose]);

  if (!isOpen || !item) {return null;}

  const goPrev = () => hasNav && !atFirst && onIndexChange?.(safeIndex - 1);
  const goNext = () => hasNav && !atLast && onIndexChange?.(safeIndex + 1);
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="File preview"
      onClick={onClose}
    >
      <div
        className="relative z-10 flex flex-col w-full max-w-xl max-h-[85vh] rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--line)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-13 items-center justify-between border-b border-white/15 bg-[var(--primary)] px-4 py-2.5">
          <div className="min-w-0">
            <p
              className={cn(
                "truncate font-semibold text-white",
                themeFormControlTextClass,
              )}
            >
              {item.file.name}
            </p>
            <p className="text-xs text-white/80">
              {safeIndex + 1} of {items.length} •{" "}
              {formatFileSize(item.file.size)} •{" "}
              {item.file.type ||
                getFileExtension(item.file.name) ||
                "Unknown type"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white"
            aria-label="Close preview"
          >
            <AppIcon name="x" size={18} />
          </button>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[var(--surface-muted)] min-h-[260px] max-h-[50vh] p-3">
          <FilePreviewRenderer
            item={item}
            zoom={zoom}
            viewMode={viewMode}
            enableDocumentPreview={enableDocumentPreview}
          />

          {hasNav ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3">
              <CommonIconButton
                aria-label="Previous file"
                type="button"
                size="md"
                iconName="chevronLeft"
                onClick={goPrev}
                disabled={atFirst}
                variant="primary"
                tone="solid"
                className="pointer-events-auto h-10 w-10 rounded-full border border-white/15 shadow-xl"
              />
              <CommonIconButton
                aria-label="Next file"
                type="button"
                size="md"
                iconName="chevronRight"
                onClick={goNext}
                disabled={atLast}
                variant="primary"
                tone="solid"
                className="pointer-events-auto h-10 w-10 rounded-full border border-white/15 shadow-xl"
              />
            </div>
          ) : null}
        </div>

        <div className="border-t border-[var(--line-soft)] bg-[var(--surface)] p-2.5">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <CommonIconButton
              aria-label="Zoom out"
              type="button"
              iconName="zoomOut"
              onClick={() => { setZoom((z) => Math.max(0.5, z - 0.25)); }}
              disabled={!zoomEnabled}
            />
            <span className="min-w-10 text-center text-xs font-medium text-[var(--text-muted)]">
              {zoomPercent}%
            </span>
            <CommonIconButton
              aria-label="Zoom in"
              type="button"
              iconName="zoomIn"
              onClick={() => { setZoom((z) => Math.min(3, z + 0.25)); }}
              disabled={!zoomEnabled}
            />
            <CommonButton
              {...BUTTON_PRESETS.cancel}
              type="button"
              size="sm"
              onClick={() => { setViewMode("fit"); }}
              disabled={!zoomEnabled}
            >
              <span className="inline-flex items-center gap-1">
                <AppIcon name="minimize2" size={14} />
                Fit
              </span>
            </CommonButton>
            <CommonButton
              {...BUTTON_PRESETS.cancel}
              type="button"
              size="sm"
              onClick={() => { setViewMode("actual"); }}
              disabled={!zoomEnabled}
            >
              <span className="inline-flex items-center gap-1">
                <AppIcon name="maximize2" size={14} />
                Actual
              </span>
            </CommonButton>
            <CommonButton
              {...BUTTON_PRESETS.cancel}
              type="button"
              size="sm"
              onClick={() => {
                setZoom(1);
                setViewMode("fit");
              }}
              disabled={!zoomEnabled}
            >
              <span className="inline-flex items-center gap-1">
                <AppIcon name="rotateCcw" size={14} />
                Reset
              </span>
            </CommonButton>
            {onRemoveCurrent ? (
              <CommonButton
                {...BUTTON_PRESETS.delete}
                type="button"
                size="sm"
                onClick={() => { onRemoveCurrent(safeIndex); }}
              >
                Remove
              </CommonButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
