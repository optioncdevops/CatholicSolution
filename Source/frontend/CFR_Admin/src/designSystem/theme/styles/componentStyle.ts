import { cn } from "@app/utilities/cn";

/**
 * Component theming constants for the ported DataTable/formControls library.
 *
 * This is an adapted port of the reference project's `componentStyle.ts` — same exported
 * symbol names (so the ported files require no call-site changes), but every class value
 * is rebuilt on top of CFR_Admin's own CSS-custom-property design tokens
 * (`modules/admin/theme.css`, `shared/designSystem/styles.css`) and Tailwind v4 arbitrary
 * values, instead of the reference project's foreign Tailwind color scale
 * (`primary-800`, `analyze-500`, `danger-400`, ...). Only the symbols actually consumed
 * by the ported dataTable/formControls/tab/treeView/tooltip/modal/common code are kept.
 */

// ── Typography ───────────────────────────────────────────────────────

/** Standard form label. */
export const themeLabelClass =
  "text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)]";

/** Input values, dropdown triggers, picker triggers, and control text. */
export const themeFormControlTextClass =
  "text-[length:var(--admin-text-base)] leading-snug";

/** Placeholders inside form controls. */
export const themeFormControlPlaceholderClass =
  "placeholder:text-[length:var(--admin-text-base)] placeholder:text-[var(--text-faint)]";

/** Dropdown / multiselect menu rows and search fields. */
export const themeFormDropdownOptionClass =
  "text-[length:var(--admin-text-base)] text-[var(--text-primary)]";

/** Date/time picker panel cells and lists. */
export const themeFormPickerPanelClass = "text-[length:var(--admin-text-base)]";

export const themeOptionalLabelSuffixClass = "font-normal text-[var(--text-faint)]";

/** Standard wrapper for label + control + helper/error — keeps vertical gap consistent. */
export const themeFieldWrapperClass = "flex w-full min-w-0 max-w-full flex-col gap-1";

export const themeHelperClass = "text-[length:var(--admin-text-xs)] text-[var(--text-muted)]";

/** Helper/error text slot — no min-height so empty fields stay compact. */
export const themeFieldFeedbackSlotClass = "text-[length:var(--admin-text-2xs)] leading-snug";

export const themeFieldFeedbackHelperClass =
  "text-[length:var(--admin-text-2xs)] leading-snug text-[var(--text-muted)]";

export const themeFieldFeedbackErrorClass =
  "text-[length:var(--admin-text-2xs)] leading-snug text-[var(--error)]";

export const themeHeadingClass = "[font-weight:var(--admin-weight-bold)] text-[var(--text-primary)]";

// ── Surfaces ─────────────────────────────────────────────────────────

export const themeCardSurfaceClass =
  "rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]";

export const themeCardMutedSurfaceClass =
  "rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface-muted)] shadow-[var(--shadow-card)]";

export const themePanelSurfaceClass =
  "rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)]";

// ── Form fields ──────────────────────────────────────────────────────

