import React, { useEffect, useMemo, useState } from "react";
import type {
    Control,
    FieldValues,
    Path,
    RegisterOptions,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { showToast } from "@app/components/common/CustomToastMessage";
import { FormFieldLabel } from "./FormFieldLabel";
import { FileDropZone } from "./fileUpload/partials/FileDropZone";
import { FileSelectedCard } from "./fileUpload/partials/FileSelectedCard";
import { FilePreviewModal } from "./fileUpload/partials/FilePreviewModal";
import {
    createObjectUrl,
    formatMaxFileSizeLabel,
    isAcceptedFileType,
    isImageFile,
    revokeObjectUrl,
    validateFileSize,
} from "./fileUpload/fileUpload.utils";
import type { UploadPreviewItem } from "./fileUpload/fileUpload.utils";

interface BaseExcelUploadProps {
    label: string;
    /** Accepted file extensions (e.g., ['.xlsx', '.xls', '.csv']) */
    acceptedExtensions?: string[];
    /** Maximum file size in MB */
    maxSizeMB?: number;
    /** Helper text shown below the upload area */
    helperText?: string;
    /** Error message to show */
    error?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Show “(optional)” suffix when the field is not required */
    optional?: boolean;
    /** Callback when file is selected */
    onChange?: (file: File | null) => void;
    /** Current file value */
    value?: File | null;
    disabled?: boolean;
    enableDocumentPreview?: boolean;
}

export interface ExcelUploadProps<TFieldValues extends FieldValues = FieldValues>
    extends BaseExcelUploadProps {
    /** react-hook-form control object for controlled forms */
    control?: Control<TFieldValues>;
    /** Field name for react-hook-form (required when control is provided) */
    name?: Path<TFieldValues>;
    /** Validation rules for react-hook-form */
    rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
}

const ExcelUploadInner = <TFieldValues extends FieldValues = FieldValues>({
    label,
    acceptedExtensions = [".xlsx", ".xls", ".csv"],
    maxSizeMB = 5,
    helperText,
    error,
    required,
    optional,
    onChange,
    value,
    disabled,
    enableDocumentPreview = true,
    control,
    name,
    rules,
}: ExcelUploadProps<TFieldValues>) => {
    const [localFile, setLocalFile] = useState<File | null>(value || null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Sync local state with external value during render rather than in an effect — an
    // effect body would paint the previous file for one frame before resetting.
    const [renderedForValue, setRenderedForValue] = useState(value);
    if (value !== undefined && renderedForValue !== value) {
        setRenderedForValue(value);
        setLocalFile(value);
    }

    // Clear the preview during render (guarded by a sentinel) when `localFile` becomes null,
    // rather than inside the effect below — the effect still owns creating/revoking the
    // actual object URL for a non-null file, which is a genuine external-API side effect.
    const [renderedForLocalFile, setRenderedForLocalFile] = useState(localFile);
    if (renderedForLocalFile !== localFile) {
        setRenderedForLocalFile(localFile);
        if (!localFile) {
            setPreviewUrl(null);
        }
    }

    useEffect(() => {
        if (!localFile) {
            return;
        }
        const nextUrl = createObjectUrl(localFile);
        // Genuine external-system sync, not derivable state: `createObjectUrl` allocates a real
        // browser resource that must be paired with a `revokeObjectUrl` on cleanup/replacement —
        // exactly what effects exist for. The URL isn't known until this runs, so this setState
        // is necessary, not a derived-render calculation.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreviewUrl(nextUrl);
        return () => { revokeObjectUrl(nextUrl); };
    }, [localFile]);

    const validateFile = (file: File): { valid: boolean; error?: string } => {
        if (!isAcceptedFileType(file, acceptedExtensions.join(","))) {
            return {
                valid: false,
                error: `Please upload a valid file (${acceptedExtensions.join(", ")})`,
            };
        }
        if (!validateFileSize(file, maxSizeMB)) {
            return {
                valid: false,
                error: `File size must be less than ${maxSizeMB}MB`,
            };
        }
        return { valid: true };
    };

    const handleRemoveFile = (fieldOnChange?: (file: File | null) => void) => {
        setLocalFile(null);
        onChange?.(null);
        fieldOnChange?.(null);
    };

    const previewItems: UploadPreviewItem[] = useMemo(() => {
        if (!localFile) {return [];}
        return [{ file: localFile, url: previewUrl, isImage: isImageFile(localFile) }];
    }, [localFile, previewUrl]);

    const renderField = (
        fieldError?: string,
        fieldOnChange?: (file: File | null) => void
    ) => {
        const mergedError = fieldError ?? error;

        const fieldId = name ?? "excel-file";
        const supportsCsv = acceptedExtensions.some(
            (extension) => extension.toLowerCase() === ".csv"
        );
        const uploadTitle = supportsCsv ? "Choose Excel/CSV file" : "Choose Excel file";

        return (
            <div className="flex flex-col gap-1.5">
                <FormFieldLabel
                    htmlFor={fieldId}
                    label={label}
                    required={required}
                    optional={optional}
                    error={!!mergedError}
                />

                <div className="space-y-3">
                    {localFile ? (
                        <FileSelectedCard
                            file={localFile}
                            previewUrl={isImageFile(localFile) ? previewUrl : null}
                            disabled={disabled}
                            canPreview
                            onPreview={() => { setIsPreviewOpen(true); }}
                            onReplace={(files) => {
                                const next = files[0] ?? null;
                                if (!next) {return;}
                                const result = validateFile(next);
                                if (!result.valid) {
                                    showToast.error(result.error || "Invalid file");
                                    return;
                                }
                                setLocalFile(next);
                                onChange?.(next);
                                fieldOnChange?.(next);
                                showToast.success("File uploaded successfully!");
                            }}
                            onRemove={() => { handleRemoveFile(fieldOnChange); }}
                            replaceInputId={`${fieldId}-excel-replace`}
                            accept={acceptedExtensions.join(",")}
                        />
                    ) : (
                        <FileDropZone
                            id={`${fieldId}-excel-upload`}
                            title={uploadTitle}
                            description={`Supported: ${acceptedExtensions.join(", ")} · max ${formatMaxFileSizeLabel(maxSizeMB)}`}
                            accept={acceptedExtensions.join(",")}
                            disabled={disabled}
                            onFiles={(files) => {
                                const selected = files[0];
                                if (!selected) {return;}
                                const result = validateFile(selected);
                                if (!result.valid) {
                                    showToast.error(result.error || "Invalid file");
                                    return;
                                }
                                setLocalFile(selected);
                                onChange?.(selected);
                                fieldOnChange?.(selected);
                            }}
                        />
                    )}

                    {/* Helper Text */}
                    {helperText && !mergedError && (
                        <p
                            id={`${name}-helper`}
                            className="text-xs text-secondary-500 dark:text-secondary-400"
                        >
                            {helperText}
                        </p>
                    )}

                    {/* Default Helper if no custom helper */}
                    {!helperText && !mergedError && (
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            Supported formats: {acceptedExtensions.join(", ")} · max{" "}
                            {formatMaxFileSizeLabel(maxSizeMB)}
                        </p>
                    )}

                    {/* Error Message */}
                    {mergedError && (
                        <p
                            id={`${name}-error`}
                            className="text-xs text-danger-500"
                            role="alert"
                            aria-live="polite"
                        >
                            {mergedError}
                        </p>
                    )}
                </div>
                <FilePreviewModal
                    isOpen={isPreviewOpen}
                    items={previewItems}
                    currentIndex={0}
                    onClose={() => { setIsPreviewOpen(false); }}
                    onRemoveCurrent={() => {
                        handleRemoveFile(fieldOnChange);
                        setIsPreviewOpen(false);
                    }}
                    enableDocumentPreview={enableDocumentPreview}
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
                    renderField(fieldState.error?.message, field.onChange)
                }
            />
        );
    }

    return renderField(undefined, undefined);
};

export const ExcelUpload = React.memo(ExcelUploadInner) as typeof ExcelUploadInner;
