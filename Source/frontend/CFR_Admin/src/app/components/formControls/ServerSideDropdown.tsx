import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, RegisterOptions } from "react-hook-form";

import { cn } from "@app/utilities/cn";
import {
  themeFieldWrapperClass,
  themeFieldBaseClass,
  themeFieldShellClass,
  themeFieldBorderErrorClass,
  themeControlChevronClass,
  themeControlClearButtonClass,
  themeControlClearIconClass,
  themeFieldDisabledClass,
  themeFieldDisabledIconClass,
  themeFormControlMenuClass,
  themeFormControlMenuSearchInputClass,
  themeFormControlMenuSearchShellClass,
  resolveFormControlPortalLayerClass,
  themeFormControlTextClass,
  themeFormDropdownOptionClass,
  themeFormDropdownOptionDisabledClass,
  themeFormDropdownOptionHoverClass,
  themeFormDropdownOptionSelectedClass,
  themeFormDropdownGroupOptionsClass,
  themeSelectTriggerActionsClass,
  themeSelectTriggerShellClass,
  themeSelectTriggerValueClass,
  themeControlIconClass,
} from "@designSystem/theme/styles/componentStyle";
import { FormFieldLabel } from "./FormFieldLabel";
import type {
  FormFieldInfoTooltipProp,
  SelectClearableProp,
} from "./formControlFieldProps";
import {
  DEFAULT_SELECT_CLEARABLE,
  hasDropdownValue,
  resolvePickerClearable,
} from "./formControlDefaults";
import { computeFixedPortalPlacement } from "@designSystem/layouts/utilities/fixedPortalPlacement";
import { AppIcon } from "@app/components/icons";
import { FormDropdownGroupHeading } from "./FormDropdownGroupHeading";
import {
  areOptionIdsEqual,
  countNormalizedOptions,
  createGroupHeadingId,
  createGroupedOptionRenderKey,
  flattenNormalizedOptions,
  isGroupedOptionsArray,
  isOptionDisabled,
  mergeNormalizedGroups,
  normalizeSelectOptions,
  serializeOptionIdForForm,
  toOptionIdentityKey,
  trimCachedGroups,
  trimCachedOptions,
  type NormalizedOptionGroup,
  type NormalizedSelectOption,
  type SelectOption,
  type SelectOptionGroup,
} from "./dropdownGroupedOptions";

export type ServerDropdownOption = SelectOption;

export type ServerDropdownOptionGroup = SelectOptionGroup;

export type ServerDropdownOptions = SelectOption[] | SelectOptionGroup[];

export interface ServerDropdownFetchParams {
  page: number;
  pageSize: number;
  search: string;
  signal?: AbortSignal;
}

export interface ServerDropdownFetchResult {
  items: ServerDropdownOptions;
  /** Whether more pages are available */
  hasMore?: boolean;
  /** Optional explicit next page number */
  nextPage?: number;
  /** Total items available (if your API returns it) */
  total?: number;
}

export type ServerDropdownFetchFn = (
  params: ServerDropdownFetchParams,
) => Promise<ServerDropdownFetchResult>;

type FetchMode = "replace" | "next";

type OptionsState =
  | { mode: "flat"; options: NormalizedSelectOption[] }
  | { mode: "grouped"; groups: NormalizedOptionGroup[] };

