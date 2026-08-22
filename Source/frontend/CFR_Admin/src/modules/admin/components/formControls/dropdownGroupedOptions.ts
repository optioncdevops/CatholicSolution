export interface SelectOption {
  /** Identifier sent to API / stored in form (e.g., ID or code) */
  id: string | number;
  /** Human-readable label shown to the user */
  value: string;
  disabled?: boolean;
  description?: string;
  /** @deprecated Use `value` for the display label */
  label?: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
  disabled?: boolean;
}

export type SelectOptions = SelectOption[] | SelectOptionGroup[];

export interface NormalizedSelectOption {
  id: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface NormalizedOptionGroup {
  label: string;
  options: NormalizedSelectOption[];
  disabled?: boolean;
}

export interface OptionGroupLike<TOption> {
  label: string;
  options: TOption[];
  disabled?: boolean;
}

export const hasValidOptionId = (id: unknown): id is string | number => {
  if (typeof id === "number") {
    return !Number.isNaN(id);
  }
  if (typeof id === "string") {
    return id.length > 0;
  }
  return false;
};

/** Compare backend option identities without coercing stored IDs. */
export const areOptionIdsEqual = (
  left: string | number | undefined | null,
  right: string | number | undefined | null,
): boolean => {
  if (left === undefined || left === null || right === undefined || right === null) {
    return false;
  }
  if (left === right) {
    return true;
  }
  // GUIDs / ids may differ only by casing across APIs
  return String(left).toLowerCase() === String(right).toLowerCase();
};

/** Map/set key for deduplication only. Does not replace backend IDs. */
export const toOptionIdentityKey = (id: string | number): string => String(id);

export const resolveSelectOptionLabel = (
  option: Pick<SelectOption, "id" | "value"> & { label?: string },
): string => option.value ?? option.label ?? "";

export const normalizeSelectOption = (
  option: SelectOption,
): NormalizedSelectOption | null => {
  if (!hasValidOptionId(option?.id)) {
    return null;
  }

  return {
    id: String(option.id),
    label: resolveSelectOptionLabel(option),
    disabled: option.disabled || false,
    description: option.description,
  };
};

export const normalizeSelectOptions = (
  options: SelectOptions,
  isGrouped: boolean,
): NormalizedSelectOption[] | NormalizedOptionGroup[] => {
  if (!Array.isArray(options)) {
    return [];
  }

  if (!isGroupedOptionsArray(options, isGrouped)) {
    return (options as SelectOption[])
      .map(normalizeSelectOption)
      .filter((option): option is NormalizedSelectOption => option !== null);
  }

  return (options as any[])
    .map((group) => {
      const groupOptions = group?.options ?? group?.Options;
      return {
        label: group?.label ?? group?.Label ?? "",
        disabled: group?.disabled ?? group?.Disabled ?? false,
        options: (Array.isArray(groupOptions) ? groupOptions : [])
          .map(normalizeSelectOption)
          .filter(
            (option: NormalizedSelectOption | null): option is NormalizedSelectOption =>
              option !== null,
          ),
      };
    })
    .filter((group) => group.options.length > 0);
};

export const isOptionGroup = <TOption>(
  item: any,
): item is OptionGroupLike<TOption> => {
  return (
    typeof item === "object" &&
    item !== null &&
    ("options" in item || "Options" in item) &&
    Array.isArray(item.options ?? item.Options)
  );
};

export const isGroupedOptionsArray = <TOption>(
  options: TOption[] | OptionGroupLike<TOption>[],
  isGrouped?: boolean,
): options is OptionGroupLike<TOption>[] => {
  if (!Array.isArray(options) || !isGrouped || options.length === 0) {
    return false;
  }
  return isOptionGroup(options[0]);
};

export const flattenNormalizedOptions = (
  options: NormalizedSelectOption[] | NormalizedOptionGroup[],
  isGrouped: boolean,
): NormalizedSelectOption[] => {
  if (!Array.isArray(options)) {
    return [];
  }

  if (!isGrouped) {
    return options as NormalizedSelectOption[];
  }

  return (options as NormalizedOptionGroup[]).flatMap((group) =>
    Array.isArray(group?.options)
      ? group.options.map((option) => ({
          ...option,
          disabled: option.disabled || group.disabled,
        }))
      : [],
  );
};

export const getSelectableOptions = (
  options: NormalizedSelectOption[] | NormalizedOptionGroup[],
  isGrouped: boolean,
): NormalizedSelectOption[] => {
  return flattenNormalizedOptions(options, isGrouped).filter(
    (option) => !option.disabled,
  );
};

export const filterFlatOptions = (
  options: NormalizedSelectOption[],
  search: string,
): NormalizedSelectOption[] => {
  if (!Array.isArray(options)) {
    return [];
  }

  const safeSearch = (search ?? "").trim().toLowerCase();
  if (!safeSearch) {
    return options;
  }

  return options.filter((option) =>
    (option?.label ?? "").toLowerCase().includes(safeSearch),
  );
};

export const filterGroupedOptions = (
  groups: NormalizedOptionGroup[],
  search: string,
): NormalizedOptionGroup[] => {
  if (!Array.isArray(groups)) {
    return [];
  }

  const safeSearch = (search ?? "").trim().toLowerCase();
  if (!safeSearch) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      options: (Array.isArray(group?.options) ? group.options : []).filter((option) =>
        (option?.label ?? "").toLowerCase().includes(safeSearch),
      ),
    }))
    .filter((group) => group.options.length > 0);
};

