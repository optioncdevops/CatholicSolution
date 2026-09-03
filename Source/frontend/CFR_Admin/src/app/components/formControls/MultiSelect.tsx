import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@app/utilities/cn";
import { FormFieldLabel } from "./FormFieldLabel";
import type {
  FormFieldInfoTooltipProp,
  SelectClearableProp,
} from "./formControlFieldProps";
import {
  DEFAULT_SELECT_CLEARABLE,
  hasMultiSelectValues,
  resolvePickerClearable,
} from "./formControlDefaults";
import { computeFixedPortalPlacement } from "@designSystem/layouts/utilities/fixedPortalPlacement";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import {
  themeControlClearButtonClass,
  themeControlClearIconClass,
  themeControlChevronClass,
  themeControlIconClass,
  themeFieldBorderErrorClass,
  themeFieldDisabledClass,
  themeFieldDisabledIconClass,
  themeFormControlMenuClass,
  themeFormControlMenuSearchInputClass,
  themeFormControlMenuSearchShellClass,
  resolveFormControlPortalLayerClass,
  themeFormControlTextClass,
  themeFormDropdownOptionClass,
  themeFormDropdownOptionDisabledClass,
  themeFormDropdownGroupOptionsClass,
  themeFormDropdownOptionHoverClass,
  themeFormDropdownOptionSelectedClass,
  themeMultiSelectChipClass,
  themeMultiSelectFieldBaseClass,
  themeMultiSelectTriggerShellClass,
  themeMultiSelectTriggerValueClass,
  themeMultiSelectTriggerActionsClass,
} from "@designSystem/theme/styles/componentStyle";
import { AppIcon } from "@app/components/icons";
import { FormDropdownGroupHeading } from "./FormDropdownGroupHeading";
import {
  areOptionIdsEqual,
  createGroupHeadingId,
  createGroupedOptionRenderKey,
  filterFlatOptions,
  filterGroupedOptions,
  flattenNormalizedOptions,
  isGroupedOptionsArray,
  isOptionDisabled,
  normalizeSelectOptions,
  serializeOptionIdForForm,
  toOptionIdentityKey,
  type NormalizedOptionGroup,
  type NormalizedSelectOption,
  type SelectOption,
  type SelectOptionGroup,
} from "./dropdownGroupedOptions";

export type MultiSelectOption = SelectOption;

export type MultiSelectOptionGroup = SelectOptionGroup;

export type MultiSelectOptions = SelectOption[] | SelectOptionGroup[];

interface BaseMultiSelectProps
  extends FormFieldInfoTooltipProp, SelectClearableProp {
  options: MultiSelectOptions;
  /** When true, `options` is interpreted as grouped sections. */
  isGrouped?: boolean;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  /** Show required asterisk in label (validation still handled by rules) */
  required?: boolean;
  /** Show “(optional)” suffix when the field is not required */
  optional?: boolean;
  /** Visually hide the label (keeps it accessible via sr-only). Useful inside table cells. */
  hideLabel?: boolean;
  className?: string;
  /** Controlled value (when not using react-hook-form) */
  value?: string[];
  /** Default value for uncontrolled mode */
  defaultValue?: string[];
  /** Change handler for uncontrolled/controlled usage outside of react-hook-form */
  onValueChange?: (value: string[]) => void;
  tabIndex?: number;
}

