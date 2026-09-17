// Copyright (c) OptionC. All rights reserved.

namespace CFR.CommonService.Services
{
    public interface IFileHandlerService
    {
        /// <summary>
        /// Saves the file with a unique name in the given path.
        /// </summary>
        /// <param name="file">File to save</param>
        /// <param name="directoryPath">Path to save</param>
        /// <param name="fileName">Optional file name override</param>
        /// <returns>Full path of the file after saved</returns>
        string SaveUniqueFile(IFormFile file, string directoryPath, string? fileName = null);

        string SaveUniqueFile(MemoryStream stream, string directoryPath, string fileName, string fileExtension);

        bool DeleteFile(string directoryPath);

        string SaveFileWithOriginalName(IFormFile file, string directoryPath);

        string ReplaceFile(IFormFile file, string filePath);

        byte[]? GetFile(string directoryPath, string fileName);
    }

    public class FileHandlerService(IConfiguration configuration) : IFileHandlerService
    {
        private string GetGatewayRoot()
        {
            return configuration["ApplicationFilePath:Doc_BasePath"]
                ?? configuration["AppStrings:GatewayRoot"]
                ?? throw new InvalidOperationException("Base path is not configured in ApplicationFilePath:Doc_BasePath or AppStrings:GatewayRoot.");
        }

        /// <summary>
        /// Save the file with a unique name in the given path
        /// </summary>
        /// <param name="file">File to save</param>
        /// <param name="directoryPath">Path to save</param>
        /// <param name="fileName">Optional file name override</param>
        /// <returns>Full path of the file after saved</returns>
        /// <exception cref="ArgumentException"></exception>
        public string SaveUniqueFile(IFormFile file, string directoryPath, string? fileName = null)
        {
            string BasePath = Path.Combine(GetGatewayRoot(), directoryPath);

            if (file == null || string.IsNullOrEmpty(file.FileName) || file.Length == 0)
            {
                throw new ArgumentException("File is invalid.");
            }
            if (!Directory.Exists(BasePath))
            {
                _ = Directory.CreateDirectory(BasePath);
            }

            string fileExtension = Path.GetExtension(file.FileName);
            //var uniqueFileName = $"{Guid.NewGuid()}_{DateTime.Now:ddMMyyyy}{fileExtension}"; // Fix date format
            string uniqueFileName = !string.IsNullOrEmpty(fileName) ? $"{fileName}_{DateTime.Now:ddMMyyyy}{fileExtension}" : $"{Guid.NewGuid()}_{DateTime.Now:ddMMyyyy}{fileExtension}";
            string fullPath = Path.Combine(BasePath, uniqueFileName);

            using (var fileStream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(fileStream);
            }

            // Defense-in-depth against a 0-byte file ever being referenced by a caller: if the
            // copy somehow produced an empty file (disk full, client disconnect mid-upload, etc.),
            // fail loudly here rather than silently returning a path to a broken file that a
            // caller (e.g. EmailSettingsService) would otherwise persist as if the upload succeeded.
            var writtenInfo = new FileInfo(fullPath);
            if (!writtenInfo.Exists || writtenInfo.Length == 0)
            {
                if (writtenInfo.Exists)
                {
                    File.Delete(fullPath);
                }

                throw new IOException($"Uploaded file '{file.FileName}' was written as 0 bytes to '{fullPath}'.");
            }

            return fullPath;
        }

        public string SaveUniqueFile(MemoryStream stream, string directoryPath, string fileName, string fileExtension)
        {
            ArgumentNullException.ThrowIfNull(fileExtension);
            if (stream == null || stream.Length == 0)
            {
                throw new ArgumentException("Stream is invalid.");
            }

            string basePath = Path.Combine(GetGatewayRoot(), directoryPath);
            if (!Directory.Exists(basePath))
            {
                _ = Directory.CreateDirectory(basePath);
            }

            fileExtension = fileExtension.StartsWith('.') ? fileExtension : $".{fileExtension}";
            string uniqueFileName = !string.IsNullOrEmpty(fileName) ? $"{fileName}_{DateTime.Now:ddMMyyyy}{fileExtension}"
                                                                    : $"{Guid.NewGuid()}_{DateTime.Now:ddMMyyyy}{fileExtension}";

            string fullPath = Path.Combine(basePath, uniqueFileName);

            using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
            {
                stream.WriteTo(fileStream);
            }

            return fullPath;
        }

        public bool DeleteFile(string directoryPath)
        {
            bool result = false;
            string BasePath = Path.Combine(GetGatewayRoot(), directoryPath);

            if (directoryPath == null || string.IsNullOrEmpty(directoryPath))
            {
                throw new ArgumentException("File is invalid.");
            }
            if (File.Exists(BasePath))
            {
                File.Delete(BasePath);
                result = true;
            }
            return result;
        }

        public string SaveFileWithOriginalName(IFormFile file, string directoryPath)
        {
            string basePath = Path.Combine(GetGatewayRoot(), directoryPath);

            if (file == null || string.IsNullOrEmpty(file.FileName))
            {
                throw new ArgumentException("File is invalid.");
            }

            if (!Directory.Exists(basePath))
            {
                _ = Directory.CreateDirectory(basePath);
            }

            // Get original filename without extension
            string fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
            string fileExtension = Path.GetExtension(file.FileName);

            // Add timestamp to avoid duplicates
            string uniqueFileName = $"{fileNameWithoutExt}_{DateTime.Now:yyyyMMddHHmmss}{fileExtension}";
            string fullPath = Path.Combine(basePath, uniqueFileName);

            using (var fileStream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(fileStream);
            }

            // Return just the filename (not full path) if needed
            return uniqueFileName;
        }

        public string ReplaceFile(IFormFile file, string filePath)
        {
            string directoryPath = Path.GetDirectoryName(filePath) ?? string.Empty;
            string basePath = Path.Combine(GetGatewayRoot(), directoryPath);
            string fullPath = Path.Combine(basePath, Path.GetFileName(filePath));
            if (file == null || string.IsNullOrEmpty(file.FileName))
            {
                throw new ArgumentException("File is invalid.");
            }
            if (!Directory.Exists(basePath))
            {
                _ = Directory.CreateDirectory(basePath);
            }
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
            using (var fileStream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(fileStream);
            }
            return fullPath;
        }

        public byte[]? GetFile(string directoryPath, string fileName)
        {
            string basePath = Path.Combine(GetGatewayRoot(), directoryPath);
            string fullPath = Path.Combine(basePath, fileName);

            if (File.Exists(fullPath))
            {
                byte[] bytes = File.ReadAllBytes(fullPath);
                // A 0-byte file on disk is not a valid file to any caller - treat it the same as
                // "does not exist" so every caller's existing null-check already handles it,
                // instead of each one having to separately remember to also check Length.
                return bytes.Length == 0 ? null : bytes;
            }
            return null;
        }
    }
}