import { AppIcon } from "@app/components/icons";
import {
  themeFieldDisabledSurfaceClass,
  themeFormControlTextClass,
} from "@designSystem/theme/styles/componentStyle";
import { cn } from "@app/utilities/cn";

interface FileDropZoneProps {
  id: string;
  title: string;
  description: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onFiles: (files: File[]) => void;
}

export function FileDropZone({
  id,
  title,
  description,
  accept,
  multiple,
  disabled,
  compact = false,
  onFiles,
}: FileDropZoneProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-background-muted/30 text-center transition-colors",
        compact ? "min-h-9 rounded-md px-2 py-1.5" : "rounded-lg px-4 py-6",
        disabled
          ? themeFieldDisabledSurfaceClass
          : "hover:border-primary-400/70 hover:bg-background-muted/50",
      )}
    >
      <AppIcon
        name="upload"
        size={compact ? 14 : 24}
        className={cn(
          "text-foreground-muted",
          disabled && "text-slate-400 dark:text-slate-500",
          compact ? "mb-0.5" : "mb-2",
        )}
      />
      <p
        className={cn(
          "font-medium text-foreground",
          themeFormControlTextClass,
          compact && "leading-tight",
        )}
      >
        {title}
      </p>
      {description ? (
        <p
          className={cn(
            "text-foreground-muted",
            compact
              ? "mt-0.5 line-clamp-2 text-[10px] leading-tight"
              : "mt-0.5 text-xs",
          )}
        >
          {description}
        </p>
      ) : null}
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); }}
      />
    </label>
  );
}
