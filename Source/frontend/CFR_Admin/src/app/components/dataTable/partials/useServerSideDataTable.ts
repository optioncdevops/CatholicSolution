import { useEffect, useMemo, useRef, useState } from "react";
import type { ClientPageSizeOption } from "./useDataTable";

export interface SortModelItem { columnId: string; direction: "asc" | "desc" }
export type SortModel = SortModelItem[];

export interface FilterModelItem {
  columnId: string;
  value: string;
  type?: "text" | "number" | "date";
  operator?: "contains" | "equals" | "gt" | "lt" | "gte" | "lte";
}

export interface ServerSideFetchParams {
  pageIndex: number;
  pageSize: number;
  sort: SortModel;
  filters: Record<string, string>;
  filterModel: FilterModelItem[];
  globalSearch: string;
  groupBy?: string | null;
}

export interface ServerSideFetchResult<T> {
  rows: T[];
  total: number;
}

/** Server pagination always uses a positive integer page size (never `"all"`). */
export type ServerPageSizeOption = number;

function coerceStoredServerPageSize(
  raw: unknown,
  fallback: number,
): ServerPageSizeOption {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return raw;
  }
  if (raw === "all") {
    return fallback;
  }
  return fallback;
}

export interface UseServerSideDataTableOptions<T> {
  fetchData: (
    params: ServerSideFetchParams
  ) => Promise<ServerSideFetchResult<T>>;
  initialSortBy?: SortModel;
  initialPageSize?: number;
  initialFilters?: Record<string, string>;
  initialSearch?: string;
  debounceMs?: number;
  buildFilterModel?: (filters: Record<string, string>) => FilterModelItem[];
  storageKey?: string | null;
  loadInitialState?: () =>
    | {
        sortModel?: SortModel;
        filters?: Record<string, string>;
        /** Legacy values may be `"all"`; coerced to a positive integer. */
        pageSize?: ServerPageSizeOption | ClientPageSizeOption;
        groupBy?: string | null;
      }
    | undefined;
  onStatePersist?: (state: {
    sortModel: SortModel;
    filters: Record<string, string>;
    pageSize: number;
    groupBy: string | null;
  }) => void;
  groupBy?: string | null;
}

export function useServerSideDataTable<T>(
  opts: UseServerSideDataTableOptions<T>,
) {
  const {
    fetchData,
    initialSortBy = [],
    initialPageSize = 20,
    initialFilters = {},
    initialSearch = "",
    debounceMs = 250,
    buildFilterModel,
    storageKey = null,
    loadInitialState,
    onStatePersist,
    groupBy = null,
  } = opts;

  // Restore persisted state once at mount via a lazy initializer instead of a mount-only effect
  // — `loadInitialState` is a synchronous, external source read once, same as reading storage.
  const [initialStateSnapshot] = useState(() => loadInitialState?.());

  const [sortModel, setSortModel] = useState<SortModel>(
    () => initialStateSnapshot?.sortModel ?? initialSortBy,
  );
  const [filters, setFilters] = useState<Record<string, string>>(
    () => initialStateSnapshot?.filters ?? initialFilters,
  );
  const [globalSearch, setGlobalSearch] = useState(initialSearch);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<ServerPageSizeOption>(() =>
    initialStateSnapshot?.pageSize !== undefined
      ? coerceStoredServerPageSize(initialStateSnapshot.pageSize, initialPageSize)
      : initialPageSize,
  );
  const [groupByState, setGroupByState] = useState<string | null>(() =>
    initialStateSnapshot?.groupBy !== undefined
      ? initialStateSnapshot.groupBy
      : groupBy,
  );

  const [rows, setRows] = useState<T[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const [refreshToken, setRefreshToken] = useState(0);

  const pageCount = useMemo(() => {
    const ps = Math.max(1, pageSize);
    return Math.max(1, Math.ceil(Math.max(totalRows, 0) / ps));
  }, [pageSize, totalRows]);

  const safePageIndex = useMemo(() => {
    return Math.min(pageIndex, Math.max(0, pageCount - 1));
  }, [pageIndex, pageCount]);

  // Clamp the current page index against `pageCount` during render (sentinel-keyed on
  // `pageCount`) rather than as an effect — this genuinely reacts to `pageCount` changing
  // over time (e.g. after a data refresh shrinks the row count), so it stays keyed, not lazy.
  const [renderedForPageCount, setRenderedForPageCount] = useState(pageCount);
  if (renderedForPageCount !== pageCount) {
    setRenderedForPageCount(pageCount);
    setPageIndex((current) => {
      const maxIndex = Math.max(0, pageCount - 1);
      return Math.min(current, maxIndex);
    });
  }

  const fetchParams = useMemo(
    () => ({
      pageIndex: safePageIndex,
      pageSize,
      sort: sortModel,
      filters,
      filterModel: buildFilterModel ? buildFilterModel(filters) : [],
      globalSearch,
      groupBy: groupByState,
    }),
    [
      safePageIndex,
      pageSize,
      sortModel,
      filters,
      globalSearch,
      buildFilterModel,
      groupByState,
    ],
  );

  // Flip `loading` to true during render (sentinel-keyed on the fetch-triggering identities)
  // rather than synchronously at the top of the fetch effect below — the effect's async
  // `.then()`/`.catch()`/`.finally()` callbacks (which run after the effect body, not
  // synchronously within it) remain responsible for flipping it back off.
  const [renderedForFetchParams, setRenderedForFetchParams] = useState(fetchParams);
  const [renderedForRefreshToken, setRenderedForRefreshToken] = useState(refreshToken);
  if (
    renderedForFetchParams !== fetchParams ||
    renderedForRefreshToken !== refreshToken
  ) {
    setRenderedForFetchParams(fetchParams);
    setRenderedForRefreshToken(refreshToken);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestIdRef.current;

    const handle = setTimeout(() => {
      fetchData(fetchParams)
        .then((res) => {
          if (cancelled || requestId !== requestIdRef.current) {return;}
          setRows(res.rows ?? []);
          setTotalRows(res.total ?? 0);
          setError(null);
        })
        .catch((err) => {
          if (cancelled || requestId !== requestIdRef.current) {return;}
          const message =
            err instanceof Error
              ? err.message
              : typeof err === "string"
                ? err
                : "Failed to load data";
          setError(message);
          setRows([]);
          setTotalRows(0);
        })
        .finally(() => {
          if (!cancelled && requestId === requestIdRef.current) {
            setLoading(false);
          }
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [fetchParams, fetchData, debounceMs, refreshToken]);

  useEffect(() => {
    if (!storageKey && !onStatePersist) {return;}
    const stateForStorage = {
      sortModel,
      filters,
      pageSize,
      groupBy: groupByState,
    };
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(stateForStorage));
      } catch {
        // ignore storage errors
      }
    }
    onStatePersist?.({
      sortModel,
      filters,
      pageSize,
      groupBy: groupByState,
    });
  }, [sortModel, filters, pageSize, groupByState, storageKey, onStatePersist]);

  const refresh = () => { setRefreshToken((t) => t + 1); };

  return {
    rows,
    totalRows,
    pageIndex: safePageIndex,
    pageSize,
    /** Same as `pageSize`; kept for existing destructuring. */
    effectiveNumericPageSize: pageSize,
    pageCount,
    sortModel,
    filters,
    globalSearch,
    groupBy: groupByState,
    loading,
    error,

    setSortModel,
    setFilters,
    setGlobalSearch,
    setPageIndex,
    setPageSize,
    setGroupByState,
    refresh,
  };
}
