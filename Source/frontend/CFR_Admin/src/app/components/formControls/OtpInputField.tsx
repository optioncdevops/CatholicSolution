import { useCallback, useEffect, useId, useRef } from "react";
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form";
import { Controller } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import {
  themeFieldBorderErrorClass,
  themeFieldDisabledClass,
  themeFieldWrapperClass,
} from "@designSystem/theme/styles/componentStyle";
import { FormFieldLabel } from "./FormFieldLabel";
import { FormFieldFeedback } from "./FormFieldFeedback";

const DEFAULT_OTP_LENGTH = 6;

const authOtpCellClass =
  "h-10 min-w-0 flex-1 max-w-[2.375rem] rounded-md border border-input-border bg-input px-0 py-2 text-center text-base font-semibold tabular-nums leading-none text-input-foreground shadow-none transition-[color,background-color,border-color,box-shadow] focus:border-input-border-focus focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-0 focus:ring-offset-card sm:h-11 sm:max-w-[2.75rem] sm:text-lg";

export interface OtpInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  length?: number;
  /** Focus the first digit box when the field mounts or becomes enabled. */
  autoFocus?: boolean;
}

export function OtpInputField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  rules,
  label = "Verification code",
  labelClassName,
  wrapperClassName,
  disabled = false,
  length = DEFAULT_OTP_LENGTH,
  autoFocus = false,
}: OtpInputFieldProps<TFieldValues>) {
  const reactId = useId();
  const fieldId = `${reactId}-otp`;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusCell = useCallback((index: number) => {
    const target = inputRefs.current[index];
    target?.focus();
    target?.select();
  }, []);

  useEffect(() => {
    if (!autoFocus || disabled) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      focusCell(0);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [autoFocus, disabled, focusCell]);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const value = typeof field.value === "string" ? field.value : "";
        const digits = Array.from({ length }, (_, index) => value[index] ?? "");
        const error = fieldState.error?.message;

        const setOtpValue = (next: string) => {
          field.onChange(next.replace(/\D/g, "").slice(0, length));
        };

        const replaceAt = (index: number, char: string) => {
          const chars = Array.from({ length }, (_, i) => value[i] ?? "");
          chars[index] = char;
          setOtpValue(chars.join(""));
        };

        const handlePaste = (raw: string, startIndex = 0) => {
          const pasted = raw.replace(/\D/g, "").slice(0, length - startIndex);
          if (!pasted) {
            return;
          }
          const chars = Array.from({ length }, (_, i) => value[i] ?? "");
          for (let i = 0; i < pasted.length; i += 1) {
            chars[startIndex + i] = pasted[i] ?? "";
          }
          setOtpValue(chars.join(""));
          focusCell(Math.min(startIndex + pasted.length, length - 1));
        };

        return (
          <div className={cn(themeFieldWrapperClass, wrapperClassName)}>
            <FormFieldLabel
              label={label}
              htmlFor={`${fieldId}-0`}
              className={labelClassName}
            />
            <div
              className="flex w-full max-w-full items-center justify-between gap-1 sm:gap-2"
              role="group"
              aria-label={label}
            >
              {digits.map((digit, index) => (
                <input
                  key={`${fieldId}-${index}`}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  id={`${fieldId}-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${index + 1} of ${length}`}
                  maxLength={1}
                  value={digit}
                  disabled={disabled}
                  className={cn(
                    authOtpCellClass,
                    error && themeFieldBorderErrorClass,
                    disabled && themeFieldDisabledClass,
                  )}
                  onChange={(event) => {
                    const nextChar = event.target.value
                      .replace(/\D/g, "")
                      .slice(-1);
                    replaceAt(index, nextChar);
                    if (nextChar && index < length - 1) {
                      focusCell(index + 1);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key.length === 1 &&
                      !/^\d$/.test(event.key) &&
                      !event.ctrlKey &&
                      !event.metaKey
                    ) {
                      event.preventDefault();
                      return;
                    }
                    if (event.key === "Backspace" && !digit && index > 0) {
                      event.preventDefault();
                      replaceAt(index - 1, "");
                      focusCell(index - 1);
                      return;
                    }
                    if (event.key === "ArrowLeft" && index > 0) {
                      event.preventDefault();
                      focusCell(index - 1);
                      return;
                    }
                    if (event.key === "ArrowRight" && index < length - 1) {
                      event.preventDefault();
                      focusCell(index + 1);
                    }
                  }}
                  onPaste={(event) => {
                    event.preventDefault();
                    handlePaste(event.clipboardData.getData("text"), index);
                  }}
                  onFocus={(event) => {
                    event.target.select();
                  }}
                />
              ))}
            </div>
            <FormFieldFeedback error={error} errorId={`${fieldId}-error`} />
          </div>
        );
      }}
    />
  );
}
