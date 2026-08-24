import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@app/utilities/cn";
import { FileDropZone } from "./fileUpload/partials/FileDropZone";
import { FileSelectedCard } from "./fileUpload/partials/FileSelectedCard";
import { FilePreviewModal } from "./fileUpload/partials/FilePreviewModal";
import { FormFieldLabel } from "./FormFieldLabel";
import {
  createObjectUrl,
  isAcceptedFileType,
  isImageFile,
  revokeObjectUrl,
  validateFileCount,
  validateFileSize,
  formatMaxFileSizeLabel,
} from "./fileUpload/fileUpload.utils";
import type { UploadPreviewItem } from "./fileUpload/fileUpload.utils";

interface MultiFileUploadProps {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  helperText?: ReactNode;
  previewable?: boolean;
  removable?: boolean;
  replaceable?: boolean;
  enableDocumentPreview?: boolean;
  onFilesChange?: (files: File[]) => void;
}

export function MultiFileUpload({
  label = "Multiple files",
  required = false,
  disabled,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg",
  maxSizeMB = 10,
  maxFiles = 10,
  helperText,
  previewable = true,
  removable = true,
  replaceable = true,
  enableDocumentPreview = true,
  onFilesChange,
}: MultiFileUploadProps) {
  const reactId = useId().replace(/:/g, "");
  const inputBase = `multi-file-${reactId}`;
  const [items, setItems] = useState<UploadPreviewItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState("");
  const itemsRef = useRef<UploadPreviewItem[]>([]);

  const addFiles = (files: File[]) => {
    if (!files.length) {return;}
    setItems((prev) => {
      const available = maxFiles - prev.length;
      if (available <= 0) {
        setError(`Maximum ${maxFiles} files allowed.`);
        return prev;
      }
      const accepted = files
        .filter((file) => isAcceptedFileType(file, accept))
        .slice(0, available);
      const sized = accepted.filter((file) =>
        validateFileSize(file, maxSizeMB),
      );
      if (
        !validateFileCount([...prev.map((i) => i.file), ...sized], maxFiles)
      ) {
        setError(`Maximum ${maxFiles} files allowed.`);
        return prev;
      }
      if (sized.length !== files.slice(0, available).length) {
        setError(
          `Some files were skipped (type/size). Max size ${formatMaxFileSizeLabel(maxSizeMB)}.`,
        );
      } else {
        setError("");
      }
      const next = [
        ...prev,
        ...sized.map((file) => ({
          file,
          url: createObjectUrl(file),
          isImage: isImageFile(file),
        })),
      ];
      onFilesChange?.(next.map((item) => item.file));
      return next;
    });
  };

  const removeAt = (index: number) => {
    setItems((prev) => {
      if (index < 0 || index >= prev.length) {return prev;}
      const target = prev[index];
      revokeObjectUrl(target?.url);
      const next = prev.filter((_, i) => i !== index);
      onFilesChange?.(next.map((item) => item.file));
      setActiveIndex((current) => {
        if (!next.length) {return 0;}
        if (current > index) {return current - 1;}
        if (current === index) {return Math.min(index, next.length - 1);}
        return current;
      });
      if (!next.length) {setPreviewOpen(false);}
      return next;
    });
  };

  const replaceAt = (index: number, files: File[]) => {
    const nextFile = files[0];
    if (!nextFile) {return;}
    if (
      !isAcceptedFileType(nextFile, accept) ||
      !validateFileSize(nextFile, maxSizeMB)
    ) {
      setError(
        `Replacement file must match accepted types and be <= ${formatMaxFileSizeLabel(maxSizeMB)}.`,
      );
      return;
    }
    setItems((prev) => {
      if (index < 0 || index >= prev.length) {return prev;}
      revokeObjectUrl(prev[index]?.url);
      const replacement: UploadPreviewItem = {
        file: nextFile,
        url: createObjectUrl(nextFile),
        isImage: isImageFile(nextFile),
      };
      const next = prev.map((item, idx) =>
        idx === index ? replacement : item,
      );
      onFilesChange?.(next.map((item) => item.file));
      setError("");
      return next;
    });
  };

  const previewItems = useMemo(() => items, [items]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => { revokeObjectUrl(item.url); });
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {label ? <FormFieldLabel label={label} required={required} /> : null}
      <div
        className={cn(
          "grid grid-cols-1 gap-1.5",
          "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {items.map((item, idx) => (
          <FileSelectedCard
            key={`${item.file.name}-${idx}`}
            file={item.file}
            disabled={disabled}
            canPreview={previewable}
            removable={removable}
            replaceable={replaceable}
            previewMode="compact"
            onPreview={() => {
              setActiveIndex(idx);
              setPreviewOpen(true);
            }}
            onReplace={(files) => { replaceAt(idx, files); }}
            onRemove={() => { removeAt(idx); }}
            replaceInputId={`${inputBase}-replace-${idx}`}
            accept={accept}
          />
        ))}
        {items.length < maxFiles ? (
          <FileDropZone
            id={`${inputBase}-upload`}
            title="Add files"
            description={`Max ${formatMaxFileSizeLabel(maxSizeMB)} · Up to ${maxFiles} files`}
            accept={accept}
            multiple
            compact
            disabled={disabled}
            onFiles={addFiles}
          />
        ) : null}
      </div>
      {helperText ? (
        <p className="text-xs text-foreground-muted">{helperText}</p>
      ) : null}
      {error ? <p className="text-xs text-danger-500">{error}</p> : null}
      <FilePreviewModal
        isOpen={previewOpen}
        items={previewItems}
        currentIndex={activeIndex}
        onClose={() => { setPreviewOpen(false); }}
        onIndexChange={setActiveIndex}
        onRemoveCurrent={(index) => { removeAt(index); }}
        enableDocumentPreview={enableDocumentPreview}
      />
    </div>
  );
}
