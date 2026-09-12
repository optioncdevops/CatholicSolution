import { useEffect, useState } from "react";
import type { UploadPreviewItem } from "../fileUpload.utils";
import {
  resolvePreviewBlob,
  revokeResolvedPreviewBlob,
  type ResolvedPreviewBlob,
} from "./resolvePreviewBlob";

interface UseResolvedPreviewBlobResult {
  resolved: ResolvedPreviewBlob | null;
  loading: boolean;
  error: string | null;
}

export function useResolvedPreviewBlob(item: UploadPreviewItem): UseResolvedPreviewBlobResult {
  const [resolved, setResolved] = useState<ResolvedPreviewBlob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let activeResolved: ResolvedPreviewBlob | null = null;

    // Standard cancellable async-load effect: resetting loading/error/resolved at the start of
    // each fetch-on-dependency-change cycle is the necessary and correct pattern here (preserved
    // as-is per this review's own instruction not to rewrite working async loading effects) — the
    // actual resolved blob isn't known until `resolvePreviewBlob` resolves below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setResolved(null);

    resolvePreviewBlob(item)
      .then((next) => {
        if (cancelled) {
          revokeResolvedPreviewBlob(next);
          return;
        }
        activeResolved = next;
        setResolved(next);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (cancelled) {return;}
        const message =
          cause instanceof Error ? cause.message : "Could not load file for preview.";
        setError(message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      revokeResolvedPreviewBlob(activeResolved);
    };
    // Deliberately depends on the primitive fields that actually identify "which file to
    // resolve" rather than the whole `item` object — callers commonly pass a fresh wrapper
    // object on every render even when the underlying file hasn't changed, and depending on
    // `item` directly would re-run this (re-fetch/re-resolve the blob) far more often than
    // necessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.file.name, item.file.size, item.file.lastModified, item.url]);

  return { resolved, loading, error };
}