export interface MultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseMultiSelectProps {
  /** react-hook-form control object for controlled forms */
  control?: Control<TFieldValues>;
  /** Field name for react-hook-form (required when control is provided) */
  name?: string;
  /** Validation rules for react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

interface MultiSelectFieldContext {
  currentSelected: string[];
  fieldOnChange?: (val: string[]) => void;
}

const MultiSelectInner = <TFieldValues extends FieldValues = FieldValues>({
  options,
  isGrouped = false,
  label = "Multi-Select Dropdown",
  placeholder = "Select items...",
  helperText,
  error,
  disabled,
  searchable = true,
  clearable = DEFAULT_SELECT_CLEARABLE,
  showClearButton,
  hideClearButton,
  required,
  optional,
  hideLabel = false,
  infoTooltip,
  className,
  value,
  defaultValue,
  onValueChange,
  control,
  name,
  rules,
  tabIndex,
}: MultiSelectProps<TFieldValues>) => {
  const generatedId = useId();
  const fieldId = name ?? `multiselect-${generatedId.replace(/:/g, "")}`;
  const labelId = `${fieldId}-label`;
  const listboxId = `${fieldId}-listbox`;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState<string[]>(
    defaultValue ?? [],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fieldContextRef = useRef<MultiSelectFieldContext>({
    currentSelected: [],
  });
  // `fieldContext` is the render-safe source of truth for the latest selection / RHF
  // onChange; updated during render (guarded by a sentinel comparison) rather than via a
  // direct `fieldContextRef.current = ...` write in the render body, which react-hooks/refs
  // disallows. The effect below flushes it into `fieldContextRef` so the document keydown
  // listener (which needs the freshest value without re-subscribing on every change) keeps
  // working exactly as before.
  const [fieldContext, setFieldContext] = useState<MultiSelectFieldContext>({
    currentSelected: [],
  });
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
    placement: "top" | "bottom";
    maxHeight: number;
  }>({ top: 0, left: 0, width: 0, placement: "bottom", maxHeight: 240 });

  const selected = value ?? internalValue;
  const groupedMode = isGroupedOptionsArray(options ?? [], isGrouped);

  const normalizedOptions = useMemo<
    NormalizedSelectOption[] | NormalizedOptionGroup[]
  >(() => normalizeSelectOptions(options ?? [], groupedMode), [groupedMode, options]);

  const flatOptions = useMemo(
    () => flattenNormalizedOptions(normalizedOptions, groupedMode),
    [groupedMode, normalizedOptions],
  );

  const filteredOptions = useMemo(() => {
    if (groupedMode) {
      return filterGroupedOptions(
        normalizedOptions as NormalizedOptionGroup[],
        search,
      );
    }

    return filterFlatOptions(
      normalizedOptions as NormalizedSelectOption[],
      search,
    );
  }, [groupedMode, normalizedOptions, search]);

  const selectableOptions = useMemo(() => {
    if (groupedMode) {
      return (filteredOptions as NormalizedOptionGroup[]).flatMap((group) =>
        group.options.filter(
          (option) => !isOptionDisabled(option, group.disabled),
        ),
      );
    }

    return (filteredOptions as NormalizedSelectOption[]).filter(
      (option) => !option.disabled,
    );
  }, [filteredOptions, groupedMode]);

  const setSelected = (next: string[]) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const toggleOption = (
    optionId: string | number,
    externalOnChange?: (val: string[]) => void,
    currentSelectedList?: string[],
    optionDisabled = false,
  ) => {
    if (optionDisabled) {
      return;
    }

    const base = currentSelectedList ?? selected;
    const isSelected = base.some((selectedId) =>
      areOptionIdsEqual(selectedId, optionId),
    );
    const serializedId = serializeOptionIdForForm(optionId);
    const next = isSelected
      ? base.filter((selectedId) => !areOptionIdsEqual(selectedId, optionId))
      : [...base, serializedId];

    setSelected(next);
    externalOnChange?.(next);
  };

  const handleClear = (
    externalOnChange?: (val: string[]) => void,
    currentSelectedList?: string[],
  ) => {
    if (disabled) { return; }
    if (currentSelectedList?.length === 0) { return; }
    const empty: string[] = [];
    setSelected(empty);
    externalOnChange?.(empty);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const openMenu = () => {
    if (disabled) { return; }
    setIsOpen(true);
  };

  const closeMenu = (returnFocus = true) => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  };

  const updatePlacement = () => {
    if (!triggerRef.current || typeof window === "undefined" || !document.body) { return; }

    try {
      setMenuStyle(
        computeFixedPortalPlacement(triggerRef.current, menuRef.current, {
          estimatedMenuHeight: 260,
        }),
      );
    } catch (placementError) {
      console.warn("MultiSelect: Error calculating position", placementError);
    }
  };

  // Reset/seed `activeIndex` whenever the menu opens/closes or the selectable options change
  // while open. Adjusted during render (guarded by an isOpen/selectableOptions sentinel)
  // instead of inside an effect, so a stale index is never painted for one frame. (This
  // consolidates what were previously two separate effects sharing the same dependency
  // trigger — one resetting to 0/-1, the other clamping — since with the original effect
  // ordering the reset always ran first and made the clamp a no-op.)
  const [renderedForActiveIndex, setRenderedForActiveIndex] = useState({
    isOpen,
    selectableOptions,
  });
  if (
    renderedForActiveIndex.isOpen !== isOpen ||
    renderedForActiveIndex.selectableOptions !== selectableOptions
  ) {
    setRenderedForActiveIndex({ isOpen, selectableOptions });
    setActiveIndex(isOpen && selectableOptions.length > 0 ? 0 : -1);
  }

  useEffect(() => {
    if (!isOpen) { return; }
    if (searchable) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen, searchable, selectableOptions]);

  useEffect(() => {
    fieldContextRef.current = fieldContext;
  }, [fieldContext]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) { return; }
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !document.body) { return; }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      try {
        const target = event.target as Node | null;
        if (!target) { return; }

        const trigger = triggerRef.current;
        const menu = menuRef.current;
        const container = containerRef.current;

        if (!container) {
          closeMenu(false);
          return;
        }

        const insideContainer = container.contains(target);
        const insideTrigger = trigger?.contains(target);
        const insideMenu = menu?.contains(target);

        if (!insideContainer && !insideTrigger && !insideMenu) {
          closeMenu(false);
        }
      } catch (clickError) {
        console.warn("MultiSelect: Error handling click outside", clickError);
      }
    };

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key === "Tab") {
        closeMenu(false);
        return;
      }

      if (selectableOptions.length === 0) { return; }

      const isSearchFocused = document.activeElement === searchInputRef.current;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => {
          if (prev < selectableOptions.length - 1) { return prev + 1; }
          return 0;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => {
          if (prev > 0) { return prev - 1; }
          return selectableOptions.length - 1;
        });
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        setActiveIndex(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        setActiveIndex(selectableOptions.length - 1);
        return;
      }

      if (event.key === "Enter") {
        const index = activeIndex >= 0 ? activeIndex : 0;
        const option = selectableOptions[index];
        if (!option) { return; }
        event.preventDefault();
        toggleOption(
          option.id,
          fieldContextRef.current.fieldOnChange,
          fieldContextRef.current.currentSelected,
          isOptionDisabled(option),
        );
        if (!isSearchFocused) {
          triggerRef.current?.focus();
        }
      }
    };

    const handleScrollOrResize = () => {
      updatePlacement();
    };

    updatePlacement();

    const timeoutId = setTimeout(() => {
      updatePlacement();
    }, 0);

    const rafId = requestAnimationFrame(() => {
      updatePlacement();
      setTimeout(() => {
        updatePlacement();
      }, 50);
    });

    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    document.addEventListener("keydown", handleMenuKeyDown);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
      document.removeEventListener("keydown", handleMenuKeyDown);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, activeIndex, selectableOptions]);

  const renderMultiSelect = (
    fieldValue?: string[],
    fieldOnChange?: (val: string[]) => void,
    fieldError?: string,
  ) => {
    const currentSelected = fieldValue !== undefined ? fieldValue : selected;
    const mergedError = fieldError !== undefined ? fieldError : error;

    if (
      fieldContext.currentSelected !== currentSelected ||
      fieldContext.fieldOnChange !== fieldOnChange
    ) {
      setFieldContext({ currentSelected, fieldOnChange });
    }

    const activeOptionId =
      isOpen && activeIndex >= 0 && selectableOptions[activeIndex]
        ? `${listboxId}-option-${toOptionIdentityKey(selectableOptions[activeIndex].id)}`
        : undefined;
    const allowClear =
      resolvePickerClearable(clearable, { showClearButton, hideClearButton }) &&
      hasMultiSelectValues(currentSelected) &&
      !disabled;

    const handleTriggerKeyDown = (
      event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
      if (disabled) { return; }

      if (event.key === "Tab") {
        if (isOpen) { closeMenu(false); }
        return;
      }

      if (event.key === "Escape") {
        if (isOpen) {
          event.preventDefault();
          closeMenu(true);
        }
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (isOpen) {
          closeMenu(true);
        } else {
          openMenu();
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!isOpen) {
          openMenu();
          setActiveIndex(selectableOptions.length > 0 ? 0 : -1);
        } else {
          setActiveIndex((prev) => {
            if (selectableOptions.length === 0) { return -1; }
            if (prev < selectableOptions.length - 1) { return prev + 1; }
            return 0;
          });
        }
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!isOpen) {
          openMenu();
          setActiveIndex(
            selectableOptions.length > 0 ? selectableOptions.length - 1 : -1,
          );
        } else {
          setActiveIndex((prev) => {
            if (selectableOptions.length === 0) { return -1; }
            if (prev > 0) { return prev - 1; }
            return selectableOptions.length - 1;
          });
        }
      }
    };

    const getSelectableIndex = (optionId: string | number) =>
      selectableOptions.findIndex((option) =>
        areOptionIdsEqual(option.id, optionId),
      );

    const renderOptionButton = (
      option: NormalizedSelectOption,
      groupDisabled?: boolean,
    ) => {
      const optionDisabled = isOptionDisabled(option, groupDisabled);
      const optionId = option.id;
      const isSelected = currentSelected.some((selectedId) =>
        areOptionIdsEqual(selectedId, optionId),
      );
      const selectableIndex = getSelectableIndex(optionId);
      const isActive = !optionDisabled && selectableIndex === activeIndex;

      return (
        <button
          ref={(el) => {
            if (selectableIndex >= 0) {
              optionRefs.current[selectableIndex] = el;
            }
          }}
          type="button"
          tabIndex={-1}
          id={`${listboxId}-option-${toOptionIdentityKey(optionId)}`}
          disabled={optionDisabled}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 text-left",
            themeFormDropdownOptionClass,
            themeFormDropdownOptionHoverClass,
            isSelected && themeFormDropdownOptionSelectedClass,
            isActive &&
              "ring-1 ring-inset ring-primary-500/40 dark:ring-primary-400/50",
            optionDisabled && themeFormDropdownOptionDisabledClass,
          )}
          role="option"
          aria-selected={isSelected}
          aria-disabled={optionDisabled || undefined}
          onMouseEnter={() => {
            if (!optionDisabled && selectableIndex >= 0) {
              setActiveIndex(selectableIndex);
            }
          }}
          onClick={(event) => {
            event.stopPropagation();
            toggleOption(
              optionId,
              fieldOnChange,
              currentSelected,
              isOptionDisabled(option, groupDisabled),
            );
          }}
        >
          <span>{option.label}</span>
          {isSelected && (
            <AppIcon name="check" size="controlField" decorative />
          )}
        </button>
      );
    };

    const triggerErrorClasses = mergedError ? themeFieldBorderErrorClass : "";

    return (
      <div className="relative" ref={containerRef}>
        <FormFieldLabel
          id={labelId}
          label={label}
          htmlFor={fieldId}
          required={required}
          optional={optional}
          error={!!mergedError}
          infoTooltip={infoTooltip}
          hideLabel={hideLabel}
          className="mb-1 block"
        />
        <div
          ref={triggerRef}
          id={fieldId}
          role="combobox"
          tabIndex={disabled ? -1 : (tabIndex ?? 0)}
          aria-labelledby={labelId}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-disabled={disabled || undefined}
          aria-required={required || undefined}
          aria-invalid={!!mergedError || undefined}
          aria-activedescendant={activeOptionId}
          aria-describedby={
            mergedError ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            themeMultiSelectTriggerShellClass,
            themeMultiSelectFieldBaseClass,
            triggerErrorClasses,
            disabled && themeFieldDisabledClass,
            currentSelected.length <= 1 && "items-center",
            className,
          )}
          onClick={() => {
            if (disabled) { return; }
            setIsOpen((prev) => !prev);
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <div className={themeMultiSelectTriggerValueClass}>
            {currentSelected.length === 0 && (
              <span
                className={cn(
                  !mergedError && "text-slate-400 dark:text-slate-500",
                  mergedError && "text-danger-500",
                )}
              >
                {placeholder}
              </span>
            )}
            {currentSelected.map((selectedId) => {
              const chipLabel =
                flatOptions.find((opt) =>
                  areOptionIdsEqual(opt.id, selectedId),
                )?.label ?? String(selectedId);
              return (
                <span
                  key={toOptionIdentityKey(selectedId)}
                  className={themeMultiSelectChipClass}
                >
                  <span className="min-w-0 truncate" title={chipLabel}>
                    {chipLabel}
                  </span>
                  {!disabled && (
                    <button
                      type="button"
                      tabIndex={-1}
                      disabled={disabled}
                      className={cn(
                        themeControlClearButtonClass,
                        "cursor-pointer",
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (disabled) { return; }
                        toggleOption(selectedId, fieldOnChange, currentSelected);
                      }}
                      aria-label={`Remove ${chipLabel}`}
                    >
                      <AppIcon
                        name="clear"
                        size="controlClear"
                        className={themeControlClearIconClass}
                        decorative
                      />
                    </button>
                  )}
                </span>
              );
            })}
          </div>

          <div
            className={cn(
              themeMultiSelectTriggerActionsClass,
              currentSelected.length <= 1 && "self-center pt-0",
            )}
          >
            {allowClear && (
              <button
                type="button"
                tabIndex={-1}
                className={cn(themeControlClearButtonClass, "cursor-pointer")}
                aria-label="Clear selection"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear(fieldOnChange, currentSelected);
                }}
              >
                <AppIcon
                  name="clear"
                  size="controlClear"
                  className={themeControlClearIconClass}
                  decorative
                />
              </button>
            )}
            <AppIcon
              name="chevronDown"
              size="controlChevron"
              className={cn(
                themeControlChevronClass,
                disabled && themeFieldDisabledIconClass,
                isOpen && "rotate-180",
                mergedError && "text-danger-500",
              )}
              decorative
            />
          </div>
        </div>

        {isOpen &&
          !disabled &&
          typeof document !== "undefined" &&
          document.body &&
          createPortal(
            <div
              ref={menuRef}
              id={listboxId}
                className={cn(
                  "fixed overflow-auto animate-popup",
                  resolveFormControlPortalLayerClass(),
                  themeFormControlMenuClass,
                  menuStyle.placement === "top" && "animate-popup-top",
                )}
                style={{
                  top: `${menuStyle.top}px`,
                  left: `${menuStyle.left}px`,
                  width: menuStyle.width > 0 ? `${menuStyle.width}px` : "auto",
                  minWidth: "256px",
                  maxHeight: `${menuStyle.maxHeight}px`,
                }}
              role="listbox"
              aria-multiselectable="true"
              aria-labelledby={labelId}
              onMouseDown={(e) => { e.stopPropagation(); }}
            >
              {searchable && (
                <div className={themeFormControlMenuSearchShellClass}>
                  <div className={themeFormControlMenuSearchInputClass}>
                    <AppIcon
                      name="search"
                      size="controlField"
                      className={themeControlIconClass}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      tabIndex={-1}
                      className={cn(
                        "w-full bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-faint)]",
                        themeFormControlTextClass,
                      )}
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); }}
                      onClick={(e) => { e.stopPropagation(); }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.preventDefault();
                          closeMenu(true);
                        }
                        if (e.key === "Tab") {
                          closeMenu(false);
                        }
                      }}
                      aria-label={`Search ${label}`}
                    />
                  </div>
                </div>
              )}
              <div className="p-1">
                {groupedMode
                  ? (filteredOptions as NormalizedOptionGroup[]).map(
                      (group, groupIndex) => {
                        const groupHeadingId = createGroupHeadingId(
                          listboxId,
                          group.label,
                          groupIndex,
                        );
                        return (
                          <div
                            key={`${group.label}-${groupIndex}`}
                            role="group"
                            aria-labelledby={groupHeadingId}
                          >
                            <FormDropdownGroupHeading
                              id={groupHeadingId}
                              label={group.label}
                              showDivider={groupIndex > 0}
                            />
                            <div className={themeFormDropdownGroupOptionsClass}>
                              {group.options.map((option) => (
                                <React.Fragment
                                  key={createGroupedOptionRenderKey(
                                    groupIndex,
                                    option.id,
                                  )}
                                >
                                  {renderOptionButton(option, group.disabled)}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        );
                      },
                    )
                  : (filteredOptions as NormalizedSelectOption[]).map(
                      (option) => (
                        <React.Fragment key={toOptionIdentityKey(option.id)}>
                          {renderOptionButton(option)}
                        </React.Fragment>
                      ),
                    )}
                {selectableOptions.length === 0 && (
                  <div
                    className={cn(
                      "px-2 py-2 text-center text-slate-500 dark:text-slate-400",
                      themeFormControlTextClass,
                    )}
                  >
                    No results found
                  </div>
                )}
              </div>
            </div>,
            document.body,
          )}

        {helperText && !mergedError && (
          <p
            id={helperId}
            className="mt-1 text-xs text-secondary-500 dark:text-secondary-400"
          >
            {helperText}
          </p>
        )}
        {mergedError && (
          <p
            id={errorId}
            className="mt-1 text-xs text-danger-500"
            role="alert"
            aria-live="polite"
          >
            {mergedError}
          </p>
        )}
      </div>
    );
  };

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) =>
          renderMultiSelect(
            field.value as string[],
            field.onChange,
            fieldState.error?.message,
          )
        }
      />
    );
  }

  return renderMultiSelect(undefined, undefined, undefined);
};

export const MultiSelect = React.memo(
  MultiSelectInner,
) as typeof MultiSelectInner;
