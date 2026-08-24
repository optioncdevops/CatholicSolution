import { FileUpload } from "./FileUpload";
import {
  FILE_UPLOAD_TYPES,
  formatFileUploadHelperText,
} from "./fileUpload/fileUpload.utils";

interface DetailedFileUploadProps {
  label?: string;
  disabled?: boolean;
  onFileChange?: (file: File | null) => void;
  previewable?: boolean;
  removable?: boolean;
  replaceable?: boolean;
}

export const DetailedFileUpload = ({
  label = "File Upload with Details",
  disabled,
  onFileChange,
  previewable = true,
  removable = true,
  replaceable = true,
}: DetailedFileUploadProps) => {
  return (
    <FileUpload
      label={label}
      disabled={disabled}
      onFileChange={onFileChange}
      variant="file"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
      maxSizeMB={10}
      helperText={formatFileUploadHelperText({
        fileTypes: FILE_UPLOAD_TYPES.pdfDocXls,
        maxSizeMB: 10,
      })}
      previewable={previewable}
      removable={removable}
      replaceable={replaceable}
      enableDocumentPreview
    />
  );
};
