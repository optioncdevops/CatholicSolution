import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";
import { cn } from "@app/utilities/cn";
import { computeFixedPortalPlacement } from "@designSystem/layouts/utilities/fixedPortalPlacement";
import {
  themeFieldBaseClass,
  themeFieldShellClass,
  themeFieldBorderErrorClass,
  themeFieldDisabledClass,
  themeFieldDisabledIconClass,
  themeFieldWrapperClass,
  themeFormControlMenuClass,
  themeFormControlMenuSearchInputClass,
  themeFormControlMenuSearchShellClass,
  themeFormDropdownOptionHoverClass,
  themeFormDropdownOptionSelectedClass,
  themeSelectTriggerActionsClass,
  themeSelectTriggerShellClass,
  themeSelectTriggerValueClass,
  themeControlChevronClass,
  themeControlIconClass,
  themeControlClearIconClass,
  themeControlClearButtonClass,
  resolveFormControlPortalLayerClass,
  themeFormControlTextClass,
  themeFormDropdownOptionClass,
  themeFormDropdownOptionDisabledClass,
  themeFormDropdownGroupOptionsClass,
} from "@designSystem/theme/styles/componentStyle";
import { FormFieldLabel } from "./FormFieldLabel";
import { FormFieldFeedback } from "./FormFieldFeedback";
import type {
  FormFieldInfoTooltipProp,
  SelectClearableProp,
} from "./formControlFieldProps";
import {
  DEFAULT_SELECT_CLEARABLE,
  hasDropdownValue,
  resolvePickerClearable,
} from "./formControlDefaults";
import { AppIcon } from "@app/components/icons";
import { FormDropdownGroupHeading } from "./FormDropdownGroupHeading";
import {
  areOptionIdsEqual,
  createGroupHeadingId,
  createGroupedOptionRenderKey,
  filterFlatOptions,
  filterGroupedOptions,
  findNormalizedOptionLabel,
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

export type DropdownOption = SelectOption;

export type DropdownOptionGroup = SelectOptionGroup;

export type DropdownOptions = SelectOption[] | SelectOptionGroup[];

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';

const getDocumentFocusableElements = (): HTMLElement[] => {
  if (typeof document === "undefined") {
    return [];
  }

  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );

  return elements
    .filter((el) => {
      const style = window.getComputedStyle(el);
      const isHidden =
        el.getAttribute("aria-hidden") === "true" ||
        style.display === "none" ||
        style.visibility === "hidden" ||
        el.offsetParent === null;
      const isHiddenInput =
        el.tagName === "INPUT" &&
        (el as HTMLInputElement).type === "hidden";

      return !isHidden && !isHiddenInput && el.tabIndex >= 0;
    })
    .sort((a, b) => {
      const tabIndexA = a.tabIndex > 0 ? a.tabIndex : Number.POSITIVE_INFINITY;
      const tabIndexB = b.tabIndex > 0 ? b.tabIndex : Number.POSITIVE_INFINITY;
      if (tabIndexA !== tabIndexB) {
        return tabIndexA - tabIndexB;
      }
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1;
    });
};

const moveFocusFromTrigger = (
  trigger: HTMLElement,
  shiftKey: boolean,
) => {
  const focusable = getDocumentFocusableElements();
  const currentIndex = focusable.indexOf(trigger);
  if (currentIndex === -1) {
    return;
  }

  const nextIndex = shiftKey ? currentIndex - 1 : currentIndex + 1;
  focusable[nextIndex]?.focus();
};

