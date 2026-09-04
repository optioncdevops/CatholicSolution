import type { AppIconName } from "@app/components/icons";
import type {
  RichTextFormatBlock,
  RichTextToolbarAction,
  RichTextToolbarActionId,
} from "./richTextEditor.types";

export const FORMAT_BLOCK_OPTIONS: readonly {
  label: string;
  value: RichTextFormatBlock;
}[] = [
  { label: "Paragraph", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Quote", value: "blockquote" },
  { label: "Code", value: "pre" },
] as const;

function commandAction(
  id: RichTextToolbarActionId,
  label: string,
  icon: AppIconName,
  command: string,
): RichTextToolbarAction {
  return { id, label, icon, command };
}

function toggleAction(
  id: RichTextToolbarActionId,
  label: string,
  icon: AppIconName,
  command: string,
): RichTextToolbarAction {
  return { id, label, icon, command, queryCommand: command };
}

/** Central registry for toolbar buttons (icons, labels, execCommand names). */
export const RICH_TEXT_TOOLBAR_ACTIONS: Record<
  RichTextToolbarActionId,
  RichTextToolbarAction
> = {
  undo: commandAction("undo", "Undo", "undo2", "undo"),
  redo: commandAction("redo", "Redo", "redo2", "redo"),

  bold: toggleAction("bold", "Bold", "bold", "bold"),
  italic: toggleAction("italic", "Italic", "italic", "italic"),
  underline: toggleAction("underline", "Underline", "underline", "underline"),
  strike: toggleAction("strike", "Strikethrough", "strikethrough", "strikeThrough"),
  foreColor: commandAction("foreColor", "Text color", "baseline", "foreColor"),
  highlightColor: commandAction("highlightColor", "Highlight color", "palette", "hiliteColor"),

  alignLeft: toggleAction("alignLeft", "Align left", "alignLeft", "justifyLeft"),
  alignCenter: toggleAction("alignCenter", "Align center", "alignCenter", "justifyCenter"),
  alignRight: toggleAction("alignRight", "Align right", "alignRight", "justifyRight"),
  alignJustify: toggleAction("alignJustify", "Justify", "alignJustify", "justifyFull"),

  link: { id: "link", label: "Insert link", icon: "link" },
  unlink: commandAction("unlink", "Remove link", "link2Off", "unlink"),
  image: { id: "image", label: "Insert image", icon: "imagePlus" },
  table: { id: "table", label: "Insert table", icon: "table2" },
  horizontalRule: commandAction("horizontalRule", "Insert divider", "minus", "insertHorizontalRule"),

  bulletList: toggleAction("bulletList", "Bullet list", "list", "insertUnorderedList"),
  numberedList: toggleAction(
    "numberedList",
    "Numbered list",
    "listOrdered",
    "insertOrderedList",
  ),

  outdent: commandAction("outdent", "Decrease indent", "outdent", "outdent"),
  indent: commandAction("indent", "Increase indent", "indent", "indent"),

  removeFormat: commandAction("removeFormat", "Clear formatting", "eraser", "removeFormat"),
};

/**
 * Toolbar groups (separated by dividers). Order matches common document editors.
 * `foreColor` uses Baseline (A + underline) and renders as a color input in the toolbar.
 */
export const RICH_TEXT_TOOLBAR_GROUPS: readonly (readonly RichTextToolbarActionId[])[] = [
  ["undo", "redo"],
  ["bold", "italic", "underline", "strike", "foreColor", "highlightColor"],
  ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
  ["link", "unlink", "image", "table", "horizontalRule"],
  ["bulletList", "numberedList", "outdent", "indent"],
  ["removeFormat"],
] as const;