export const findNormalizedOptionLabel = (
  options: NormalizedSelectOption[] | NormalizedOptionGroup[],
  isGrouped: boolean,
  value?: string | number,
): string | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const match = flattenNormalizedOptions(options, isGrouped).find((option) =>
    areOptionIdsEqual(option.id, value),
  );
  return match?.label;
};

export const countNormalizedOptions = (
  options: NormalizedSelectOption[] | NormalizedOptionGroup[],
  isGrouped: boolean,
): number => {
  if (!Array.isArray(options)) {
    return 0;
  }

  if (!isGrouped) {
    return (options as NormalizedSelectOption[]).length;
  }

  return (options as NormalizedOptionGroup[]).reduce(
    (total, group) => total + (Array.isArray(group?.options) ? group.options.length : 0),
    0,
  );
};

export const mergeNormalizedGroups = (
  existing: NormalizedOptionGroup[],
  incoming: NormalizedOptionGroup[],
  mode: "replace" | "append",
): NormalizedOptionGroup[] => {
  if (mode === "replace") {
    return incoming.map((group) => ({
      ...group,
      options: [...group.options],
    }));
  }

  const groupMap = new Map<string, NormalizedOptionGroup>();

  for (const group of existing) {
    groupMap.set(group.label, {
      ...group,
      options: [...group.options],
    });
  }

  for (const group of incoming) {
    const current = groupMap.get(group.label);
    if (!current) {
      groupMap.set(group.label, {
        ...group,
        options: [...group.options],
      });
      continue;
    }

    const optionMap = new Map(
      current.options.map((option) => [toOptionIdentityKey(option.id), option]),
    );
    for (const option of group.options) {
      optionMap.set(toOptionIdentityKey(option.id), option);
    }

    groupMap.set(group.label, {
      ...current,
      disabled: group.disabled ?? current.disabled,
      options: Array.from(optionMap.values()),
    });
  }

  return Array.from(groupMap.values());
};

export const trimCachedOptions = (
  options: NormalizedSelectOption[],
  maxCachedItems: number,
  selectedId?: string | number,
): NormalizedSelectOption[] => {
  if (options.length <= maxCachedItems) {
    return options;
  }

  let trimmed = options.slice(-maxCachedItems);
  if (
    selectedId !== undefined &&
    !trimmed.some((option) => areOptionIdsEqual(option.id, selectedId))
  ) {
    const selectedOption = options.find((option) =>
      areOptionIdsEqual(option.id, selectedId),
    );
    if (selectedOption) {
      trimmed = [selectedOption, ...trimmed].slice(-maxCachedItems);
    }
  }

  return trimmed;
};

export const trimCachedGroups = (
  groups: NormalizedOptionGroup[],
  maxCachedItems: number,
  selectedId?: string | number,
): NormalizedOptionGroup[] => {
  const flat = flattenNormalizedOptions(groups, true);
  if (flat.length <= maxCachedItems) {
    return groups;
  }

  const trimmedFlat = trimCachedOptions(flat, maxCachedItems, selectedId);
  const trimmedKeys = new Set(
    trimmedFlat.map((option) => toOptionIdentityKey(option.id)),
  );

  return groups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) =>
        trimmedKeys.has(toOptionIdentityKey(option.id)),
      ),
    }))
    .filter((group) => group.options.length > 0);
};

export const createGroupHeadingId = (
  listboxId: string,
  groupLabel: string,
  groupIndex: number,
): string => {
  const slug = groupLabel
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${listboxId}-group-${groupIndex}-${slug || "unnamed"}`;
};

export const createGroupedOptionRenderKey = (
  groupIndex: number,
  optionId: string | number,
): string => `${groupIndex}-${toOptionIdentityKey(optionId)}`;

export const isOptionDisabled = (
  option: NormalizedSelectOption,
  groupDisabled?: boolean,
): boolean => {
  return Boolean(option.disabled || groupDisabled);
};

/** Serialize option ID for existing string-based form callbacks only. */
export const serializeOptionIdForForm = (id: string | number): string =>
  String(id);
