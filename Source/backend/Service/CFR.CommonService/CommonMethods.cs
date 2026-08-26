// Copyright (c) OptionC. All rights reserved.

using System.Linq.Expressions;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

using CFR.CommonService.Services;

using Microsoft.AspNetCore.Http;

using Newtonsoft.Json;

using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;

namespace CFR.CommonService
{
    public static class CommonMethods
    {
        // Example AES Key and _iv (You should generate and store them securely)
        private static readonly string _encryptionKey = "1a2b3c4d5e6f7a8B9c0d1E2f3a4b5c6D"; // 32 bytes for AES-256

        private static readonly string _iv = "5F4D3c2b1a0X9d8c"; // 16 bytes for AES-128
        private static readonly Random _random = new(); // Random number generator
        private static readonly TimeZoneInfo _istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");

        /// <summary>
        /// Serializes the object.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="objectValue">The object value.</param>
        /// <returns></returns>
        public static string SerializeObject<T>(T objectValue)
        {
            return JsonConvert.SerializeObject(objectValue);
        }

        /// <summary>
        /// Deserializes the string to intended object.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="objectValue">The object value.</param>
        /// <returns>Serialized target object</returns>
        public static T? DeserializeObject<T>(string? objectValue)
        {
            if (string.IsNullOrEmpty(objectValue))
            {
                return default; // Returns null for reference types or default value for value types
            }

            return JsonConvert.DeserializeObject<T>(objectValue);
        }

        // Convert to Base64Url (for safe URL transmission)
        public static string ToBase64Url(string base64)
        {
            ArgumentNullException.ThrowIfNull(base64);
            //The characters ==> { ?, &, #, and % } are not part of the Base64 character set by design.
            return base64.Replace('+', '-').Replace('/', '_').Replace("=", "");
        }

        public static string EncryptValue(string plainText)
        {
            using var aesAlg = Aes.Create();
            aesAlg.Key = Encoding.UTF8.GetBytes(_encryptionKey); // Ensure 32 bytes (256-bit key)
            aesAlg.IV = Encoding.UTF8.GetBytes(_iv); // Ensure 16 bytes _iv

            var encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);
            using var msEncrypt = new MemoryStream();
            using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
            using (var swEncrypt = new StreamWriter(csEncrypt))
            {
                swEncrypt.Write(plainText);
            }
            // Convert to Base64 string, then apply Base64Url encoding
            string base64 = Convert.ToBase64String(msEncrypt.ToArray());
            return ToBase64Url(base64); // Apply Base64Url encoding
        }

        // Convert back from Base64Url to Base64
        public static string FromBase64Url(string base64Url)
        {
            ArgumentNullException.ThrowIfNull(base64Url);
            base64Url = base64Url.Replace('-', '+').Replace('_', '/');
            return string.Concat(base64Url, "==".AsSpan(0, (4 - (base64Url.Length % 4)) % 4)); // Padding to correct length
        }

        /// <summary>
        /// accepts an encrypted string and returns the string as plain text
        /// </summary>
        /// <param name="base64UrlCipherText"></param>
        /// <returns></returns>
        /// <remarks></remarks>
        public static string DecryptValue(string base64UrlCipherText)
        {
            if (string.IsNullOrEmpty(base64UrlCipherText))
            {
                return "0";
            }
            try
            {
                // Convert from Base64Url to Base64
                string base64CipherText = FromBase64Url(base64UrlCipherText);

                using var aesAlg = Aes.Create();
                aesAlg.Key = Encoding.UTF8.GetBytes(_encryptionKey); // Ensure 32 bytes (256-bit key)
                aesAlg.IV = Encoding.UTF8.GetBytes(_iv); // Ensure 16 bytes _iv

                var decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
                using var msDecrypt = new MemoryStream(Convert.FromBase64String(base64CipherText)); // Convert Base64 back to byte array
                using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
                using var srDecrypt = new StreamReader(csDecrypt);
                return srDecrypt.ReadToEnd(); // Return decrypted plaintext
            }
            catch (Exception)
            {
                return "0";
            }
        }

