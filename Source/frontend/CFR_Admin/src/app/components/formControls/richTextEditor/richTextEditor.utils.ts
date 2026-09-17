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

/** The URL of the link the caret/selection is currently inside, or a fresh "https://" default. */
export function getExistingLinkValue(): string {
  const existing = document.queryCommandValue("createLink");
  return typeof existing === "string" && existing && existing !== "false"
    ? existing
    : "https://";
}

export function applyLink(editor: HTMLElement | null, url: string): void {
  runEditorCommand(editor, "createLink", url);
}

export function applyImage(editor: HTMLElement | null, url: string): void {
  runEditorCommand(editor, "insertImage", url);
}

// A plain HTML table (no execCommand equivalent) inserted via insertHTML — inline styles because
// this markup can end up in an emailed template body, where a <style> block won't be honored.
// Includes a header row by default (<th>), and collapses any active selection to its end first
// rather than letting insertHTML silently delete selected text — a word/sentence the admin had
// selected should still be there after the table lands, just above or below it.
export function applyTable(editor: HTMLElement | null): void {
  focusEditor(editor);
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
    selection.collapseToEnd();
  }

  const rows = 2;
  const cols = 3;
  const headerCell = '<th style="border:1px solid #d0d5dd;padding:6px 10px;background:#f1f5f9;text-align:left;">&nbsp;</th>';
  const headerRow = `<tr>${headerCell.repeat(cols)}</tr>`;
  const cell = '<td style="border:1px solid #d0d5dd;padding:6px 10px;">&nbsp;</td>';
  const row = `<tr>${cell.repeat(cols)}</tr>`;
  const table = `<table style="border-collapse:collapse;width:100%;">${headerRow}${row.repeat(rows)}</table><p></p>`;
  runEditorCommand(editor, "insertHTML", table);
}

export function normalizeFormatBlock(value: string): RichTextFormatBlock {
  const v = (value ?? "").toLowerCase();
  if (v.includes("h1")) {return "h1";}
  if (v.includes("h2")) {return "h2";}
  if (v.includes("h3")) {return "h3";}
  if (v.includes("blockquote")) {return "blockquote";}
  if (v.includes("pre")) {return "pre";}
  return "p";
}

export function formatBlockCommandValue(block: RichTextFormatBlock): string {
  return block === "p" ? "<p>" : `<${block}>`;
}

/** Whether `document.queryCommandEnabled(command)` reports there's history to act on. */
function queryCommandEnabledSafe(command: string): boolean {
  try {
    return document.queryCommandEnabled(command);
  } catch {
    // Not universally supported - default to enabled so a browser where this check throws never
    // ends up incorrectly locking out working undo/redo.
    return true;
  }
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
    // Overloads the same "boolean per action id" bag to mean *enabled* rather than *pressed* for
    // these two specific ids - RichTextToolbar reads them for that, and explicitly excludes both
    // from the "pressed" toggle-button styling so they don't visually look stuck "on".
    undo: queryCommandEnabledSafe("undo"),
    redo: queryCommandEnabledSafe("redo"),
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
