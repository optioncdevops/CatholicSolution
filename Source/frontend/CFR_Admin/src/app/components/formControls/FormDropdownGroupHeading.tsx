import { cn } from "@app/utilities/cn";
import {
  themeFormControlTextClass,
  themeFormDropdownGroupDividerClass,
  themeFormDropdownGroupHeadingClass,
} from "@designSystem/theme/styles/componentStyle";

interface FormDropdownGroupHeadingProps {
  id: string;
  label: string;
  showDivider?: boolean;
}

export const FormDropdownGroupHeading = ({
  id,
  label,
  showDivider = false,
}: FormDropdownGroupHeadingProps) => {
  return (
    <>
      {showDivider && (
        <div
          role="presentation"
          aria-hidden="true"
          className={themeFormDropdownGroupDividerClass}
        />
      )}
      <div
        id={id}
        role="presentation"
        className={cn(
          themeFormDropdownGroupHeadingClass,
          themeFormControlTextClass,
        )}
      >
        {label}
      </div>
    </>
  );
};
