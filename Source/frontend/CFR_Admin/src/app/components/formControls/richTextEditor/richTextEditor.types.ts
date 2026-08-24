import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import type { AppIconName } from "@app/components/icons";
import type { FormFieldInfoTooltipProp } from "../formControlFieldProps";

export type RichTextFormatBlock = "p" | "h1" | "h2" | "h3" | "blockquote";

export type RichTextToolbarActionId =
  | "undo"
  | "redo"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "alignJustify"
  | "link"
  | "unlink"
  | "bulletList"
  | "numberedList"
  | "outdent"
  | "indent"
  | "foreColor";

export interface RichTextToolbarAction {
  id: RichTextToolbarActionId;
  label: string;
  icon: AppIconName;
  command?: string;
  queryCommand?: string;
  queryValue?: string;
}

export type RichTextToolbarState = Partial<Record<RichTextToolbarActionId, boolean>> & {
  formatBlock: RichTextFormatBlock;
};

export interface RichTextEditorProps<TFieldValues extends FieldValues = FieldValues>
  extends FormFieldInfoTooltipProp {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  /** Alias for `onChange` (legacy consumers). */
  onValueChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
  optional?: boolean;
  required?: boolean;
  maxLength?: number;
  minHeight?: number | string;
  className?: string;
  id?: string;
  control?: Control<TFieldValues>;
  name?: string;
  rules?: RegisterOptions<TFieldValues>;
}
