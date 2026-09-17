import { useState } from "react";
import { cn } from "@app/utilities/cn";
import {
  themeFieldBaseClass,
  themeFieldDisabledActionButtonClass,
  themeFieldDisabledClass,
  themeControlFieldIconClass,
} from "@designSystem/theme/styles/componentStyle";
import type {
  RichTextFormatBlock,
  RichTextToolbarActionId,
  RichTextToolbarState,
} from "./richTextEditor.types";
import {
  FORMAT_BLOCK_OPTIONS,
  RICH_TEXT_TOOLBAR_ACTIONS,
  RICH_TEXT_TOOLBAR_GROUPS,
} from "./richTextEditor.toolbarConfig";
import { RichTextToolbarButton } from "./RichTextToolbarButton";
import {
  applyImage,
  applyLink,
  applyTable,
  formatBlockCommandValue,
  getExistingLinkValue,
  runEditorCommand,
} from "./richTextEditor.utils";
import { RichTextUrlDialog, type RichTextUrlDialogState } from "./RichTextUrlDialog";
import { AppIcon } from "@app/components/icons";

export interface RichTextToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
  toolbarState: RichTextToolbarState;
  onAfterCommand: () => void;
}

export function RichTextToolbar({
  editorRef,
  disabled = false,
  toolbarState,
  onAfterCommand,
}: RichTextToolbarProps) {
  const editor = editorRef.current;
  const isDisabled = disabled;
  const [urlDialog, setUrlDialog] = useState<RichTextUrlDialogState | null>(null);

  const run = (command: string, value?: string) => {
    runEditorCommand(editor, command, value);
    onAfterCommand();
  };

  const handleAction = (id: RichTextToolbarActionId) => {
    const action = RICH_TEXT_TOOLBAR_ACTIONS[id];
    if (id === "link" || id === "image") {
      // Capture the current selection now, before focus moves to the dialog's own input field -
      // see RichTextUrlDialogState.savedRange for why this has to happen here, synchronously.
      const selection = window.getSelection();
      const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
      setUrlDialog({
        kind: id,
        initialValue: id === "link" ? getExistingLinkValue() : "https://",
        savedRange,
      });
      return;
    }
    if (id === "table") {
      applyTable(editor);
      onAfterCommand();
      return;
    }
    if (action.command) {
      run(action.command);
    }
  };

  const handleUrlDialogConfirm = (url: string) => {
    if (!urlDialog) {return;}
    editor?.focus();
    const selection = window.getSelection();
    if (selection && urlDialog.savedRange) {
      selection.removeAllRanges();
      selection.addRange(urlDialog.savedRange);
    }

    if (urlDialog.kind === "link") {
      applyLink(editor, url);
    } else {
      applyImage(editor, url);
    }

    setUrlDialog(null);
    onAfterCommand();
  };

  // undo/redo overload toolbarState's per-id boolean for *enabled*, not *pressed* - excluded here
  // so they never render with the toggle-button "active" styling.
  const isPressed = (id: RichTextToolbarActionId): boolean =>
    id !== "undo" && id !== "redo" && Boolean(toolbarState[id]);

  const isActionDisabled = (id: RichTextToolbarActionId): boolean => {
    if (isDisabled) {return true;}
    if (id === "undo") {return !toolbarState.undo;}
    if (id === "redo") {return !toolbarState.redo;}
    return false;
  };

  return (
    <>
    <div
      className="flex flex-nowrap items-center gap-0.5 overflow-x-auto border-b border-border bg-background-muted/50 p-1.5"
      role="toolbar"
      aria-label="Rich text formatting"
    >
      <div className="mx-0.5 shrink-0">
        <label className="sr-only" htmlFor="rich-text-format-block">
          Paragraph style
        </label>
        <select
          id="rich-text-format-block"
          disabled={isDisabled}
          value={toolbarState.formatBlock ?? "p"}
          title="Paragraph style"
          aria-label="Paragraph style"
          onChange={(event) => {
            const next = event.target.value as RichTextFormatBlock;
            runEditorCommand(
              editor,
              "formatBlock",
              formatBlockCommandValue(next),
            );
            onAfterCommand();
          }}
          className={cn(
            themeFieldBaseClass,
            "h-8 min-w-[7.25rem] max-w-[9rem] shrink-0 py-0 text-xs shadow-none",
            isDisabled && themeFieldDisabledClass,
          )}
        >
          {FORMAT_BLOCK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />

      {RICH_TEXT_TOOLBAR_GROUPS.map((group, groupIndex) => (
        <div
          key={group.join("-")}
          className="flex shrink-0 items-center gap-0.5"
        >
          {group.map((actionId) => {
            const action = RICH_TEXT_TOOLBAR_ACTIONS[actionId];
            const Icon = action.icon;

            if (actionId === "foreColor" || actionId === "highlightColor") {
              const isHighlight = actionId === "highlightColor";
              return (
                <label
                  key={actionId}
                  title={action.label}
                  aria-label={action.label}
                  onMouseDown={(event) => { event.preventDefault(); }}
                  className={cn(
                    "relative inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-muted",
                    "hover:bg-background hover:text-foreground",
                    "focus-within:ring-2 focus-within:ring-primary-500/35",
                    isDisabled &&
                      cn(
                        "pointer-events-none",
                        themeFieldDisabledActionButtonClass,
                      ),
                  )}
                >
                  <AppIcon
                    name={Icon}
                    size="controlField"
                    className={themeControlFieldIconClass}
                    decorative
                  />
                  <input
                    type="color"
                    title={action.label}
                    aria-label={action.label}
                    disabled={isDisabled}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    defaultValue={isHighlight ? "#fff3b0" : "#1e3a5f"}
                    onInput={(event) => {
                      run(action.command ?? "foreColor", event.currentTarget.value);
                    }}
                  />
                </label>
              );
            }

            return (
              <RichTextToolbarButton
                key={actionId}
                label={action.label}
                icon={
                  <AppIcon
                    name={Icon}
                    size="controlField"
                    className={cn("shrink-0", themeControlFieldIconClass)}
                    decorative
                  />
                }
                pressed={isPressed(actionId)}
                disabled={isActionDisabled(actionId)}
                onClick={() => { handleAction(actionId); }}
              />
            );
          })}
          {groupIndex < RICH_TEXT_TOOLBAR_GROUPS.length - 1 ? (
            <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />
          ) : null}
        </div>
      ))}
    </div>
    <RichTextUrlDialog
      state={urlDialog}
      onCancel={() => setUrlDialog(null)}
      onConfirm={handleUrlDialogConfirm}
    />
    </>
  );
}