        public static string ReadFile(string path)
        {
            string fileData = string.Empty;

            if (File.Exists(path))
            {
                fileData = File.ReadAllText(path);
            }

            return fileData;
        }

        public static byte[] ExportToExcelWithDataType(DataTable dtInput, DataTable dtHeader, bool autoSize = true)
        {
            using var workbook = new XSSFWorkbook();
            var sheet = workbook.CreateSheet("Sheet1");
            var headerRow = sheet.CreateRow(0);

            // Create header style
            var headerStyle = workbook.CreateCellStyle();
            var font = workbook.CreateFont();
            font.IsBold = true;
            headerStyle.SetFont(font);

            // Write Headers
            if (dtHeader != null && dtHeader.Rows.Count > 0)
            {
                for (int i = 0; i < dtHeader.Rows.Count; i++)
                {
                    var cell = headerRow.CreateCell(i);
                    _ = cell.SetCellValue(Convert.ToString(dtHeader.Rows[i]["Header"]));
                    cell.CellStyle = headerStyle;
                }
            }

            // Write Data
            if (dtInput != null && dtInput.Rows.Count > 0)
            {
                for (int i = 0; i < dtInput.Rows.Count; i++)
                {
                    var dataRow = sheet.CreateRow(i + 1);
                    for (int j = 0; j < dtInput.Columns.Count; j++)
                    {
                        var cell = dataRow.CreateCell(j);
                        object val = dtInput.Rows[i][j];

                        if (val == DBNull.Value || val == null)
                        {
                            _ = cell.SetBlank();
                        }
                        else
                        {
                            switch (Type.GetTypeCode(dtInput.Columns[j].DataType))
                            {
                                case TypeCode.Int16:
                                case TypeCode.Int32:
                                case TypeCode.Int64:
                                case TypeCode.UInt16:
                                case TypeCode.UInt32:
                                case TypeCode.UInt64:
                                case TypeCode.Byte:
                                case TypeCode.SByte:
                                case TypeCode.Decimal:
                                case TypeCode.Double:
                                case TypeCode.Single:
                                    _ = cell.SetCellValue(Convert.ToDouble(val));
                                    break;
                                case TypeCode.DateTime:
                                    _ = cell.SetCellValue(Convert.ToDateTime(val));
                                    break;
                                case TypeCode.Boolean:
                                    _ = cell.SetCellValue(Convert.ToBoolean(val));
                                    break;
                                case TypeCode.Empty:
                                    break;
                                case TypeCode.Object:
                                    break;
                                case TypeCode.DBNull:
                                    break;
                                case TypeCode.Char:
                                    break;
                                case TypeCode.String:
                                    break;
                                default:
                                    _ = cell.SetCellValue(Convert.ToString(val));
                                    break;
                            }
                        }
                    }
                }
            }

            if (autoSize && dtHeader != null)
            {
                for (int i = 0; i < dtHeader.Rows.Count; i++)
                {
                    try
                    {
                        sheet.AutoSizeColumn(i);
                    }
                    catch
                    {
                        int maxLength = 0;
                        for (int r = 0; r <= sheet.LastRowNum; r++)
                        {
                            var cell = sheet.GetRow(r)?.GetCell(i);
                            if (cell != null)
                            {
                                string cellText = cell.ToString() ?? "";
                                if (cellText.Length > maxLength)
                                {
                                    maxLength = cellText.Length;
                                }
                            }
                        }

                        if (maxLength < 8)
                        {
                            maxLength = 8;     // Minimum width
                        }

                        if (maxLength > 100)
                        {
                            maxLength = 100; // Maximum width cap
                        }

                        sheet.SetColumnWidth(i, (maxLength + 3) * 256); // Add padding
                    }
                }
            }

            using var ms = new MemoryStream();
            workbook.Write(ms);
            return ms.ToArray();
        }