export const FORM_CONTROL_CLASSES = {
  /** Layout shell shared by inputs and select triggers. */
  base: `w-full min-h-[var(--admin-control-height)] rounded-[var(--admin-control-radius)] border px-[var(--admin-control-padding-x)] ${themeFormControlTextClass} transition-colors outline-none`,
  /** Default field surface (editable). */
  defaultSurface: "bg-[var(--surface)] border-[var(--line)] text-[var(--text-primary)]",
  /** Focus / hover ring for native inputs and focusable triggers. */
  focus:
    "hover:border-[var(--line-strong)] focus-visible:border-[var(--secondary)] focus-visible:outline-none dark:focus-visible:border-[var(--secondary)]",
  /** Focus-within for composite triggers (dropdown shell, date picker shell). */
  focusWithin:
    "hover:border-[var(--line-strong)] focus-within:border-[var(--secondary)]",
  /** Disabled — must visually differ from editable fields. */
  disabled:
    "cursor-not-allowed !border-[var(--line)] !bg-[var(--surface-muted)] !text-[var(--text-faint)] opacity-100 hover:!border-[var(--line)] focus:!border-[var(--line)] focus:ring-0 focus-visible:!border-[var(--line)] focus-visible:ring-0",
  /** Read-only — muted vs editable, still more readable than disabled. */
  readonly:
    "cursor-default !border-[var(--line)] !bg-[var(--surface-muted)] !text-[var(--text-secondary)] hover:!border-[var(--line)] focus-visible:!border-[var(--line)] focus-visible:ring-0",
  /** Validation error — overrides normal focus ring. */
  error:
    "border-[var(--error)] bg-[var(--error-bg)] text-[var(--text-primary)] focus-visible:border-[var(--error)] focus-within:border-[var(--error)]",
  /** Trailing icons (chevron, calendar) in default state. */
  icon: "text-[var(--text-faint)]",
  /** Icons inside disabled/read-only controls. */
  iconDisabled: "text-[var(--text-faint)] opacity-70",
  /** Icon hover inside interactive field controls. */
  iconHover: "hover:text-[var(--text-secondary)]",
  /** Dropdown / picker floating menus. */
  menu: "rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-elevated)]",
  /** Menu search row shell. */
  menuSearchShell: "sticky top-0 border-b border-[var(--line)] bg-[var(--surface)] p-2",
  /** Inline search input border inside menus. */
  menuSearchInput: "flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] px-2 py-1",
  /** Hover state for menu options. */
  optionHover: "hover:bg-[var(--hover)]",
  /** Selected/active menu option. */
  optionSelected: "bg-[var(--selected)] font-medium text-[var(--primary)]",
  /** Minimum closed trigger height. */
  triggerMinHeight: "min-h-8 box-border",
} as const;

export const themeFieldBaseClass = cn(
  FORM_CONTROL_CLASSES.base,
  FORM_CONTROL_CLASSES.defaultSurface,
  themeFormControlPlaceholderClass,
  FORM_CONTROL_CLASSES.focus,
);

/** Layout + typography only — pair with defaultSurface / disabled / readonly. */
export const themeFieldShellClass = cn(FORM_CONTROL_CLASSES.base, themeFormControlPlaceholderClass);

export const themeFieldTextareaBaseClass = cn(
  "w-full rounded-[var(--admin-control-radius)] border px-[var(--admin-control-padding-x)] py-1.5",
  themeFormControlTextClass,
  FORM_CONTROL_CLASSES.defaultSurface,
  themeFormControlPlaceholderClass,
  "transition-colors outline-none",
  FORM_CONTROL_CLASSES.focus,
);

/** Textarea layout without editable surface — use with disabled/readonly tokens. */
export const themeFieldTextareaShellClass = cn(
  "w-full rounded-[var(--admin-control-radius)] border px-[var(--admin-control-padding-x)] py-1.5",
  themeFormControlTextClass,
  themeFormControlPlaceholderClass,
  "transition-colors outline-none",
);

export const themeFieldBorderNormalClass = FORM_CONTROL_CLASSES.focus;
export const themeFieldBorderErrorClass = FORM_CONTROL_CLASSES.error;
/** Disabled state for inputs, textareas, selects, and picker triggers. */
export const themeFieldDisabledClass = FORM_CONTROL_CLASSES.disabled;
/** Read-only state for inputs and picker triggers. */
export const themeFieldReadonlyClass = FORM_CONTROL_CLASSES.readonly;
/** Muted icons inside disabled field controls. */
export const themeFieldDisabledIconClass = FORM_CONTROL_CLASSES.iconDisabled;
/** Default trailing icons inside form controls (chevron, calendar). */
export const themeControlIconClass = FORM_CONTROL_CLASSES.icon;

