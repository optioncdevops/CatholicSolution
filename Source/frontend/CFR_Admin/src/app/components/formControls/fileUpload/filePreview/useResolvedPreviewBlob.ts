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
  }, [item.file.name, item.file.size, item.file.lastModified, item.url]);

  return { resolved, loading, error };
}
