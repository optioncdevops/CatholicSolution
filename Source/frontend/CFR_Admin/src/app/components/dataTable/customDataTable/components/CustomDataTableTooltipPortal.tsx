import { createPortal } from "react-dom";
import { cn } from "@app/utilities/cn";
import { resolveDataTablePortalLayerClass } from "@designSystem/theme/styles/componentStyle";

export type CustomDataTableTooltipState = {
  x: number;
  y: number;
  text: string;
} | null;

interface CustomDataTableTooltipPortalProps {
  tooltip: CustomDataTableTooltipState;
}

export function CustomDataTableTooltipPortal({
  tooltip,
}: CustomDataTableTooltipPortalProps) {
  if (!tooltip) {return null;}

  return createPortal(
    <div
      className={cn("fixed pointer-events-none", resolveDataTablePortalLayerClass())}
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y - 8}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="px-2 py-1 text-xs font-medium text-white bg-[var(--primary)] rounded shadow-lg ">
        {tooltip.text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
      </div>
    </div>,
    document.body,
  );
}