/** 13px field icons — prefix, suffix, calendar, clock, search, password toggle. */
export const themeControlFieldIconClass = cn("leading-none", FORM_CONTROL_CLASSES.icon);
/** 12px field icons — clear, remove, compact actions. */
export const themeControlActionIconClass = cn("leading-none", FORM_CONTROL_CLASSES.icon);
/** Interactive field icon hover (calendar trigger, password toggle). */
export const themeControlIconHoverClass = FORM_CONTROL_CLASSES.iconHover;
/** Floating menu panel for dropdowns and pickers. */
export const themeFormControlMenuClass = FORM_CONTROL_CLASSES.menu;
export const themeFormControlMenuSearchShellClass = FORM_CONTROL_CLASSES.menuSearchShell;
export const themeFormControlMenuSearchInputClass = FORM_CONTROL_CLASSES.menuSearchInput;
export const themeFormDropdownOptionHoverClass = FORM_CONTROL_CLASSES.optionHover;
export const themeFormDropdownOptionSelectedClass = FORM_CONTROL_CLASSES.optionSelected;
/** Disabled upload / dropzone surfaces. */
export const themeFieldDisabledSurfaceClass = FORM_CONTROL_CLASSES.disabled;
/** Disabled checkbox / radio / switch label text. */
export const themeChoiceLabelDisabledClass = "cursor-not-allowed text-[var(--text-faint)]";
/** Disabled checkbox / radio input surface. */
export const themeChoiceInputDisabledClass =
  "cursor-not-allowed border-[var(--line)] bg-[var(--surface-muted)] text-[var(--text-faint)] accent-[var(--text-faint)] opacity-100";
/** Disabled switch track. */
export const themeSwitchDisabledTrackClass = "cursor-not-allowed bg-[var(--line)]";
/** Disabled switch thumb. */
export const themeSwitchDisabledThumbClass = "bg-[var(--surface)]";
/** Disabled action buttons inside field controls (clear, palette, file actions). */
export const themeFieldDisabledActionButtonClass =
  "cursor-not-allowed text-[var(--text-faint)] hover:bg-transparent hover:text-[var(--text-faint)] focus-visible:ring-0";
/** Disabled dropdown / multi-select menu options. */
export const themeFormDropdownOptionDisabledClass = "cursor-not-allowed text-[var(--text-faint)] hover:bg-transparent";
/** Non-interactive grouped dropdown section headings. */
export const themeFormDropdownGroupHeadingClass =
  "px-3 pb-1.5 pt-2.5 text-[length:var(--admin-text-xs)] font-medium text-[var(--primary)] first:pt-1.5";
/** Indented option list within a grouped dropdown section. */
export const themeFormDropdownGroupOptionsClass = "pl-3";
/** Subtle divider between grouped dropdown sections. */
export const themeFormDropdownGroupDividerClass = "mx-2 border-t border-[var(--line-soft)]";
/** Disabled calendar day cells in date pickers. */
export const themePickerDayDisabledClass = "cursor-not-allowed text-[var(--text-faint)]";
/** Rich text editor shell when editing is disabled. */
export const themeRichTextDisabledShellClass = cn(FORM_CONTROL_CLASSES.disabled, "focus-within:ring-0");

export const themeFieldGroupShellClass = cn(
  "rounded-[var(--admin-control-radius)] border px-[var(--admin-control-padding-x)] py-1.5",
  FORM_CONTROL_CLASSES.defaultSurface,
);
export const themeFieldGroupShellErrorClass = "border-[var(--error)]";

// ── Form action footers (Save / Cancel / Save & Next) ────────────────

export const themeFormActionFooterStickyClass = "sticky bottom-0 z-30";

export const themeFormActionFooterClass =
  "-mx-4 mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.08)] backdrop-blur";

export const themeFormActionFooterClassComfortable = "-mx-6 px-6";
export const themeFormActionFooterBodyPadClass = "pb-4 sm:pb-5";

// ── Form section cards / data table shells ────────────────────────────