interface BaseServerSideDropdownProps
  extends FormFieldInfoTooltipProp, SelectClearableProp {
  label: string;
  fetchOptions: ServerDropdownFetchFn;
  /** When true, server `items` are interpreted as grouped sections. */
  isGrouped?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  /** Show “(optional)” suffix when the field is not required */
  optional?: boolean;
  className?: string;
  /** Controlled value (when not using react-hook-form) */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Change handler for uncontrolled/controlled usage outside of react-hook-form */
  onValueChange?: (value: string | undefined) => void;
  /** Initial options to render before the first fetch (e.g., pre-populated values) */
  initialOptions?: ServerDropdownOptions;
  /** Page size sent to your API */
  pageSize?: number;
  /** Debounce delay for the search box */
  debounceMs?: number;
  /** Load the first page as soon as the component mounts */
  autoLoadOnMount?: boolean;
  /** Fetch the first page immediately when the trigger is focused/opened even with empty search */
  searchOnFocus?: boolean;
  /** Placeholder for the search box */
  searchPlaceholder?: string;
  /** Callback when fetching fails */
  onFetchError?: (error: Error) => void;
  /** Cap how many options are cached in memory to avoid storing too much data */
  maxCachedItems?: number;
  /** Minimum characters required before performing a server search */
  minSearchChars?: number;
  /** Custom text shown when loading */
  loadingText?: string;
  /** Custom text shown when there are no results */
  noResultsText?: string;
  /** Custom hint shown when the search term is too short */
  typeToSearchText?: string;
  /** Visually hide the label (keeps it accessible via sr-only). Useful inside table cells. */
  hideLabel?: boolean;
}

