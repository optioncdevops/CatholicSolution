import { useEffect, useId, useMemo, useRef, useState } from "react";
import { themeLabelClass } from "@designSystem/theme/styles/componentStyle";
import { cn } from "@app/utilities/cn";
import { FileDropZone } from "./fileUpload/partials/FileDropZone";
import { FileSelectedCard } from "./fileUpload/partials/FileSelectedCard";
import { FilePreviewModal } from "./fileUpload/partials/FilePreviewModal";
import {
  createObjectUrl,
  isImageFile,
  revokeObjectUrl,
} from "./fileUpload/fileUpload.utils";
import type { UploadPreviewItem } from "./fileUpload/fileUpload.utils";

interface MultiImageUploadProps {
  label?: string;
  disabled?: boolean;
  onImagesChange?: (count: number) => void;
  maxFiles?: number;
}

const IMAGE_ACCEPT = "image/*";

export const MultiImageUpload = ({
  label = "Multi Image Upload",
  disabled,
  onImagesChange,
  maxFiles = 12,
}: MultiImageUploadProps) => {
  const reactId = useId().replace(/:/g, "");
  const inputBase = `multi-image-${reactId}`;
  const [items, setItems] = useState<UploadPreviewItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const itemsRef = useRef<UploadPreviewItem[]>([]);

  const addFiles = (files: File[]) => {
    if (!files.length) {return;}
    setItems((prev) => {
      const allowed = files
        .filter((file) => isImageFile(file))
        .slice(0, Math.max(0, maxFiles - prev.length));
      const next = [
        ...prev,
        ...allowed.map((file) => ({
          file,
          url: createObjectUrl(file),
          isImage: true,
        })),
      ];
      onImagesChange?.(next.length);
      return next;
    });
  };

  const removeAt = (index: number) => {
    setItems((prev) => {
      if (index < 0 || index >= prev.length) {return prev;}
      const target = prev[index];
      if (target) {revokeObjectUrl(target.url);}
      const next = prev.filter((_, i) => i !== index);
      onImagesChange?.(next.length);
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
    if (!nextFile || !isImageFile(nextFile)) {return;}
    setItems((prev) => {
      if (index < 0 || index >= prev.length) {return prev;}
      revokeObjectUrl(prev[index]?.url);
      const replacement: UploadPreviewItem = {
        file: nextFile,
        url: createObjectUrl(nextFile),
        isImage: true,
      };
      const next = prev.map((item, idx) =>
        idx === index ? replacement : item,
      );
      onImagesChange?.(next.length);
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
      <span className={themeLabelClass}>{label}</span>
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
            previewMode="compact"
            onPreview={() => {
              setActiveIndex(idx);
              setPreviewOpen(true);
            }}
            onReplace={(files) => { replaceAt(idx, files); }}
            onRemove={() => { removeAt(idx); }}
            replaceInputId={`${inputBase}-replace-${idx}`}
            accept={IMAGE_ACCEPT}
          />
        ))}
        {items.length < maxFiles ? (
          <FileDropZone
            id={`${inputBase}-upload`}
            title="Add images"
            description={`Up to ${maxFiles} images`}
            accept={IMAGE_ACCEPT}
            multiple
            compact
            disabled={disabled}
            onFiles={addFiles}
          />
        ) : null}
      </div>

      <FilePreviewModal
        isOpen={previewOpen}
        items={previewItems}
        currentIndex={activeIndex}
        onClose={() => { setPreviewOpen(false); }}
        onIndexChange={setActiveIndex}
        onRemoveCurrent={(index) => { removeAt(index); }}
      />
    </div>
  );
};