export const themeFormSectionTableSlotClass =
  "min-w-0 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]";

/** Shared data table outer shell (used inside FormSectionCard and standalone). */
export const themeDataTableShellClass = "relative min-w-0 w-full transition-all duration-200";

/** Data table header band. */
export const themeDataTableHeadClass = "border-y border-[var(--line)] bg-[var(--surface-muted)]";

/** Checkbox / radio input — validation border on the control itself. */
export const themeChoiceInputClass =
  "h-4 w-4 shrink-0 border-[var(--line-strong)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]";
export const themeChoiceInputCheckboxClass = `${themeChoiceInputClass} rounded`;
export const themeChoiceInputRadioClass = `${themeChoiceInputClass} rounded-full`;
export const themeChoiceInputErrorClass = "border-[var(--error)] ring-2 ring-[var(--error)]/25";

// ── Tabs & nav (in-content) ──────────────────────────────────────────

export const themeTabFocusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2";

export const themeTabListBorderClass = "border-b border-[var(--line)]";
export const themeTabActiveClass = "border-b-2 border-[var(--secondary)] text-[var(--primary)] font-semibold";
export const themeTabInactiveClass = "text-[var(--text-muted)] hover:text-[var(--primary)]";

export const themeTabPillActiveClass =
  "rounded-[var(--radius-control)] bg-[var(--selected)] font-medium text-[var(--primary)] ring-1 ring-inset ring-[var(--secondary)]/40";
export const themeTabPillInactiveClass =
  "rounded-[var(--radius-control)] text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--primary)]";

export const themeTabSegmentedListClass =
  "w-full max-w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-1 sm:w-auto";
export const themeTabSegmentedActiveClass =
  "rounded-[var(--radius-control)] bg-[var(--surface)] font-medium text-[var(--primary)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)]";
export const themeTabSegmentedInactiveClass =
  "rounded-[var(--radius-control)] text-[var(--text-muted)] hover:text-[var(--primary)]";

export const themeTabModuleListClass =
  "inline-flex w-max min-w-full flex-nowrap gap-1 rounded-[var(--radius-control)] border-0 bg-[var(--surface-muted)] p-1 sm:w-auto";
export const themeTabModuleActiveClass =
  "rounded-[var(--radius-control)] bg-[var(--primary)] font-semibold text-white shadow-[var(--shadow-soft)]";
export const themeTabModuleInactiveClass =
  "rounded-[var(--radius-control)] font-semibold text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--primary)]";

export const themeTabBoxedListClass = "flex gap-2 border-b-0";
export const themeTabBoxedActiveClass =
  "rounded-[var(--radius-control)] border border-[var(--secondary)]/70 bg-[var(--selected)] font-medium text-[var(--primary)] shadow-[var(--shadow-soft)]";
export const themeTabBoxedInactiveClass =
  "rounded-[var(--radius-control)] border border-transparent text-[var(--text-muted)] hover:border-[var(--line)] hover:bg-[var(--hover)] hover:text-[var(--primary)]";

export const themeTabVerticalListClass =
  "flex w-full min-w-[11rem] flex-col gap-0.5 border-r border-[var(--line)] pr-3";
export const themeTabVerticalActiveClass =
  "border-l-2 border-[var(--secondary)] bg-[var(--selected)] pl-[calc(0.75rem-2px)] font-medium text-[var(--primary)]";
export const themeTabVerticalInactiveClass =
  "border-l-2 border-transparent pl-3 text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--primary)]";

export const themeTabMaterialActiveClass = "border-b-[3px] border-[var(--secondary)] text-[var(--primary)]";
export const themeTabMaterialInactiveClass =
  "border-b-[3px] border-transparent text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--primary)]";

export const themeTabFluentActiveClass =
  "border-b-2 border-[var(--secondary)] bg-[var(--selected)] font-semibold text-[var(--primary)]";