interface BaseDropdownProps
  extends FormFieldInfoTooltipProp, SelectClearableProp {
  /** Stable id for the dropdown trigger (e.g. `ddlOrganizationStatus`). Falls back to `name`, then a generated id — pass it explicitly per the Stable Control IDs standard. */
  id?: string;
  label: string;
  options: DropdownOptions;
  /** When true, `options` is interpreted as grouped sections. */
  isGrouped?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  /** Show required asterisk in label (validation still handled by rules) */
  required?: boolean;
  /** Show “(optional)” suffix when the field is not required */
  optional?: boolean;
  className?: string;
  /**
   * Extra classes for the field's outer wrapper (the label + control column) — this is what
   * actually needs a grid-column-span class like `md:col-span-4` to size the field within a
   * form grid. `className` only reaches the inner trigger button, not this wrapper, so it can't
   * be used for that (matches InputField's `wrapperClassName` convention).
   */
  wrapperClassName?: string;
  /** Controlled value (when not using react-hook-form) */
  value?: string | number;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Change handler for uncontrolled/controlled usage outside of react-hook-form */
  onValueChange?: (value: string | undefined) => void;
  /** Visually hide the label (keeps it accessible via sr-only). Useful inside table cells. */
  hideLabel?: boolean;
  /** Optional action on the right of the label row (e.g. view-files icon). */
  labelAction?: React.ReactNode;
  /**
   * Extra control inline after the label / info icon (e.g. map view icon).
   */
  labelAddon?: React.ReactNode;
  tabIndex?: number;
  /**
   * When true (default), auto-selects the only remaining option.
   * Disable in multi-row tables where a new blank row should stay empty.
   */
  autoSelectSingleOption?: boolean;
  autoFocus?: boolean;
}

