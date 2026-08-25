import React, {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@app/utilities/cn";
import {
  getStateName,
  isIndianVehicleNumberComplete,
  normalizeVehicleNumber,
  validateVehicleNumber,
  type VehicleValidationResult,
} from "./vehicleNumber/vehicleNumber.validator";
import {
  DEFAULT_VEHICLE_COUNTRY_CODE,
  getVehicleCountryOption,
  getVehicleInputMaxLength,
  getVehicleInputPlaceholder,
  maskVehicleNumberForCountry,
  VEHICLE_COUNTRY_OPTIONS,
} from "./vehicleNumber/vehicleNumber.utils";
import { computeFixedPortalPlacement } from "@designSystem/layouts/utilities/fixedPortalPlacement";
import {
  resolveFormControlPortalLayerClass,
  themeControlIconClass,
  themeFieldBaseClass,
  themeFieldBorderErrorClass,
  themeFieldBorderNormalClass,
  themeFieldDisabledClass,
  themeFieldDisabledIconClass,
  themeFieldReadonlyClass,
  themeFieldWrapperClass,
  themeFormControlMenuClass,
  themeFormControlMenuSearchInputClass,
  themeFormControlMenuSearchShellClass,
  themeFormControlTextClass,
} from "@designSystem/theme/styles/componentStyle";
import { FormFieldFeedback } from "./FormFieldFeedback";
import { FormFieldLabel } from "./FormFieldLabel";
import { AppIcon } from "@app/components/icons";

/** Search row + ~10 country rows before scroll. */
const COUNTRY_MENU_VISIBLE_ROWS = 10;
const COUNTRY_MENU_ROW_PX = 34;
const COUNTRY_MENU_SEARCH_PX = 44;
const COUNTRY_MENU_MAX_HEIGHT_PX =
  COUNTRY_MENU_SEARCH_PX + COUNTRY_MENU_VISIBLE_ROWS * COUNTRY_MENU_ROW_PX;
const COUNTRY_MENU_WIDTH_PX = 120;

export interface VehicleNumberInputProps {
  /** Formatted plate value, e.g. "TN 01 AJ 0001". */
  value: string;
  /** Emits spaced payload (India) or generic plate text. */
  onChange: (formattedValue: string) => void;
  onValidationChange?: (result: VehicleValidationResult) => void;
  /** ISO country code; defaults to IN. */
  countryCode?: string;
  onCountryChange?: (countryCode: string) => void;
  label?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showError?: boolean;
  validateOnMount?: boolean;
  /** Optional form-submit error. Auto-hides after the user edits. */
  error?: string;
  onBlur?: () => void;
}

function resolveInternalError(options: {
  showError: boolean;
  isTouched: boolean;
  countryCode: string;
  value: string;
  result: VehicleValidationResult;
}): string | undefined {
  const { showError, isTouched, countryCode, value, result } = options;
  if (!showError || !isTouched) {
    return undefined;
  }

  const trimmed = value.trim();

  // Required for every country once the field has been touched (blur / submit).
  if (!trimmed) {
    return "Vehicle number is required.";
  }

  if (countryCode !== "IN") {
    return undefined;
  }

  if (result.isValid) {
    return undefined;
  }

  if (result.error?.includes("state code")) {
    return result.error;
  }

  if (isIndianVehicleNumberComplete(trimmed)) {
    return result.error ?? "Vehicle number format is invalid.";
  }

  return "Enter TN 01 AJ 0001 (state) or 26 BH 4587 AK (Bharat).";
}

export const VehicleNumberInput = forwardRef<HTMLInputElement, VehicleNumberInputProps>(
  function VehicleNumberInput(
    {
      value,
      onChange,
      onValidationChange,
      countryCode: countryCodeProp,
      onCountryChange,
      label = "Vehicle Number",
      name,
      id,
      required,
      disabled,
      placeholder,
      className,
      showError = true,
      validateOnMount = false,
      error,
      onBlur,
    },
    ref,
  ) {
    const [isTouched, setIsTouched] = useState(false);
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const [internalCountry, setInternalCountry] = useState(DEFAULT_VEHICLE_COUNTRY_CODE);
    const [menuStyle, setMenuStyle] = useState({
      top: 0,
      left: 0,
      width: COUNTRY_MENU_WIDTH_PX,
      placement: "bottom" as "top" | "bottom",
      maxHeight: COUNTRY_MENU_MAX_HEIGHT_PX,
    });
    const valueWhenExternalErrorRef = useRef<string | null>(null);
    const countryFieldRef = useRef<HTMLDivElement>(null);
    const countryTriggerRef = useRef<HTMLButtonElement>(null);
    const countryPortalRef = useRef<HTMLDivElement>(null);
    const countrySearchRef = useRef<HTMLInputElement>(null);
    const reactId = useId();
    const fieldId = id ?? name ?? `vehicle-input-${reactId.replaceAll(":", "")}`;

    const countryCode = (countryCodeProp ?? internalCountry).toUpperCase();
    const country = getVehicleCountryOption(countryCode);
    const isIndia = countryCode === "IN";

    const externalError = error?.trim() ? error.trim() : undefined;

    useEffect(() => {
      if (externalError) {
        valueWhenExternalErrorRef.current = value;
      } else {
        valueWhenExternalErrorRef.current = null;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot only when error changes
    }, [externalError]);

    useEffect(() => {
      if (validateOnMount) {
        setIsTouched(true);
      }
    }, [validateOnMount]);

    const updateCountryMenuPlacement = () => {
      const trigger = countryTriggerRef.current;
      if (!trigger) {
        return;
      }
      // Pass null for menu so filtered search results do not shrink maxHeight
      // (measuring scrollHeight would collapse to ~3 rows after typing).
      const placement = computeFixedPortalPlacement(trigger, null, {
        estimatedMenuHeight: COUNTRY_MENU_MAX_HEIGHT_PX,
        menuWidth: COUNTRY_MENU_WIDTH_PX,
        minMenuWidth: COUNTRY_MENU_WIDTH_PX,
        align: "start",
      });
      setMenuStyle({
        ...placement,
        width: COUNTRY_MENU_WIDTH_PX,
        // Keep ~10 rows visible even while search filters the list.
        maxHeight: COUNTRY_MENU_MAX_HEIGHT_PX,
      });
    };

    useLayoutEffect(() => {
      if (!isCountryOpen) {
        return;
      }
      updateCountryMenuPlacement();
      const onReposition = () => {
        updateCountryMenuPlacement();
      };
      window.addEventListener("resize", onReposition);
      window.addEventListener("scroll", onReposition, true);
      return () => {
        window.removeEventListener("resize", onReposition);
        window.removeEventListener("scroll", onReposition, true);
      };
    }, [isCountryOpen]);

    useEffect(() => {
      if (!isCountryOpen) {
        return;
      }
      const onDocClick = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          countryFieldRef.current?.contains(target)
          || countryPortalRef.current?.contains(target)
        ) {
          return;
        }
        setIsCountryOpen(false);
        setCountrySearch("");
      };
      document.addEventListener("mousedown", onDocClick);
      window.setTimeout(() => countrySearchRef.current?.focus(), 0);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
      };
    }, [isCountryOpen]);

    const filteredCountries = useMemo(() => {
      const q = countrySearch.trim().toLowerCase();
      if (!q) {
        return VEHICLE_COUNTRY_OPTIONS;
      }
      return VEHICLE_COUNTRY_OPTIONS.filter((option) => {
        const code = option.code.toLowerCase();
        const name = option.name.toLowerCase();
        // Match ISO code, or name / word prefix — not mid-word (e.g. "in" in Argentina).
        if (code.includes(q) || name.startsWith(q)) {
          return true;
        }
        return name
          .split(/[\s/()-]+/)
          .some((word) => word.startsWith(q));
      });
    }, [countrySearch]);

    const displayValue = useMemo(
      () => maskVehicleNumberForCountry(value, countryCode),
      [value, countryCode],
    );

    const result = useMemo(() => {
      if (!isIndia) {
        const trimmed = value.trim();
        return {
          isValid: Boolean(trimmed),
          normalized: trimmed.toUpperCase(),
          compact: normalizeVehicleNumber(trimmed),
          formatted: trimmed.toUpperCase(),
          error: trimmed ? undefined : "Vehicle number is required.",
        } satisfies VehicleValidationResult;
      }
      return validateVehicleNumber(value);
    }, [isIndia, value]);

    useEffect(() => {
      onValidationChange?.(result);
    }, [onValidationChange, result]);

    const setCountry = (nextCode: string) => {
      const code = nextCode.toUpperCase();
      if (!countryCodeProp) {
        setInternalCountry(code);
      }
      onCountryChange?.(code);
      onChange("");
      setIsTouched(false);
      setIsCountryOpen(false);
      setCountrySearch("");
    };

    const emitMasked = (raw: string) => {
      onChange(maskVehicleNumberForCountry(raw, countryCode));
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      emitMasked(event.target.value);
    };

    /** Skip formatting spaces so Backspace can clear the plate. */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Backspace" || countryCode !== "IN") {
        return;
      }
      const input = event.currentTarget;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      if (start !== end || start === 0) {
        return;
      }
      const current = input.value;
      if (current[start - 1] !== " ") {
        return;
      }
      event.preventDefault();
      // Delete the space and the character before it.
      const cutFrom = Math.max(0, start - 2);
      emitMasked(current.slice(0, cutFrom) + current.slice(start));
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const next = event.relatedTarget as Node | null;
      // Stay inside the control (country button / portal menu) — don't mark touched yet.
      if (
        next
        && (countryFieldRef.current?.contains(next) || countryPortalRef.current?.contains(next))
      ) {
        return;
      }
      setIsTouched(true);
      if (value) {
        emitMasked(value);
      }
      onBlur?.();
    };

    const showExternalError =
      Boolean(externalError)
      && valueWhenExternalErrorRef.current !== null
      && value === valueWhenExternalErrorRef.current;

    const internalError = resolveInternalError({
      showError,
      isTouched,
      countryCode,
      value: displayValue,
      result,
    });

    const resolvedError = showExternalError ? externalError : internalError;

    const helperText = (() => {
      if (!isIndia) {
        return country.name;
      }
      if (result.stateName) {
        return result.stateName;
      }
      const compact = normalizeVehicleNumber(value);
      if (!compact) {
        return "India (It allow only valid state code or BH code)";
      }
      // Digit-first → Bharat series (same as previous helper behaviour).
      if (/^\d/.test(compact)) {
        return "Bharat Series";
      }
      // Letter-first → show state/UT name as soon as the 2-letter code is known.
      if (/^[A-Z]{2}/.test(compact)) {
        const stateName = getStateName(compact.slice(0, 2));
        if (stateName) {
          return stateName;
        }
      }
      return "India (It allow only valid state code or BH code)";
    })();

    const inputPlaceholder = placeholder ?? getVehicleInputPlaceholder(countryCode);

    const shellBorder = resolvedError
      ? themeFieldBorderErrorClass
      : themeFieldBorderNormalClass;
    const disabledClass = disabled
      ? cn(themeFieldDisabledClass, themeFieldDisabledIconClass, themeFieldReadonlyClass)
      : "";

    return (
      <div className={themeFieldWrapperClass}>
        <FormFieldLabel
          label={label}
          htmlFor={fieldId}
          required={required}
          error={Boolean(resolvedError)}
        />

        <div className={cn("relative flex min-w-0 items-stretch", className)} ref={countryFieldRef}>
          <button
            ref={countryTriggerRef}
            type="button"
            disabled={disabled}
            aria-label="Select country"
            aria-expanded={isCountryOpen}
            title={country.name}
            onClick={() => {
              setIsCountryOpen((open) => !open);
            }}
            className={cn(
              themeFieldBaseClass,
              "flex w-14 shrink-0 items-center justify-center gap-1 rounded-r-none border-r-0 px-1.5",
              shellBorder,
              disabledClass,
            )}
          >
            <img
              src={country.flagUrl}
              alt=""
              width={18}
              height={13}
              className="h-3.5 w-[18px] rounded-[2px] object-cover"
              loading="lazy"
            />
            <span className="text-[11px] font-semibold leading-none tracking-tight">
              {country.code}
            </span>
          </button>

          {isCountryOpen
            && !disabled
            && typeof document !== "undefined"
            && createPortal(
              <div
                ref={countryPortalRef}
                className={cn(
                  "fixed flex flex-col overflow-hidden animate-popup",
                  resolveFormControlPortalLayerClass(),
                  themeFormControlMenuClass,
                  menuStyle.placement === "top" && "animate-popup-top",
                )}
                style={{
                  top: `${menuStyle.top}px`,
                  left: `${menuStyle.left}px`,
                  width: `${COUNTRY_MENU_WIDTH_PX}px`,
                  maxHeight: `${menuStyle.maxHeight}px`,
                }}
                role="listbox"
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
              >
                <div className={themeFormControlMenuSearchShellClass}>
                  <div className={cn(themeFormControlMenuSearchInputClass, "px-1.5")}>
                    <AppIcon
                      name="search"
                      size="controlField"
                      className={themeControlIconClass}
                    />
                    <input
                      ref={countrySearchRef}
                      type="text"
                      tabIndex={-1}
                      className={cn(
                        "w-full min-w-0 bg-transparent outline-none",
                        themeFormControlTextClass,
                        "text-slate-800 dark:text-slate-100",
                      )}
                      placeholder="Search..."
                      value={countrySearch}
                      onChange={(event) => {
                        setCountrySearch(event.target.value);
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    />
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-0.5">
                  {filteredCountries.length === 0 ? (
                    <p className="px-1.5 py-2 text-center text-[10px] text-muted-foreground">
                      No match
                    </p>
                  ) : (
                    filteredCountries.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        role="option"
                        aria-selected={option.code === country.code}
                        title={option.name}
                        className={cn(
                          "flex h-[34px] w-full items-center gap-1.5 rounded-sm px-1.5 text-left hover:bg-muted",
                          option.code === country.code && "bg-muted/70 font-medium",
                        )}
                        onClick={() => {
                          setCountry(option.code);
                        }}
                      >
                        <img
                          src={option.flagUrl}
                          alt=""
                          width={18}
                          height={13}
                          className="h-3.5 w-[18px] shrink-0 rounded-[2px] object-cover"
                          loading="lazy"
                        />
                        <span className="text-xs font-semibold tracking-wide">
                          {option.code}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>,
              document.body,
            )}

          <input
            ref={ref}
            id={fieldId}
            name={name}
            type="text"
            inputMode="text"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={inputPlaceholder}
            autoComplete="off"
            maxLength={getVehicleInputMaxLength(countryCode)}
            className={cn(
              themeFieldBaseClass,
              "min-w-0 flex-1 rounded-l-none uppercase tracking-wide",
              shellBorder,
              disabledClass,
            )}
            aria-invalid={Boolean(resolvedError)}
          />
        </div>

        <FormFieldFeedback helperText={helperText} error={resolvedError} />
      </div>
    );
  },
);