        public static DataTable ToDataTable(IEnumerable<dynamic> items)
        {
            var dataTable = new DataTable();
            if (items == null)
            {
                return dataTable;
            }

            foreach (var item in items)
            {
                if (item is not IDictionary<string, object> dict)
                {
                    continue;
                }

                if (dataTable.Columns.Count == 0)
                {
                    foreach (var kvp in dict)
                    {
                        _ = dataTable.Columns.Add(
                            kvp.Key,
                            kvp.Value?.GetType() ?? typeof(string));
                    }
                }

                var row = dataTable.NewRow();
                foreach (var kvp in dict)
                {
                    row[kvp.Key] = kvp.Value ?? DBNull.Value;
                }
                dataTable.Rows.Add(row);
            }

            return dataTable;
        }
        public static string GenerateLicenseKey(int totalLength = 25, int segmentLength = 5)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            string newKey;
            int numberOfSegments = (totalLength + 1) / (segmentLength + 1); // Calculate the number of segments

            newKey = string.Join("-", Enumerable.Range(0, numberOfSegments)
                .Select(_ => new string([.. Enumerable.Repeat(chars, segmentLength).Select(s => s[_random.Next(s.Length)])])));

            return newKey;
        }

        /// <summary>
        /// To generate unique File name
        /// </summary>
        /// <param name="fileExtension">File extention</param>
        /// <returns>generated file name</returns>
        public static string GenerateUniqueFileName(string fileExtension)
        {
            string uniqueFileName = Guid.NewGuid().ToString();
            string timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            return $"{uniqueFileName}_{timestamp}{fileExtension}";
        }

        /// <summary>
        /// To Generate _random OTP
        /// </summary>
        /// <param name="digits">Number of digits to generate</param>
        /// <returns>OTP as string</returns>
        /// <exception cref="ArgumentException">the number of digits must be greater than 0</exception>
        public static string GenerateOTP(int digits)
        {
            if (digits <= 0)
            {
                throw new ArgumentException("The number of digits must be greater than 0.", nameof(digits));
            }
            var rng = RandomNumberGenerator.Create();
            byte[] _randomNumber = new byte[4];
            rng.GetBytes(_randomNumber);
            int otp = Math.Abs(BitConverter.ToInt32(_randomNumber, 0));
            int maxValue = (int)Math.Pow(10, digits);
            otp %= maxValue;
            return otp.ToString($"D{digits}");
        }

        public static string GetRandomNumber()
        {
            char[] chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".ToCharArray();
            var password = new StringBuilder();  // Use StringBuilder for better performance
            var _random = new Random();

            while (password.Length < 8)
            {
                int x = _random.Next(0, chars.Length); // Change 1 to 0 to include first character
                string character = chars[x].ToString();

                if (!password.ToString().Contains(character))  // Convert StringBuilder to string
                {
                    _ = password.Append(character);  // Append character instead of string concatenation
                }
            }

            return password.ToString();
        }

        /// <summary>
        /// Get Active Status for nullable boolean.
        /// </summary>
        /// <param name="status">The status as a nullable boolean.</param>
        /// <returns>Returns "Active" if true, "Inactive" if false, and "Unknown" if null.</returns>
        public static string GetActiveStatus(bool? status)
        {
            if (status.HasValue)
            {
                return status.Value ? "Active" : "Inactive";
            }
            else
            {
                return "Unknown";
            }
        }

        /// <summary>
        /// Converts DateTime DOB to string format
        /// </summary>
        /// <param name="birthDate"></param>
        /// <returns>returns age</returns>
        public static string ConvertDateTimeToAge(DateTime? birthDate)
        {
            if (birthDate == null)
            {
                return string.Empty;
            }

            var currentDate = DateTime.Today;

            int years = currentDate.Year - birthDate.Value.Year;
            int months = currentDate.Month - birthDate.Value.Month;
            int days = currentDate.Day - birthDate.Value.Day;

            // Adjust for negative months or days
            if (months < 0 || (months == 0 && days < 0))
            {
                years--;
                months = (months + 12) % 12;
                days += DateTime.DaysInMonth(currentDate.Year, currentDate.Month);
            }

            return $"{years}Y {Math.Abs(months)}M {Math.Abs(days)}D";
        }

        /// <summary>
        /// Converts DateTime DOB to string format
        /// </summary>
        /// <param name="birthDate">date of birth</param>
        /// <param name="isSingleLetter">Letter</param>
        /// <returns>returns age</returns>
        public static string ConvertDateTimeToAge(DateTime? birthDate, bool isSingleLetter = false)
        {
            if (birthDate == null)
            {
                return string.Empty;
            }

            var currentDate = DateTime.Today;

            int years = currentDate.Year - birthDate.Value.Year;
            int months = currentDate.Month - birthDate.Value.Month;
            int days = currentDate.Day - birthDate.Value.Day;

            // Adjust for negative months or days
            if (months < 0 || (months == 0 && days < 0))
            {
                years--;
                months = (months + 12) % 12;
                days += DateTime.DaysInMonth(currentDate.Year, currentDate.Month);
            }

            return isSingleLetter ? $"{years}Y {Math.Abs(months)}M {Math.Abs(days)}D" : $"{years} Years {Math.Abs(months)} Months {Math.Abs(days)} Days";
        }

        public static int CalculateAge(DateTime birthDate)
        {
            var currentDate = DateTime.Now;
            int age = currentDate.Year - birthDate.Year;

            // If the birthdate hasn't occurred yet this year, subtract 1 from the age
            if (currentDate.Month < birthDate.Month || (currentDate.Month == birthDate.Month && currentDate.Day < birthDate.Day))
            {
                age--;
            }

            return age;
        }
        public static async Task<string> SaveFileAsync(IFormFile file, params string[] paths)
        {
            ArgumentNullException.ThrowIfNull(paths);
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty");
            }
            string? basePath = SISSessionRepository.Configuration?.ApplicationFilePath?.Doc_BasePath;

            if (string.IsNullOrEmpty(basePath))
            {
                throw new InvalidOperationException("Base path not configured");
            }
            // Build folder path
            string folderPath = basePath;
            foreach (string path in paths)
            {
                folderPath = Path.Combine(folderPath, path);
            }

            if (!Directory.Exists(folderPath))
            {
                _ = Directory.CreateDirectory(folderPath);
            }
            // ✅ Unique file name
            string extension = Path.GetExtension(file.FileName);
            string originalName = Path.GetFileNameWithoutExtension(file.FileName);
            string dateTime = DateTime.Now.ToString("yyyyMMdd_HHmmss");

            string uniqueFileName = $"{originalName}_{dateTime}{extension}";

            string fullPath = Path.Combine(folderPath, uniqueFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            // Return relative or full path as needed
            return uniqueFileName;
        }
        public static string GetNextLetterCombination(string current)
        {
            ArgumentNullException.ThrowIfNull(current);
            char firstChar = current[0];
            char secondChar = current[1];

            if (secondChar == 'Z')
            {
                if (firstChar == 'Z')
                {
                    return "AA"; // Reset to "AA" after "ZZ"
                }
                else
                {
                    return $"{(char)(firstChar + 1)}A"; // Increment first character and reset second to "A"
                }
            }
            else
            {
                return $"{firstChar}{(char)(secondChar + 1)}"; // Increment second character
            }
        }

        public static string ConvertDateTimeToAgeYear(DateTime? birthDate)
        {
            if (birthDate == null)
            {
                return string.Empty;
            }

            var currentDate = DateTime.Today;

            int years = currentDate.Year - birthDate.Value.Year;
            int months = currentDate.Month - birthDate.Value.Month;
            int days = currentDate.Day - birthDate.Value.Day;

            // Adjust for negative months or days
            if (months < 0 || (months == 0 && days < 0))
            {
                years--;
                months = (months + 12) % 12;
                days += DateTime.DaysInMonth(currentDate.Year, currentDate.Month);
            }

            return $"{years}";
        }

        /// <summary>
        /// Combines a given date and time (assumed to be IST) and converts it to UTC.
        /// </summary>
        /// <param name="date">The date part (IST)</param>
        /// <param name="time">The time part (IST). Defaults to 00:00:00 if null for FromDate, 23:59:59 if null for ToDate.</param>
        /// <param name="isEndOfDay">If true, defaults time to 23:59:59; else 00:00:00.</param>
        public static DateTime? CombineToUtc(DateTime? date, TimeOnly? time = null, bool isEndOfDay = false)
        {
            if (date == null)
            {
                return null;
            }
            var dateOnly = date?.Date; // set time as 00:00:00
            var defaultTime = time ?? (isEndOfDay ? new TimeOnly(23, 59, 59) : new TimeOnly(0, 0, 0));
            var istDateTime = dateOnly != null ? dateOnly.Value.Add(defaultTime.ToTimeSpan()) : DateTime.UtcNow.Date;

            // Convert IST → UTC
            return TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(istDateTime, DateTimeKind.Unspecified), _istZone);
        }

        public static string CheckMobileNumberFormat(string mobile)
        {
            ArgumentNullException.ThrowIfNull(mobile);
            string tmpMobile = mobile.Trim();

            if (tmpMobile.Length is > 13 or < 10)
            {
                throw new ArgumentException("The mobile number format is wrong either should be +918888888888 (or) 8888888888 (or) 918888888888.");
            }

            if (tmpMobile.Length == 10)
            {
                return "+91" + tmpMobile;
            }

            return tmpMobile;
        }

        public static string AgeOfPatientInHospitalFormat(int? ageYears, int? ageMonths, int? ageDays)
        {
            return $"{ageYears ?? 0}Y {ageMonths ?? 0}M {ageDays ?? 0}D";
        }

        public static string AgeOfPatientInHospitalFormat(DateTime? birthDateUtc)
        {
            if (birthDateUtc == null)
            {
                return string.Empty;
            }

            var birth = birthDateUtc.Value;
            var now = DateTime.UtcNow;

            if (birth > now)
            {
                return string.Empty;
            }

            int years = now.Year - birth.Year;
            int months = now.Month - birth.Month;
            int days = now.Day - birth.Day;

            // Fix negative days by borrowing from previous month
            if (days < 0)
            {
                var prevMonth = now.AddMonths(-1);
                days += DateTime.DaysInMonth(prevMonth.Year, prevMonth.Month);
                months--;
            }

            // Fix negative months by borrowing a year
            if (months < 0)
            {
                months += 12;
                years--;
            }

            return AgeOfPatientInHospitalFormat(years, months, days);
        }

        /// <summary>
        /// Generates a _random password
        /// </summary>
        /// <param name="length"></param>
        /// <returns></returns>
        public static string GetRandomPassword(int length = 12)
        {
            const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lower = "abcdefghijklmnopqrstuvwxyz";
            const string digits = "0123456789";
            const string special = "!@#$%^&*()-_=+<>?";

            string allChars = upper + lower + digits + special;

            var _random = new Random();
            var password = new StringBuilder();

            // Ensure at least one from each category
            _ = password.Append(upper[_random.Next(upper.Length)]);
            _ = password.Append(lower[_random.Next(lower.Length)]);
            _ = password.Append(digits[_random.Next(digits.Length)]);
            _ = password.Append(special[_random.Next(special.Length)]);

            // Fill remaining length
            for (int i = password.Length; i < length; i++)
            {
                _ = password.Append(allChars[_random.Next(allChars.Length)]);
            }

            // Shuffle password
            return new string([.. password.ToString().OrderBy(x => _random.Next())]);
        }

        public static string GetPatientGender(int? gender)
        {
            gender ??= 0;

            return gender switch
            {
                1 => "Male",
                2 => "Female",
                _ => "UnKnown"
            };
        }

        public static void FileCopy(string sourcefolder, string destinationfolder, string filename)
        {
            string fileName = filename;
            string sourcePath = sourcefolder;
            string targetPath = destinationfolder;

            // Use Path class to manipulate file and directory paths.
            string sourceFile = Path.Combine(sourcePath, fileName);
            string destFile = Path.Combine(targetPath, fileName);

            // To copy a folder's contents to a new location:
            // Create a new target folder.
            // If the directory already exists, this method does not create a new directory.
            _ = Directory.CreateDirectory(targetPath);

            if (File.Exists(sourceFile))
            {
                // To copy a file to another location and
                // overwrite the destination file if it already exists.
                File.Copy(sourceFile, destFile, true);
                File.SetAttributes(destFile, FileAttributes.Normal);
            }

        }
        public static class ObjectStringTrimmer
        {
            // cache of compiled actions per Type
            private static readonly ConcurrentDictionary<Type, Action<object>> _cache = new();

            public static void TrimAllStrings(object obj)
            {
                if (obj == null)
                {
                    return;
                }

                var type = obj.GetType();
                var action = _cache.GetOrAdd(type, CreateTrimAction);
                action(obj);
            }

            private static Action<object> CreateTrimAction(Type type)
            {
                var param = Expression.Parameter(typeof(object), "obj");
                var casted = Expression.Variable(type, "typedObj");
                var assigns = new List<Expression>
        {
            Expression.Assign(casted, Expression.Convert(param, type))
        };

                // Generate expressions for each writable string property
                foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                             .Where(p => p.CanRead && p.CanWrite && p.PropertyType == typeof(string)))
                {
                    var propExp = Expression.Property(casted, prop);
                    var assignTrim = Expression.Assign(
                        propExp,
                        Expression.Condition(
                            Expression.Equal(propExp, Expression.Constant(null, typeof(string))),
                            Expression.Constant(null, typeof(string)),
                            Expression.Call(propExp, nameof(string.Trim), Type.EmptyTypes)
                        )
                    );

                    assigns.Add(assignTrim);
                }
                var body = Expression.Block([casted], assigns);
                return Expression.Lambda<Action<object>>(body, param).Compile();
            }
        }

        public static string[] SplitCsvRow(string row)
        {
            ArgumentNullException.ThrowIfNull(row);
            var result = new List<string>();
            bool inQuotes = false;
            var current = new StringBuilder();
            for (int i = 0; i < row.Length; i++)
            {
                char c = row[i];
                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    result.Add(current.ToString().Trim(' ', '"', '\r'));
                    _ = current.Clear();
                }
                else
                {
                    _ = current.Append(c);
                }
            }
            result.Add(current.ToString().Trim(' ', '"', '\r'));
            return [.. result];
        }

        public static string CleanTerraNovaColumnName(string columnName)
        {
            if (string.IsNullOrEmpty(columnName))
            {
                return string.Empty;
            }

            columnName = columnName.Trim();
            if (columnName == "Terranova Form")
            {
                return "Form";
            }
            if (columnName == "Terranova Level")
            {
                return "Level";
            }
            if (columnName == "Total Battery -  National Percentile")
            {
                return "TotalScoreNationalPercentile";
            }
            if (columnName == "Total Battery -  Normal Curve Equivalent")
            {
                return "TotalScoreNormalCurveEquivalent";
            }
            if (columnName == "Total Inview - Cognitive Skills Index")
            {
                return "CognitiveSkillsIndexCognitiveSkillsIndex";
            }
            if (columnName == "Total Inview - Cognitive Skills Index Lower Bound")
            {
                return "CognitiveSkillsIndexCognitiveSkillsIndex";
            }

            columnName = columnName.Replace("(InView)", "");
            return new string([.. columnName.Where(char.IsLetter)]);
        }

        public static DataTable CreateTerraNovaStagingDataTable(int schoolId)
        {
            var dt = new DataTable();
            dt.Columns.AddRange([
                new("LastName", typeof(string)),
                new("FirstName", typeof(string)),
                new("StudentID", typeof(string)),
                new("TestDate", typeof(string)),
                new("Grade", typeof(string)),
                new("Form", typeof(string)),
                new("Level", typeof(string)),
                new("ReadingNormalCurveEquivalent", typeof(int)),
                new("ReadingNationalPercentile", typeof(int)),
                new("ReadingAnticipatedAchievementNationalPercentile", typeof(int)),
                new("ReadingObjectivesMasteryScore", typeof(int)),
                new("ReadingSignificantDifference", typeof(string)),
                new("LanguageNormalCurveEquivalent", typeof(int)),
                new("LanguageNationalPercentile", typeof(int)),
                new("LanguageAnticipatedAchievementNationalPercentile", typeof(int)),
                new("LanguageObjectivesMasteryScore", typeof(int)),
                new("LanguageSignificantDifference", typeof(string)),
                new("MathematicsNormalCurveEquivalent", typeof(int)),
                new("MathematicsNationalPercentile", typeof(int)),
                new("MathematicsAnticipatedAchievementNationalPercentile", typeof(int)),
                new("MathematicsObjectivesMasteryScore", typeof(int)),
                new("MathematicsSignificantDifference", typeof(string)),
                new("TotalScoreNormalCurveEquivalent", typeof(int)),
                new("TotalScoreNationalPercentile", typeof(int)),
                new("TotalScoreAnticipatedAchievementNationalPercentile", typeof(int)),
                new("TotalScoreSignificantDifference", typeof(string)),
                new("ScienceNormalCurveEquivalent", typeof(int)),
                new("ScienceNationalPercentile", typeof(int)),
                new("ScienceAnticipatedAchievementNationalPercentile", typeof(int)),
                new("ScienceObjectivesMasteryScore", typeof(int)),
                new("ScienceSignificantDifference", typeof(string)),
                new("SocialStudiesNormalCurveEquivalent", typeof(int)),
                new("SocialStudiesNationalPercentile", typeof(int)),
                new("SocialStudiesAnticipatedAchievementNationalPercentile", typeof(int)),
                new("SocialStudiesObjectivesMasteryScore", typeof(int)),
                new("SocialStudiesSignificantDifference", typeof(string)),
                new("QuantitativeReasoningNationalPercentilebyGrade", typeof(int)),
                new("TotalNonVerbalScoreNationalPercentilebyGrade", typeof(int)),
                new("TotalVerbalScoreNationalPercentilebyGrade", typeof(int)),
                new("TotalScoreNationalPercentilebyGrade", typeof(int)),
                new("CognitiveSkillsIndexCognitiveSkillsIndex", typeof(int))
            ]);

            var orgCol = new DataColumn("OrganizationID", typeof(int))
            {
                AllowDBNull = false,
                DefaultValue = schoolId
            };
            dt.Columns.Add(orgCol);

            return dt;
        }

        public static string GetCellValue(ICell? cell)
        {
            if (cell == null)
            {
                return string.Empty;
            }

            switch (cell.CellType)
            {
                case CellType.Numeric:
                    if (DateUtil.IsCellDateFormatted(cell))
                    {
                        return cell.DateCellValue?.ToString("yyyy-MM-dd") ?? string.Empty;
                    }
                    return cell.NumericCellValue.ToString();
                case CellType.Boolean:
                    return cell.BooleanCellValue.ToString();
                case CellType.Formula:
                    try
                    {
                        return cell.StringCellValue ?? string.Empty;
                    }
                    catch
                    {
                        return cell.NumericCellValue.ToString();
                    }

                case CellType._None:
                    return string.Empty;
                case CellType.String:
                    return cell.StringCellValue?.Trim() ?? string.Empty;
                case CellType.Blank:
                    return string.Empty;
                case CellType.Error:
                    return string.Empty;
                default:
                    return cell.StringCellValue?.Trim() ?? string.Empty;
            }
        }
    }

    public static partial class TemplateKeyExtractor
    {
        [GeneratedRegex("\"([^\"]*)\"")]
        private static partial Regex QuotedValueRegex();

        public static List<string> ExtractTemplateKeys(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new();
            }

            return
            [
                .. QuotedValueRegex()
                .Matches(input)
                .Select(m => m.Groups[1].Value)
                .Where(v => !string.IsNullOrWhiteSpace(v))
            ];
        }
    }
}