export const themeTabFluentInactiveClass =
  "border-b-2 border-transparent text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--primary)]";

export const themeTabChromeListClass = "gap-0.5 border-b border-[var(--line)] bg-[var(--surface-muted)] px-1 pt-1";
export const themeTabChromeActiveClass =
  "relative z-[1] -mb-px rounded-t-[var(--radius-control)] border border-[var(--line)] border-b-[var(--surface)] bg-[var(--surface)] font-medium text-[var(--primary)] shadow-[var(--shadow-soft)]";
export const themeTabChromeInactiveClass =
  "rounded-t-[var(--radius-control)] border border-transparent text-[var(--text-muted)] hover:bg-[var(--surface)]/60 hover:text-[var(--primary)]";

export const themeTabIosListClass = "w-full max-w-full rounded-full border-0 bg-[var(--surface-muted)] p-1 sm:w-auto";
export const themeTabIosActiveClass =
  "rounded-full bg-[var(--surface)] font-medium text-[var(--primary)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)]";
export const themeTabIosInactiveClass = "rounded-full text-[var(--text-muted)] hover:text-[var(--primary)]";

export const themeTabMinimalActiveClass = "font-semibold text-[var(--primary)]";
export const themeTabMinimalInactiveClass = "text-[var(--text-muted)] hover:text-[var(--primary)]";

export const themeTabEnclosedListClass =
  "w-full max-w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-1 sm:w-auto";
export const themeTabEnclosedActiveClass =
  "rounded-[var(--radius-control)] bg-[var(--surface)] font-medium text-[var(--primary)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)]";
export const themeTabEnclosedInactiveClass =
  "rounded-[var(--radius-control)] text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--primary)]";

// ── Tree rows (explorer / master-detail) ─────────────────────────────

export const themeTreeRowBaseClass = "flex items-center gap-1.5 rounded-[var(--radius-control)] py-1.5 pr-2 text-[length:var(--admin-text-base)] transition-colors";
export const themeTreeBranchRowClass = "cursor-pointer font-medium text-[var(--primary)] hover:bg-[var(--hover)]";
export const themeTreeLeafRowClass = "cursor-pointer text-[var(--text-primary)] hover:bg-[var(--hover)]";
export const themeTreeLeafSelectedClass =
  "bg-[var(--selected)] font-medium text-[var(--primary)] ring-1 ring-inset ring-[var(--secondary)]/40 hover:bg-[var(--selected)]";
export const themeTreeChevronButtonClass =
  "inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-[var(--hover)]";
export const themeTreeGuideLineClass = "border-l border-[var(--line)]";
export const themeTreeEmptyStateClass = "text-[length:var(--admin-text-xs)] text-[var(--text-muted)]";
export const themeTreeEmptyBodyClass = "flex flex-1 items-center justify-center p-6 text-[var(--text-muted)]";

// ── Tree split panel layout ────────────────────────────────────────────

export const themeTreeSplitPanelRootClass = "flex w-full min-w-0 flex-col gap-4 lg:flex-row";
export const themeTreeSplitPanelRootFillClass = "flex h-full min-h-0 w-full flex-col lg:flex-row";
export const themeTreeSplitPanelRootFillViewportClass = "h-full min-h-0";
export const themeTreeSplitPanelRootViewportClass = "min-h-[420px]";
export const themeTreeSplitPanelGridClass = "grid w-full grid-cols-1 gap-4 lg:grid-cols-[16rem_1fr]";
export const themeTreeSplitPanelGridCollapsibleClass = "lg:grid-cols-[auto_1fr]";
export const themeTreeSplitAsideClass =
  "flex min-h-0 flex-col gap-2 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[var(--shadow-card)]";
export const themeTreeSplitHeaderClass = "flex items-center justify-between gap-2 px-1 py-1";
export const themeTreeSplitSearchClass = cn(themeFieldBaseClass, "h-9");
export const themeTreeSplitScrollBodyClass = "min-h-0 flex-1 overflow-y-auto";
export const themeTreeSplitMainClass =
  "flex min-h-0 min-w-0 flex-1 flex-col rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]";
