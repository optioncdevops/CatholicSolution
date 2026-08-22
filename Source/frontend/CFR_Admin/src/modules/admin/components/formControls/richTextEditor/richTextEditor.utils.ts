import type { RichTextFormatBlock, RichTextToolbarState } from "./richTextEditor.types";

export function focusEditor(editor: HTMLElement | null): void {
  editor?.focus();
}

export function runEditorCommand(
  editor: HTMLElement | null,
  command: string,
  value?: string,
): boolean {
  focusEditor(editor);
  try {
    return document.execCommand(command, false, value);
  } catch {
    return false;
  }
}

export function sanitizeRichTextUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {return null;}
  if (/^\s*javascript:/i.test(trimmed) || /^\s*data:/i.test(trimmed)) {return null;}
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {return trimmed;}
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}

export function applyLink(editor: HTMLElement | null): void {
  const existing = document.queryCommandValue("createLink");
  const initial =
    typeof existing === "string" && existing && existing !== "false"
      ? existing
      : "https://";
  const input = window.prompt("Enter URL", initial);
  if (input === null) {return;}
  const safe = sanitizeRichTextUrl(input);
  if (!safe) {
    window.alert("Invalid URL. Use http, https, mailto, or tel.");
    return;
  }
  runEditorCommand(editor, "createLink", safe);
}

export function normalizeFormatBlock(value: string): RichTextFormatBlock {
  const v = (value ?? "").toLowerCase();
  if (v.includes("h1")) {return "h1";}
  if (v.includes("h2")) {return "h2";}
  if (v.includes("h3")) {return "h3";}
  if (v.includes("blockquote")) {return "blockquote";}
  return "p";
}

export function formatBlockCommandValue(block: RichTextFormatBlock): string {
  return block === "p" ? "<p>" : `<${block}>`;
}

export function readToolbarState(): RichTextToolbarState {
  const alignLeft = document.queryCommandState("justifyLeft");
  const alignCenter = document.queryCommandState("justifyCenter");
  const alignRight = document.queryCommandState("justifyRight");
  const alignJustify = document.queryCommandState("justifyFull");

  return {
    formatBlock: normalizeFormatBlock(
      document.queryCommandValue("formatBlock"),
    ),
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
    strike: document.queryCommandState("strikeThrough"),
    bulletList: document.queryCommandState("insertUnorderedList"),
    numberedList: document.queryCommandState("insertOrderedList"),
    alignLeft: alignLeft && !alignCenter && !alignRight && !alignJustify,
    alignCenter,
    alignRight,
    alignJustify,
  };
}

export function getPlainTextLength(html: string): number {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.length ?? 0;
}

export function selectionIsInside(editor: HTMLElement | null): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !editor) {return false;}
  const node = selection.anchorNode;
  return node !== null && editor.contains(node);
}
