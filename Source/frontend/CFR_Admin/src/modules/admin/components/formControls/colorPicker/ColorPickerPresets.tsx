import { AppIcon } from "@app/components/icons";
import { cn } from "@app/utilities/cn";

interface ColorPickerPresetsProps {
  palette: string[];
  committed: string | null;
  disabled?: boolean;
  onSelect: (preset: string) => void;
}

export function ColorPickerPresets({
  palette,
  committed,
  disabled,
  onSelect,
}: ColorPickerPresetsProps) {
  if (palette.length === 0) {return null;}

  return (
    <div
      className="mt-2 flex flex-wrap gap-1.5"
      role="listbox"
      aria-label="Color presets"
    >
      {palette.map((preset) => {
        const selected = committed === preset;
        return (
          <button
            key={preset}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={disabled}
            title={preset}
            aria-label={`Select color ${preset}`}
            onClick={() => { onSelect(preset); }}
            className={cn(
              "relative h-7 w-7 rounded-md border border-border transition-[box-shadow,transform] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              selected &&
                "ring-2 ring-primary-600 ring-offset-1 ring-offset-background dark:ring-primary-400",
            )}
            style={{ backgroundColor: preset }}
          >
            {selected ? (
              <AppIcon
                name="check"
                size="controlField"
                className="absolute inset-0 m-auto text-white drop-shadow-sm"
                decorative
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
