import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  FORM_CONTROL_CLASSES,
  themeFieldBorderErrorClass,
  themeFieldDisabledClass,
  themeFieldReadonlyClass,
  themeFieldWrapperClass,
  themeFormControlTextClass,
  themeHelperClass,
  themeRichTextDisabledShellClass,
} from "@designSystem/theme/styles/componentStyle";
import { FormFieldLabel } from "../FormFieldLabel";
import type {
  RichTextEditorProps,
  RichTextToolbarState,
} from "./richTextEditor.types";
import { RichTextToolbar } from "./RichTextToolbar";
import {
  getPlainTextLength,
  readToolbarState,
  selectionIsInside,
} from "./richTextEditor.utils";
import { sanitizeHtml } from "@app/utilities/sanitizeHtml";

const DEFAULT_TOOLBAR_STATE: RichTextToolbarState = { formatBlock: "p" };

type RichTextEditorFieldProps = Omit<
  RichTextEditorProps,
  "control" | "name" | "rules"
>;

function RichTextEditorField({
  label = "Rich Text",
  value,
  defaultValue,
  onChange,
  onValueChange,
  placeholder = "Start typing here...",
  disabled = false,
  readOnly = false,
  error,
  helperText,
  hideLabel = false,
  optional,
  required,
  infoTooltip,
  maxLength,
  minHeight = 120,
  className,
  id: idProp,
}: RichTextEditorFieldProps) {
  const reactId = useId();
  const fieldId = idProp ?? `rich-text-${reactId.replace(/:/g, "")}`;
  const labelId = `${fieldId}-label`;
  const editorRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [uncontrolledHtml, setUncontrolledHtml] = useState(defaultValue ?? "");
  const [toolbarState, setToolbarState] = useState<RichTextToolbarState>(
    DEFAULT_TOOLBAR_STATE,
  );

  const isEditingDisabled = disabled || readOnly;

  const emitHtml = useCallback(
    (html: string) => {
      onChange?.(html);
      onValueChange?.(html);
    },
    [onChange, onValueChange],
  );

  const refreshToolbar = useCallback(() => {
    if (!selectionIsInside(editorRef.current)) {return;}
    setToolbarState(readToolbarState());
  }, []);

  const emitChange = useCallback(() => {
    const raw = editorRef.current?.innerHTML ?? "";
    const html = sanitizeHtml(raw);
    if (!isControlled) {setUncontrolledHtml(html);}
    emitHtml(html);
    refreshToolbar();
  }, [isControlled, emitHtml, refreshToolbar]);

  useEffect(() => {
    const onSelectionChange = () => { refreshToolbar(); };
    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      { document.removeEventListener("selectionchange", onSelectionChange); };
  }, [refreshToolbar]);

  useEffect(() => {
    if (!isControlled || !editorRef.current) {return;}
    const safeHtml = sanitizeHtml(value ?? "");
    if (editorRef.current.innerHTML !== safeHtml) {
      editorRef.current.innerHTML = safeHtml;
    }
  }, [isControlled, value]);

  useEffect(() => {
    if (isControlled || !editorRef.current || defaultValue === undefined)
      {return;}
    editorRef.current.innerHTML = sanitizeHtml(defaultValue);
  }, [defaultValue, isControlled]);

  const htmlForCount = isControlled ? (value ?? "") : uncontrolledHtml;
  const plainLength = getPlainTextLength(htmlForCount);

  return (
    <div className={cn(themeFieldWrapperClass, className)}>
      <FormFieldLabel
        id={labelId}
        label={label}
        htmlFor={fieldId}
        required={required}
        optional={optional}
        error={!!error}
        infoTooltip={infoTooltip}
        hideLabel={hideLabel}
      />

      <div
        className={cn(
          "overflow-hidden rounded-lg border shadow-sm",
          FORM_CONTROL_CLASSES.defaultSurface,
          error ? themeFieldBorderErrorClass : FORM_CONTROL_CLASSES.focusWithin,
          disabled && themeRichTextDisabledShellClass,
          readOnly && !disabled && themeFieldReadonlyClass,
        )}
      >
        <RichTextToolbar
          editorRef={editorRef}
          disabled={disabled || readOnly}
          toolbarState={toolbarState}
          onAfterCommand={emitChange}
        />

        <div
          ref={editorRef}
          id={fieldId}
          role="textbox"
          aria-multiline
          // A native <label for> only reliably names labelable form elements (input/textarea/
          // select/...) - a custom role="textbox" div isn't one, so screen readers can't be
          // relied on to pick up the visible label through htmlFor alone; aria-labelledby is the
          // WAI-ARIA-authoring-practices-correct way to name a custom textbox widget.
          aria-labelledby={hideLabel ? undefined : labelId}
          aria-label={hideLabel ? label : undefined}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          aria-invalid={error ? true : undefined}
          contentEditable={!isEditingDisabled}
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={() => {
            if (maxLength !== undefined) {
              const len = editorRef.current?.textContent?.length ?? 0;
              if (len > maxLength) {
                document.execCommand("undo");
                return;
              }
            }
            emitChange();
          }}
          onBlur={emitChange}
          onKeyUp={refreshToolbar}
          onMouseUp={refreshToolbar}
          style={{ minHeight }}
          className={cn(
            "rich-text-editor__content px-3 py-2 text-foreground outline-none",
            themeFormControlTextClass,
            "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/25",
            "empty:before:pointer-events-none empty:before:text-[13px] empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] dark:empty:before:text-slate-500",
            disabled &&
              cn(
                themeFieldDisabledClass,
                "border-0 bg-transparent shadow-none",
              ),
            readOnly && !disabled && "cursor-default bg-transparent",
          )}
        />
      </div>

      <div className="flex items-start justify-between gap-2">
        {helperText ? (
          <p className={themeHelperClass}>{helperText}</p>
        ) : (
          <span />
        )}
        {maxLength !== undefined ? (
          <span className={cn(themeHelperClass, "shrink-0 tabular-nums")}>
            {plainLength}/{maxLength}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>
      ) : null}
    </div>
  );
}

export function RichTextEditor<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  rules,
  value,
  onChange,
  onValueChange,
  ...rest
}: RichTextEditorProps<TFieldValues>) {
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name as Path<TFieldValues>}
        rules={rules}
        render={({ field }) => (
          <RichTextEditorField
            {...rest}
            value={field.value ?? ""}
            onChange={(html) => {
              field.onChange(html);
              onChange?.(html);
              onValueChange?.(html);
            }}
          />
        )}
      />
    );
  }

  return (
    <RichTextEditorField
      {...rest}
      value={value}
      onChange={onChange}
      onValueChange={onValueChange}
    />
  );
}