export const themeTreeSplitCollapsedRailClass =
  "flex w-10 shrink-0 flex-col items-center gap-2 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-2";
export const themeTreeSplitToggleButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--primary)]";
export const themeTreeSplitMobileModulesButtonClass = cn(
  themeFieldBaseClass,
  "flex h-9 items-center justify-between",
);
export const themeTreeSplitContentHeaderClass = "flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2";
export const themeTreeSplitMobileBarClass = "flex items-center gap-2 lg:hidden";

// ── Alert dialog (SweetAlert2) ────────────────────────────────────────

export const themeAlertDialogSurfaceClass =
  "rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-elevated)]";
export const themeAlertDialogTitleClass = "text-[length:var(--admin-text-lg)] font-semibold leading-snug text-[var(--text-primary)]";
export const themeAlertDialogBodyClass = "text-[length:var(--admin-text-base)] leading-normal text-[var(--text-muted)]";
export const themeAlertDialogButtonClass = "h-8 px-3 text-[length:var(--admin-text-base)] font-medium";

/** Matches BaseModal overlay — full viewport dim above shell chrome. */
export const themeModalLayerClass = "z-[10100]";
/** Page-level form portals (Dropdown, pickers, etc.). */
export const themeFormControlPortalLayerPageClass = "z-[65]";
/** In-modal form portals — above `themeModalLayerClass` so options stay visible in dialogs. */
export const themeFormControlPortalLayerClass = "z-[10200]";
/** Open-modal marker used to resolve page vs modal portal stacking. */
export const APP_MODAL_OPEN_ATTR = "data-app-modal";

export function resolveFormControlPortalLayerClass(): string {
  if (typeof document === "undefined") {
    return themeFormControlPortalLayerPageClass;
  }
  const modalOpen = document.querySelector(`[${APP_MODAL_OPEN_ATTR}="open"]`);
  return modalOpen ? themeFormControlPortalLayerClass : themeFormControlPortalLayerPageClass;
}

export const THEME_SHELL_NAV_PORTAL_Z_INDEX = 10250;
export const themeShellNavPortalLayerClass = "z-[10250]";
export const themeShellNavFlyoutLayerClass = "z-[10251]";

export const themeSelectTriggerShellClass = cn(
  "flex min-h-[var(--admin-control-height)] w-full items-center justify-between gap-2 text-left transition-colors duration-150 focus:outline-none cursor-pointer",
  FORM_CONTROL_CLASSES.focusWithin,
);

export const themeMultiSelectFieldBaseClass = cn(
  "w-full h-auto rounded-[var(--admin-control-radius)] border px-[var(--admin-control-padding-x)] py-1.5",
  FORM_CONTROL_CLASSES.triggerMinHeight,
  themeFormControlTextClass,
  "transition-colors outline-none",
  FORM_CONTROL_CLASSES.defaultSurface,
  themeFormControlPlaceholderClass,
);

export const themeMultiSelectTriggerShellClass = cn(
  "flex h-auto w-full items-start justify-between gap-2 text-left transition-colors duration-150 focus:outline-none cursor-pointer",
  FORM_CONTROL_CLASSES.focusWithin,
);

export const themeSelectTriggerValueClass = "min-w-0 flex-1 text-left";
export const themeSelectTriggerActionsClass = "ml-auto flex shrink-0 items-center gap-0.5";
export const themeMultiSelectTriggerValueClass =
  "flex min-w-0 flex-1 flex-wrap items-center gap-1.5 max-h-[72px] overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]";
export const themeMultiSelectChipClass =
  "inline-flex max-w-full items-center gap-1 rounded-[var(--radius-control)] bg-[var(--selected)] px-2 py-0.5 text-[length:var(--admin-text-2xs)] font-medium leading-snug text-[var(--primary)]";