export interface ServerSideDropdownProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseServerSideDropdownProps {
  /** react-hook-form control object for controlled forms */
  control?: Control<TFieldValues>;
  /** Field name for react-hook-form (required when control is provided) */
  name?: string;
  /** Validation rules for react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form's RegisterOptions field-name generic cannot be resolved for a form-agnostic wrapper component; this mirrors RHF's own generic-component pattern.
  rules?: RegisterOptions<TFieldValues, any>;
}

const createInitialOptionsState = (
  initialOptions: ServerDropdownOptions,
  isGrouped: boolean,
): OptionsState => {
  const normalized = normalizeGroupedItems(initialOptions, isGrouped);
  if (isGroupedOptionsArray(normalized, isGrouped)) {
    return { mode: "grouped", groups: normalized as NormalizedOptionGroup[] };
  }

  return { mode: "flat", options: normalized as NormalizedSelectOption[] };
};

const mergeOptionsState = (
  previous: OptionsState,
  incoming: NormalizedSelectOption[] | NormalizedOptionGroup[],
  mode: FetchMode,
  isGrouped: boolean,
  maxCachedItems?: number,
  selectedId?: string | number,
): OptionsState => {
  if (isGrouped) {
    const incomingGroups = incoming as NormalizedOptionGroup[];
    const baseGroups = mode === "replace" ? [] : previous.mode === "grouped" ? previous.groups : [];
    let mergedGroups = mergeNormalizedGroups(baseGroups, incomingGroups, mode === "replace" ? "replace" : "append");

    if (typeof maxCachedItems === "number" && maxCachedItems > 0) {
      mergedGroups = trimCachedGroups(mergedGroups, maxCachedItems, selectedId);
    }

    return { mode: "grouped", groups: mergedGroups };
  }

  const incomingFlat = incoming as NormalizedSelectOption[];
  const baseFlat = mode === "replace" ? [] : previous.mode === "flat" ? previous.options : [];
  const merged = [...baseFlat, ...incomingFlat];
  const dedupedMap = new Map<string, NormalizedSelectOption>();
  merged.forEach((option) =>
    dedupedMap.set(toOptionIdentityKey(option.id), option),
  );
  let deduped = Array.from(dedupedMap.values());

  if (typeof maxCachedItems === "number" && maxCachedItems > 0) {
    deduped = trimCachedOptions(deduped, maxCachedItems, selectedId);
  }

  return { mode: "flat", options: deduped };
};

const getFlatOptionsFromState = (state: OptionsState): NormalizedSelectOption[] => {
  if (state.mode === "flat") {
    return state.options;
  }

  return flattenNormalizedOptions(state.groups, true);
};

const getOptionsCount = (state: OptionsState): number => {
  if (state.mode === "flat") {
    return state.options.length;
  }

  return countNormalizedOptions(state.groups, true);
};

const normalizeGroupedItems = (
  items: ServerDropdownOptions,
  isGrouped: boolean,
): NormalizedSelectOption[] | NormalizedOptionGroup[] =>
  normalizeSelectOptions(items, isGrouped);

const ServerSideDropdownInner = <
  TFieldValues extends FieldValues = FieldValues,
>({
  label,
  fetchOptions,
  isGrouped = false,
  placeholder = "Select an option",
  helperText,
  error,
  disabled,
  clearable = DEFAULT_SELECT_CLEARABLE,
  showClearButton,
  hideClearButton,
  required,
  optional,
  className,
  value,
  defaultValue,
  onValueChange,
  control,
  name,
  rules,
  initialOptions = [],
  pageSize = 20,
  debounceMs = 300,
  autoLoadOnMount = false,
  searchOnFocus = false,
  searchPlaceholder = "Search...",
  onFetchError,
  maxCachedItems,
  minSearchChars = 0,
  loadingText = "Loading options...",
  noResultsText = "No results found",
  typeToSearchText,
  hideLabel = false,
  infoTooltip,
}: ServerSideDropdownProps<TFieldValues>) => {
  const generatedId = useId();
  const fieldId = name ?? `server-dropdown-${generatedId}`;
  const labelId = `${fieldId}-label`;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );
  const [optionsState, setOptionsState] = useState<OptionsState>(() =>
    createInitialOptionsState(initialOptions, isGrouped),
  );
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(
    initialOptions.length === 0,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string>();
  const [totalAvailable, setTotalAvailable] = useState<number | undefined>(
    undefined,
  );

  const containerRef = useRef<HTMLDivElement>(null!);
  const listRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
    placement: "top" | "bottom";
    maxHeight: number;
  }>({ top: 0, left: 0, width: 0, placement: "bottom", maxHeight: 240 });

  const selectedValue = value ?? internalValue;
  const selectedRef = useRef<string | number | undefined>(selectedValue);
  const meetsSearchThreshold = debouncedSearch.length >= minSearchChars;

  const fieldContextRef = useRef<{
    currentValue?: string | number;
    fieldOnChange?: (value: string) => void;
  }>({});

  useEffect(() => {
    const flatOptions = getFlatOptionsFromState(optionsState);
    if (!disabled && flatOptions.length === 1 && !isLoadingInitial && !isLoadingMore) {
      const singleId = flatOptions[0].id;
      const current = fieldContextRef.current.currentValue ?? selectedValue;
      if (!hasDropdownValue(current)) {
        setTimeout(() => {
          if (!hasDropdownValue(fieldContextRef.current.currentValue ?? selectedValue)) {
            const fieldOnChange = fieldContextRef.current.fieldOnChange;
            const idAsString = singleId.toString();
            fieldOnChange?.(idAsString);
            onValueChange?.(idAsString);
            if (value === undefined) {
              setInternalValue(idAsString);
            }
          }
        }, 0);
      }
    }
  }, [optionsState, disabled, selectedValue, isLoadingInitial, isLoadingMore, onValueChange, value]);

  useEffect(() => {
    selectedRef.current =
      selectedValue !== undefined &&
      selectedValue !== null &&
      selectedValue !== ""
        ? selectedValue
        : undefined;
  }, [selectedValue]);

  // Merge freshly-provided `initialOptions` into the cached options state during render
  // (guarded by an initialOptions/isGrouped sentinel) rather than inside an effect, so the
  // merged list is never painted for one frame after the previous one.
  const [renderedForInitialOptions, setRenderedForInitialOptions] = useState({
    initialOptions,
    isGrouped,
  });
  if (
    initialOptions.length > 0 &&
    (renderedForInitialOptions.initialOptions !== initialOptions ||
      renderedForInitialOptions.isGrouped !== isGrouped)
  ) {
    setRenderedForInitialOptions({ initialOptions, isGrouped });
    const normalizedInitialOptions = normalizeGroupedItems(
      initialOptions,
      isGrouped,
    );
    setOptionsState((prev) =>
      mergeOptionsState(prev, normalizedInitialOptions, "next", isGrouped),
    );
  }

  // Update click outside to work with portal
  useEffect(() => {
    if (!isOpen) {return;}

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      try {
        const target = event.target as Node | null;
        if (!target) {return;}

        const trigger = triggerRef.current;
        const menu = menuRef.current;
        const container = containerRef.current;

        if (!container) {
          setIsOpen(false);
          return;
        }

        const insideContainer = container.contains(target);
        const insideTrigger = trigger?.contains(target);
        const insideMenu = menu?.contains(target);

        if (!insideContainer && !insideTrigger && !insideMenu) {
          setIsOpen(false);
        }
      } catch (error) {
        console.warn("ServerSideDropdown: Error handling click outside", error);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {setIsOpen(false);}
    };
    document.addEventListener("keydown", handleEsc);
    return () => { document.removeEventListener("keydown", handleEsc); };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, debounceMs);
    return () => { window.clearTimeout(timer); };
  }, [search, debounceMs]);

  useEffect(() => {
    return () => {
      activeRequest.current?.abort();
    };
  }, []);

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: FetchMode) => {
      if (disabled) {return;}

      const isReplace = mode === "replace";

      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;

      if (isReplace) {
        setIsLoadingInitial(true);
        setIsLoadingMore(false);
      } else {
        setIsLoadingMore(true);
      }
      setFetchError(undefined);

      try {
        const result = await fetchOptions({
          page: pageToLoad,
          pageSize,
          search: debouncedSearch,
          signal: controller.signal,
        });

        const normalized = normalizeGroupedItems(result.items ?? [], isGrouped);
        const normalizedCount = isGrouped
          ? (normalized as NormalizedOptionGroup[]).reduce(
              (total, group) => total + group.options.length,
              0,
            )
          : (normalized as NormalizedSelectOption[]).length;

        setOptionsState((prev) => {
          const mergedState = mergeOptionsState(
            prev,
            normalized,
            isReplace ? "replace" : "next",
            isGrouped,
            maxCachedItems,
            selectedRef.current,
          );

          if (isReplace && listRef.current) {
            listRef.current.scrollTo({ top: 0 });
          }

          return mergedState;
        });

        if (typeof result.total === "number") {
          setTotalAvailable(result.total);
        } else if (isReplace) {
          setTotalAvailable(undefined);
        }

        const computedHasMore =
          result.hasMore ??
          (typeof result.total === "number"
            ? pageToLoad * pageSize < result.total
            : normalizedCount >= pageSize);
        setHasMore(computedHasMore);

        const computedNextPage = result.nextPage ?? pageToLoad + 1;
        setNextPage(computedNextPage);
      } catch (err) {
        if ((err as Error).name === "AbortError") {return;}
        const message =
          err instanceof Error ? err.message : "Failed to load options";
        setFetchError(message);
        onFetchError?.(err as Error);
      } finally {
        setIsLoadingInitial(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearch, disabled, fetchOptions, isGrouped, maxCachedItems, onFetchError, pageSize],
  );

  const allowFetch =
    autoLoadOnMount ||
    (isOpen &&
      (meetsSearchThreshold ||
        (searchOnFocus && debouncedSearch.length === 0) ||
        minSearchChars === 0));

  // Clear the cached results during render (guarded by a sentinel) when the search term
  // drops below the threshold, rather than inside the effect below — this avoids painting
  // the previous, now-stale, result list for one frame. The effect still owns kicking off
  // the actual (async) fetch when `allowFetch` is true.
  const [renderedForFetchGate, setRenderedForFetchGate] = useState({
    allowFetch,
    meetsSearchThreshold,
    debouncedSearch,
  });
  if (
    !allowFetch &&
    !meetsSearchThreshold &&
    debouncedSearch.length > 0 &&
    (renderedForFetchGate.allowFetch !== allowFetch ||
      renderedForFetchGate.meetsSearchThreshold !== meetsSearchThreshold ||
      renderedForFetchGate.debouncedSearch !== debouncedSearch)
  ) {
    setRenderedForFetchGate({ allowFetch, meetsSearchThreshold, debouncedSearch });
    setOptionsState(
      isGrouped
        ? { mode: "grouped", groups: [] }
        : { mode: "flat", options: [] },
    );
    setHasMore(false);
    setTotalAvailable(undefined);
  }

  useEffect(() => {
    if (!allowFetch) {
      // Part of this same data-loading effect's own gate logic (not a separate concern): when
      // fetching becomes inapplicable, the in-flight loading indicators must clear together with
      // it, exactly like the `fetchPage(1, "replace")` call below does for the opposite case.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
      return;
    }
    setNextPage(1);
    setHasMore(true);
    setTotalAvailable(undefined);
    fetchPage(1, "replace");
  }, [allowFetch, fetchPage]);

  useEffect(() => {
    if (!isOpen || !loaderRef.current || !listRef.current) {return;}
    if (!hasMore || isLoadingMore || isLoadingInitial) {return;}

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            hasMore &&
            !isLoadingMore &&
            !isLoadingInitial
          ) {
            fetchPage(nextPage, "next");
          }
        });
      },
      {
        root: listRef.current,
        // Pre-fetch before the very bottom for smoother scroll
        rootMargin: "0px 0px 160px 0px",
        threshold: 0.2,
      },
    );

    observer.observe(loaderRef.current);
    return () => { observer.disconnect(); };
  }, [fetchPage, hasMore, isLoadingInitial, isLoadingMore, isOpen, nextPage]);

  const handleSelect = (
    val: string | number,
    fieldOnChange?: (value: string) => void,
  ) => {
    if (disabled) {return;}
    const serialized = serializeOptionIdForForm(val);
    setIsOpen(false);
    if (value === undefined) {
      setInternalValue(serialized);
    }
    fieldOnChange?.(serialized);
    onValueChange?.(serialized);
  };

  const handleClear = (fieldOnChange?: (value: string) => void) => {
    if (disabled) {return;}
    setIsOpen(false);
    if (value === undefined) {
      setInternalValue(undefined);
    }
    fieldOnChange?.("");
    onValueChange?.(undefined);
  };

  const updatePlacement = () => {
    if (!triggerRef.current || typeof window === "undefined" || !document.body)
      {return;}

    try {
      setMenuStyle(
        computeFixedPortalPlacement(triggerRef.current, menuRef.current, {
          estimatedMenuHeight: 320,
        }),
      );
    } catch (error) {
      console.warn("ServerSideDropdown: Error calculating position", error);
    }
  };

  useEffect(() => {
    if (!isOpen) {return;}

    const handleScrollOrResize = () => {
      updatePlacement();
    };

    updatePlacement();

    // Update placement after a short delay to get actual menu dimensions
    const timeoutId = setTimeout(() => {
      updatePlacement();
    }, 0);

    // Also update after menu renders to get accurate height
    const rafId = requestAnimationFrame(() => {
      updatePlacement();
      // One more update after menu is fully rendered
      setTimeout(() => {
        updatePlacement();
      }, 50);
    });

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen]);

  const renderDropdown = (
    fieldValue?: string,
    fieldOnChange?: (value: string) => void,
    fieldError?: string,
  ) => {
    const currentValue = fieldValue ?? selectedValue;
    const flatOptions = getFlatOptionsFromState(optionsState);
    const optionCount = getOptionsCount(optionsState);
    const listboxId = `${fieldId}-listbox`;
    const resolvedSelectedOption = flatOptions.find((opt) =>
      areOptionIdsEqual(opt.id, currentValue),
    );
    const resolvedSelectedLabel =
      resolvedSelectedOption?.label ??
      (currentValue ? String(currentValue) : undefined);
    const mergedError = fieldError ?? error;
    const allowClear =
      resolvePickerClearable(clearable, { showClearButton, hideClearButton }) &&
      hasDropdownValue(currentValue) &&
      !disabled;
    const startIndex = optionCount > 0 ? 1 : 0;
    const endIndex = optionCount > 0 ? optionCount : 0;
    const totalCount =
      typeof totalAvailable === "number"
        ? totalAvailable
        : hasMore
          ? undefined
          : endIndex;

    const triggerErrorClasses = mergedError ? themeFieldBorderErrorClass : "";

    const showEmptyState =
      !isLoadingInitial && !fetchError && optionCount === 0;

    const renderServerOption = (
      opt: NormalizedSelectOption,
      groupDisabled?: boolean,
    ) => {
      const optionDisabled = isOptionDisabled(opt, groupDisabled);
      const isSelected = areOptionIdsEqual(opt.id, currentValue);

      return (
        <button
          type="button"
          disabled={optionDisabled}
          className={cn(
            "flex w-full cursor-pointer items-start justify-between gap-2 rounded-md px-2 py-2 text-left",
            themeFormDropdownOptionClass,
            themeFormDropdownOptionHoverClass,
            isSelected && themeFormDropdownOptionSelectedClass,
            optionDisabled && themeFormDropdownOptionDisabledClass,
          )}
          role="option"
          aria-selected={isSelected}
          aria-disabled={optionDisabled || undefined}
          onClick={(event) => {
            event.stopPropagation();
            if (optionDisabled) {
              return;
            }
            handleSelect(opt.id, fieldOnChange);
          }}
        >
          <div className="flex flex-col">
            <span>{opt.label}</span>
            {opt.description && (
              <span className="text-xs text-secondary-500 dark:text-secondary-400">
                {opt.description}
              </span>
            )}
          </div>
          {isSelected && (
            <AppIcon name="check" size="controlField" decorative />
          )}
        </button>
      );
    };

    return (
      <div
        className={cn(themeFieldWrapperClass, hideLabel && "gap-0!")}
        ref={containerRef}
      >
        <FormFieldLabel
          id={labelId}
          label={label}
          required={required}
          optional={optional}
          error={!!mergedError}
          infoTooltip={infoTooltip}
          hideLabel={hideLabel}
        />

        <div className="relative">
          <div
            ref={triggerRef}
            role="combobox"
            tabIndex={disabled ? -1 : 0}
            aria-labelledby={labelId}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-required={required || undefined}
            aria-invalid={!!mergedError || undefined}
            aria-disabled={disabled || undefined}
            aria-describedby={
              mergedError ? errorId : helperText ? helperId : undefined
            }
            id={fieldId}
            className={cn(
              themeSelectTriggerShellClass,
              disabled ? themeFieldShellClass : themeFieldBaseClass,
              triggerErrorClasses,
              disabled && themeFieldDisabledClass,
              !disabled && className,
            )}
            onClick={() => {
              if (!disabled) {setIsOpen((prev) => !prev);}
            }}
            onKeyDown={(event) => {
              if (disabled) {return;}
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsOpen((prev) => !prev);
              }
              if (event.key === "Escape" && isOpen) {
                event.preventDefault();
                setIsOpen(false);
              }
            }}
          >
            <span
              className={cn(
                themeSelectTriggerValueClass,
                "truncate",
                !resolvedSelectedLabel &&
                  !mergedError &&
                  "text-slate-400 dark:text-slate-500",
                !resolvedSelectedLabel && mergedError && "text-danger-500",
              )}
            >
              {resolvedSelectedLabel || placeholder}
            </span>
            <div className={themeSelectTriggerActionsClass}>
              {allowClear && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Clear selection"
                  className={cn(themeControlClearButtonClass, "cursor-pointer")}
                  onMouseDown={(event) => { event.preventDefault(); }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClear(fieldOnChange);
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
              {isLoadingInitial && isOpen ? (
                <AppIcon
                  name="loader2"
                  size="controlField"
                  className="shrink-0 animate-spin text-primary-500/70"
                  aria-label="Loading options"
                />
              ) : (
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
              )}
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
                aria-busy={isLoadingInitial}
                onMouseDown={(e) => { e.stopPropagation(); }}
              >
                <div className={themeFormControlMenuSearchShellClass}>
                  <div className={themeFormControlMenuSearchInputClass}>
                    <AppIcon
                      name="search"
                      size="controlField"
                      className={themeControlIconClass}
                    />
                    <input
                      type="text"
                      className={cn(
                        "w-full bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-faint)]",
                        themeFormControlTextClass,
                      )}
                      placeholder={searchPlaceholder}
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); }}
                      onClick={(e) => { e.stopPropagation(); }}
                    />
                    {(isLoadingInitial || isLoadingMore) && (
                      <AppIcon
                        name="loader2"
                        size="controlField"
                        className="animate-spin text-primary-500/70"
                        aria-label={loadingText}
                      />
                    )}
                  </div>
                  {minSearchChars > 0 && (
                    <p className="mt-1 text-[11px] text-secondary-400 dark:text-secondary-500">
                      {`Server search after ${minSearchChars} character${
                        minSearchChars > 1 ? "s" : ""
                      }.`}
                    </p>
                  )}
                </div>

                <div
                  className="max-h-64 overflow-auto p-1 scroll-smooth"
                  ref={listRef}
                  data-testid="server-dropdown-options"
                >
                  {isLoadingInitial && (
                    <div className="space-y-1 px-1 py-2">
                      {[...Array(4)].map((_, idx) => (
                        <div
                          key={idx}
                          className="h-8 animate-pulse rounded-md bg-secondary-100 dark:bg-secondary-700"
                        />
                      ))}
                    </div>
                  )}

                  {!isLoadingInitial &&
                    optionCount === 0 &&
                    fetchError === undefined &&
                    !meetsSearchThreshold && (
                      <div
                        className={cn(
                          "px-3 py-3 text-center text-secondary-500",
                          themeFormControlTextClass,
                        )}
                      >
                        {typeToSearchText ??
                          `Type at least ${minSearchChars} character${
                            minSearchChars > 1 ? "s" : ""
                          } to search.`}
                      </div>
                    )}

                  {!isLoadingInitial && fetchError && (
                    <div className="flex items-start gap-2 px-3 py-2 text-sm text-danger-600 dark:text-danger-400">
                      <AppIcon
                        name="alertCircle"
                        size="controlField"
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-medium">Failed to load options</p>
                        <p className="text-xs text-danger-500 dark:text-danger-300">
                          {fetchError}
                        </p>
                        <button
                          type="button"
                          className="mt-2 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                          onClick={() => {
                            setNextPage(1);
                            setHasMore(true);
                            fetchPage(1, "replace");
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {!isLoadingInitial &&
                    !fetchError &&
                    !isGrouped &&
                    optionsState.mode === "flat" &&
                    optionsState.options.map((opt) => (
                      <React.Fragment key={toOptionIdentityKey(opt.id)}>
                        {renderServerOption(opt)}
                      </React.Fragment>
                    ))}

                  {!isLoadingInitial &&
                    !fetchError &&
                    isGrouped &&
                    optionsState.mode === "grouped" &&
                    optionsState.groups.map((group, groupIndex) => {
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
                                {renderServerOption(option, group.disabled)}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                  {showEmptyState && (
                    <div
                      className={cn(
                        "px-3 py-3 text-center text-secondary-500",
                        themeFormControlTextClass,
                      )}
                    >
                      {noResultsText}
                    </div>
                  )}

                  <div
                    ref={loaderRef}
                    className="px-3 py-2 text-center text-xs"
                  >
                    {isLoadingMore && !isLoadingInitial && (
                      <div className="inline-flex items-center gap-2 text-secondary-500 dark:text-secondary-400">
                        <AppIcon
                          name="loader2"
                          size="controlField"
                          className="animate-spin"
                        />
                        <span>Loading more...</span>
                      </div>
                    )}
                    {!isLoadingMore && hasMore && !isLoadingInitial && (
                      <span className="text-secondary-400 dark:text-secondary-500">
                        Keep scrolling to load more
                      </span>
                    )}
                    {!hasMore && !isLoadingInitial && optionCount > 0 && (
                      <span className="text-secondary-400 dark:text-secondary-500">
                        End of list
                      </span>
                    )}
                    {!isLoadingInitial && (
                      <div className="mt-1 text-[11px] text-secondary-400 dark:text-secondary-500">
                        {totalCount
                          ? `Showing ${startIndex}-${endIndex} of ${totalCount}`
                          : `Showing ${startIndex}-${endIndex}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>

        {helperText && !mergedError && (
          <p
            id={helperId}
            className="text-xs text-secondary-500 dark:text-secondary-400"
          >
            {helperText}
          </p>
        )}
        {mergedError && (
          <p
            id={errorId}
            className="text-xs text-danger-500"
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

export const ServerSideDropdown = React.memo(
  ServerSideDropdownInner,
) as typeof ServerSideDropdownInner;