export interface DropdownProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseDropdownProps {
  /** react-hook-form control object for controlled forms */
  control?: Control<TFieldValues>;
  /** Field name for react-hook-form (required when control is provided) */
  name?: string;
  /** Validation rules for react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

const DropdownInner = <TFieldValues extends FieldValues = FieldValues>({
  id,
  label,
  options,
  isGrouped = false,
  placeholder = "Select an option",
  helperText,
  error,
  disabled,
  searchable = true,
  clearable = DEFAULT_SELECT_CLEARABLE,
  showClearButton,
  hideClearButton,
  required,
  optional,
  className,
  wrapperClassName,
  value,
  defaultValue,
  onValueChange,
  hideLabel = false,
  labelAction,
  labelAddon,
  infoTooltip,
  control,
  name,
  autoSelectSingleOption = true,
  rules,
  tabIndex,
  autoFocus,
}: DropdownProps<TFieldValues>) => {
  const generatedId = useId();
  const fieldId = id ?? name ?? `dropdown-${generatedId}`;
  const labelId = `${fieldId}-label`;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fieldContextRef = useRef<{
    currentValue?: string | number;
    fieldOnChange?: (value: string) => void;
  }>({});
  // `fieldContext` is the render-safe source of truth for the latest current value / RHF
  // onChange; it is updated during render (guarded by a sentinel comparison, per this
  // codebase's convention) rather than via a direct `fieldContextRef.current = ...` write in
  // the render body, which react-hooks/refs disallows. The effect below flushes it into
  // `fieldContextRef` so the async readers (the document keydown listener and the
  // auto-select timeout, both of which need the freshest value without re-subscribing on
  // every change) keep working exactly as before.
  const [fieldContext, setFieldContext] = useState<{
    currentValue?: string | number;
    fieldOnChange?: (value: string) => void;
  }>({});
  const listboxId = `${fieldId}-listbox`;
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
    placement: "top" | "bottom";
    maxHeight: number;
  }>({ top: 0, left: 0, width: 0, placement: "bottom", maxHeight: 240 });

  const selectedValue = value ?? internalValue;

  const groupedMode = isGroupedOptionsArray(options ?? [], isGrouped);

  const normalizedOptions = useMemo<
    NormalizedSelectOption[] | NormalizedOptionGroup[]
  >(() => normalizeSelectOptions(options ?? [], groupedMode), [groupedMode, options]);

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
        group.options
          .filter((option) => !isOptionDisabled(option, group.disabled))
          .map((option) => ({ ...option, groupDisabled: group.disabled })),
      );
    }

    return (filteredOptions as NormalizedSelectOption[]).filter(
      (option) => !option.disabled,
    );
  }, [filteredOptions, groupedMode]);

  const findLabel = (val?: string | number) =>
    findNormalizedOptionLabel(normalizedOptions, groupedMode, val);

  const autoSelectedOptionsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!autoSelectSingleOption) {
      autoSelectedOptionsRef.current = null;
      return;
    }
    if (!disabled && selectableOptions.length === 1) {
      const singleId = String(selectableOptions[0].id);
      
      if (autoSelectedOptionsRef.current === singleId) {
        return;
      }

      const current = fieldContextRef.current.currentValue ?? selectedValue;
      if (!hasDropdownValue(current)) {
        setTimeout(() => {
          if (!hasDropdownValue(fieldContextRef.current.currentValue ?? selectedValue)) {
            const fieldOnChange = fieldContextRef.current.fieldOnChange;
            fieldOnChange?.(singleId);
            onValueChange?.(singleId);
            if (value === undefined) {
              setInternalValue(singleId);
            }
            autoSelectedOptionsRef.current = singleId;
          }
        }, 0);
      }
    } else {
      autoSelectedOptionsRef.current = null;
    }
  }, [selectableOptions, disabled, selectedValue, onValueChange, value, autoSelectSingleOption]);

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    setSearch("");
    setActiveIndex(-1);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const openMenu = (preferredIndex?: number) => {
    if (disabled) {
      return;
    }
    setIsOpen(true);
    const current = fieldContextRef.current.currentValue;
    const selectedIdx = selectableOptions.findIndex((opt) =>
      areOptionIdsEqual(opt.id, current),
    );
    const nextIndex =
      preferredIndex !== undefined
        ? preferredIndex
        : selectedIdx >= 0
          ? selectedIdx
          : selectableOptions.length > 0
            ? 0
            : -1;
    setActiveIndex(nextIndex);
  };

  const handleSelect = useCallback(
    (val: string) => {
      if (disabled) {
        return;
      }
      setIsOpen(false);
      setSearch("");
      setActiveIndex(-1);
      if (value === undefined) {
        setInternalValue(val);
      }
      onValueChange?.(val);
    },
    [disabled, value, onValueChange],
  );

  const commitOption = useCallback(
    (optionId: string | number, fieldOnChange?: (value: string) => void) => {
      const serializedId = serializeOptionIdForForm(optionId);
      fieldOnChange?.(serializedId);
      handleSelect(serializedId);
      triggerRef.current?.focus();
    },
    [handleSelect],
  );

  const handleClearSelection = (fieldOnChange?: (value: string) => void) => {
    if (disabled) {
      return;
    }
    closeMenu(false);
    if (value === undefined) {
      setInternalValue(undefined);
    }
    fieldOnChange?.("");
    onValueChange?.(undefined);
  };

  const updatePlacement = () => {
    if (
      !triggerRef.current ||
      typeof window === "undefined" ||
      !document.body
    ) {
      return;
    }

    try {
      setMenuStyle(
        computeFixedPortalPlacement(triggerRef.current, menuRef.current, {
          estimatedMenuHeight: 260,
        }),
      );
    } catch (error) {
      console.warn("Dropdown: Error calculating position", error);
    }
  };

  // Clamp `activeIndex` back into range whenever the menu opens or the selectable options
  // change while open. Adjusted during render (guarded by an isOpen/selectableOptions
  // sentinel) instead of inside an effect, so a stale index is never painted for one frame.
  const [renderedForActiveClamp, setRenderedForActiveClamp] = useState({
    isOpen,
    selectableOptions,
  });
  if (
    renderedForActiveClamp.isOpen !== isOpen ||
    renderedForActiveClamp.selectableOptions !== selectableOptions
  ) {
    setRenderedForActiveClamp({ isOpen, selectableOptions });
    if (isOpen) {
      setActiveIndex((prev) => {
        if (selectableOptions.length === 0) {
          return -1;
        }
        if (prev < 0) {
          return 0;
        }
        return Math.min(prev, selectableOptions.length - 1);
      });
    }
  }

  useEffect(() => {
    fieldContextRef.current = fieldContext;
  }, [fieldContext]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) {
      return;
    }
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !document.body) {
      return;
    }

    if (searchable) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      try {
        const target = event.target as Node | null;
        if (!target) {
          return;
        }

        const trigger = triggerRef.current;
        const menu = menuRef.current;

        if (!trigger || !menu) {
          closeMenu(false);
          return;
        }

        const insideTrigger = trigger.contains(target);
        const insideMenu = menu.contains(target);

        if (!insideTrigger && !insideMenu) {
          closeMenu(false);
        }
      } catch (error) {
        console.warn("Dropdown: Error handling click outside", error);
      }
    };

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key === "Tab") {
        const active = document.activeElement;
        const focusInMenu =
          !!menuRef.current?.contains(active) ||
          active === searchInputRef.current;

        closeMenu(false);

        if (focusInMenu && triggerRef.current) {
          event.preventDefault();
          triggerRef.current.focus({ preventScroll: true });
          moveFocusFromTrigger(triggerRef.current, event.shiftKey);
        }
        return;
      }

      if (selectableOptions.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => {
          if (prev < selectableOptions.length - 1) {
            return prev + 1;
          }
          return 0;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => {
          if (prev > 0) {
            return prev - 1;
          }
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
        if (!option) {
          return;
        }
        event.preventDefault();
        commitOption(option.id, fieldContextRef.current.fieldOnChange);
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
  }, [isOpen, activeIndex, selectableOptions, searchable, commitOption]);

  const renderDropdown = (
    fieldValue?: string,
    fieldOnChange?: (value: string) => void,
    fieldError?: string,
  ) => {
    const currentValue = fieldValue !== undefined ? fieldValue : selectedValue;
    const mergedError = fieldError !== undefined ? fieldError : error;
    const selectedLabel = findLabel(currentValue);
    const allowClear =
      resolvePickerClearable(clearable, { showClearButton, hideClearButton }) &&
      hasDropdownValue(currentValue) &&
      !disabled;

    if (
      fieldContext.currentValue !== currentValue ||
      fieldContext.fieldOnChange !== fieldOnChange
    ) {
      setFieldContext({ currentValue, fieldOnChange });
    }

    const activeOptionId =
      isOpen && activeIndex >= 0 && selectableOptions[activeIndex]
        ? `${listboxId}-option-${toOptionIdentityKey(selectableOptions[activeIndex].id)}`
        : undefined;

    const getSelectableIndex = (optionId: string | number) =>
      selectableOptions.findIndex((option) =>
        areOptionIdsEqual(option.id, optionId),
      );

    const triggerErrorClasses = mergedError ? themeFieldBorderErrorClass : "";

    const handleTriggerKeyDown = (
      event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
      if (disabled) {
        return;
      }

      if (event.key === "Tab") {
        if (isOpen) {
          // False positive: this call sits inside a keydown event handler (not the render
          // path), where reading refs is safe and standard. The linter's static analysis
          // treats `renderDropdown`'s direct invocation below (`return renderDropdown(...)`)
          // as if every handler defined inside it runs during render, since it can't see that
          // this closure only actually executes later, on a real keydown event.
          // eslint-disable-next-line react-hooks/refs
          closeMenu(false);
        }
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
          const index = activeIndex >= 0 ? activeIndex : 0;
          const option = selectableOptions[index];
          if (option) {
            // False positive; same renderDropdown-closure cause as the Tab handler above.
            // eslint-disable-next-line react-hooks/refs
            commitOption(option.id, fieldOnChange);
          } else {
            closeMenu(true);
          }
        } else {
          // False positive; same renderDropdown-closure cause as the Tab handler above.
          // eslint-disable-next-line react-hooks/refs
          openMenu();
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!isOpen) {
          openMenu(0);
        } else {
          setActiveIndex((prev) => {
            if (selectableOptions.length === 0) {
              return -1;
            }
            if (prev < selectableOptions.length - 1) {
              return prev + 1;
            }
            return 0;
          });
        }
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!isOpen) {
          openMenu(
            selectableOptions.length > 0 ? selectableOptions.length - 1 : -1,
          );
        } else {
          setActiveIndex((prev) => {
            if (selectableOptions.length === 0) {
              return -1;
            }
            if (prev > 0) {
              return prev - 1;
            }
            return selectableOptions.length - 1;
          });
        }
      }
    };

    const renderOptionButton = (
      option: NormalizedSelectOption,
      groupDisabled?: boolean,
    ) => {
      const optionDisabled = isOptionDisabled(option, groupDisabled);
      const selectableIndex = getSelectableIndex(option.id);
      const isSelected = areOptionIdsEqual(option.id, currentValue);
      const isActive = !optionDisabled && selectableIndex === activeIndex;

      return (
        <button
          ref={(el) => {
            if (selectableIndex >= 0) {
              optionRefs.current[selectableIndex] = el;
            }
          }}
          id={`${listboxId}-option-${toOptionIdentityKey(option.id)}`}
          type="button"
          tabIndex={-1}
          disabled={optionDisabled}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 text-left",
            themeFormDropdownOptionClass,
            themeFormDropdownOptionHoverClass,
            isSelected && themeFormDropdownOptionSelectedClass,
            isActive && !isSelected && "bg-primary-50 dark:bg-primary-900/40",
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
            if (optionDisabled) {
              return;
            }
            commitOption(option.id, fieldOnChange);
          }}
        >
          <span>{option.label}</span>
          {isSelected && (
            <AppIcon name="check" size="controlField" decorative />
          )}
        </button>
      );
    };

    return (
      <div
        className={cn(themeFieldWrapperClass, wrapperClassName, hideLabel && "gap-0!")}
        ref={containerRef}
      >
        <FormFieldLabel
          id={labelId}
          label={label}
          required={required}
          optional={optional}
          error={!!mergedError}
          infoTooltip={infoTooltip}
          labelAddon={labelAddon}
          hideLabel={hideLabel}
          labelAction={labelAction}
        />

        <div className="relative">
          <div
            ref={triggerRef}
            role="combobox"
            tabIndex={disabled ? -1 : (tabIndex ?? 0)}
            aria-labelledby={labelId}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={activeOptionId}
            aria-required={required || undefined}
            aria-invalid={!!mergedError || undefined}
            aria-disabled={disabled || undefined}
            aria-describedby={
              mergedError ? errorId : helperText ? helperId : undefined
            }
            id={fieldId}
            className={cn(
              themeSelectTriggerShellClass,
              disabled ? undefined : themeFieldBaseClass,
              disabled && themeFieldShellClass,
              triggerErrorClasses,
              disabled && themeFieldDisabledClass,
              !disabled && className,
            )}
            onClick={() => {
              if (disabled) {
                return;
              }
              if (isOpen) {
                closeMenu(false);
              } else {
                openMenu();
              }
            }}
            onKeyDown={handleTriggerKeyDown}
          >
            <span
              className={cn(
                themeSelectTriggerValueClass,
                "truncate",
                !selectedLabel &&
                  !mergedError &&
                  "text-slate-400 dark:text-slate-500",
                !selectedLabel && mergedError && "text-danger-500",
              )}
            >
              {selectedLabel || placeholder}
            </span>
            <div className={themeSelectTriggerActionsClass}>
              {allowClear && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Clear selection"
                  className={cn(themeControlClearButtonClass, "cursor-pointer")}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    // False positive; same renderDropdown-closure cause as handleTriggerKeyDown
                    // above (this onClick only runs later, on a real click, never during render).
                    // eslint-disable-next-line react-hooks/refs
                    handleClearSelection(fieldOnChange);
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
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
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
                          "w-full bg-transparent outline-none",
                          themeFormControlTextClass,
                          "text-[var(--text-primary)] placeholder:text-[var(--text-faint)]",
                        )}
                        placeholder="Search..."
                        maxLength={100}
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
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
                          <React.Fragment
                            key={toOptionIdentityKey(option.id)}
                          >
                            {renderOptionButton(option)}
                          </React.Fragment>
                        ),
                      )}
                  {selectableOptions.length === 0 && (
                    <div
                      className={cn(
                        "px-2 py-2 text-center text-foreground-muted",
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
        </div>

        <FormFieldFeedback
          helperText={helperText}
          error={mergedError}
          helperId={helperId}
          errorId={errorId}
        />
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
          renderDropdown(
            field.value as string,
            field.onChange,
            fieldState.error?.message,
          )
        }
      />
    );
  }

  return renderDropdown(undefined, undefined, undefined);
};

export const Dropdown = React.memo(DropdownInner) as typeof DropdownInner;