export const themeMultiSelectTriggerActionsClass = "ml-auto inline-flex shrink-0 items-center gap-1 self-start";

export const themeControlChevronClass = cn("shrink-0 transition-transform duration-150", FORM_CONTROL_CLASSES.icon);
export const themeControlClearIconClass = "leading-none";
export const themeControlClearButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-transparent text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]";

export const themeModalBackdropClass = "bg-slate-950/55 backdrop-blur-sm sm:backdrop-blur-[2px]";

// ── Tables (simple) ──────────────────────────────────────────────────

export const themeTableShellClass = "overflow-hidden rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-soft)]";
export const themeTableHeadClass = "border-b border-[var(--line)] bg-[var(--surface-muted)]";
export const themeTableHeadCellClass =
  "px-6 py-4 text-left text-[length:var(--admin-text-2xs)] font-semibold uppercase tracking-wider text-[var(--text-secondary)]";
export const themeTableRowHoverClass = "transition-colors hover:bg-[var(--hover)]";
export const themeTableDivideClass = "divide-y divide-[var(--line-soft)]";

// ── Stepper ──────────────────────────────────────────────────────────

export const themeStepActiveClass = "bg-[var(--secondary)] text-white shadow-[var(--shadow-soft)] ring-2 ring-[var(--focus-ring)]";
export const themeStepCompleteClass = "bg-[var(--success)] text-white";
export const themeStepIdleClass = "bg-[var(--surface-muted)] text-[var(--text-muted)]";
export const themeStepTitleActiveClass = "text-[var(--primary)]";
export const themeStepTitleIdleClass = "text-[var(--text-muted)]";

// ── Tooltip ──────────────────────────────────────────────────────────

export const themeTooltipClass = "bg-[var(--primary)] text-white border border-[var(--primary-hover)]/50";
export const themeTooltipLayerClass = "z-[10300]";

// ── Data table fullscreen ────────────────────────────────────────────

export const THEME_DATA_TABLE_FULLSCREEN_Z_INDEX = 10150;
export const themeDataTableFullscreenLayerClass = "z-[10150]";
export const themeDataTableFullscreenBackdropClass = "bg-slate-900/70 backdrop-blur-[1px]";

export const themeDataTablePortalLayerPageClass = "z-[10000]";

export function resolveDataTablePortalLayerClass(): string {
  if (typeof document === "undefined") {
    return themeDataTablePortalLayerPageClass;
  }
  const modalOpen = document.querySelector(`[${APP_MODAL_OPEN_ATTR}="open"]`);
  if (modalOpen) {
    return themeFormControlPortalLayerClass;
  }
  const fullscreenOpen = document.querySelector('[aria-label="Table fullscreen view"]');
  if (fullscreenOpen) {
    return themeFormControlPortalLayerClass;
  }
  return themeDataTablePortalLayerPageClass;
}

// ── Toast ──────────────────────────────────────────────────────────────

export const THEME_TOAST_Z_INDEX = 10400;
export const themeToastLayerClass = "z-[10400]";

// ── App loader (route / auth suspense) ───────────────────────────────

export const themeAppLoaderLayerClass = "z-[1200]";
export const themeAppLoaderTopBarLayerClass = "z-[1201]";
export const themeAppLoaderSurfaceClass = cn("flex items-center justify-center overflow-hidden backdrop-blur-sm", "bg-[var(--bg-app)]");
export const themeAppLoaderInlineSurfaceClass = "flex min-h-[240px] items-center justify-center";
export const themeAppLoaderTopBarTrackClass = "h-0.5 bg-[var(--surface-muted)]";
export const themeAppLoaderTopBarClass = "rounded-full bg-gradient-to-r from-[var(--primary)] via-[var(--primary-hover)] to-[var(--secondary)]";

export const themeLoadingStripeClass = "bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)]";
