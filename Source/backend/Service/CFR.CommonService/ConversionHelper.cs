// Copyright (c) OptionC. All rights reserved.

using System.Globalization;

using Microsoft.AspNetCore.Http;

using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
namespace CFR.CommonService
{
    public static class ConversionHelper
    {
        public static string FormatSQL(string objString)
        {
            return string.IsNullOrEmpty(objString) ? "NULL" : "'" + objString + "'";
        }

        public static DateTime ConvertUtcToIst(DateTime? utcDateTime)
        {
            if (!utcDateTime.HasValue)
            {
                throw new ArgumentNullException(nameof(utcDateTime), "UTC DateTime cannot be null.");
            }

            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime.Value, istTimeZone);
            return istDateTime;
        }

        public static string? ToString(object objString)
        {
            return objString != null ? Convert.ToString(objString) : string.Empty;
        }

        public static string ToDate(string sSource)
        {
            string sDest = string.Empty;

            try
            {
                if (DateTime.TryParseExact(sSource, "dd-MM-yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dtValue))
                {
                    sDest = dtValue.ToString("MM/dd/yyyy", CultureInfo.InvariantCulture);
                }
                else
                {
                    // Handle parsing failure, if necessary.
                    // In this example, I'll return an empty string for parsing failure.
                }
            }
            catch (Exception)
            {
            }

            return sDest;
        }

        public static string TosqlDatetime(object objDate)
        {
            string sDest = string.Empty;

            if (objDate != null)
            {
                if (DateTime.TryParseExact(objDate.ToString(), "dd-MM-yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dtValue))
                {
                    sDest = dtValue.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
                }
            }
            return sDest;
        }

        public static string TosqlDate(object objDate)
        {
            string sDest = string.Empty;

            if (objDate != null)
            {
                if (DateTime.TryParseExact(objDate.ToString(), "dd-MM-yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dtValue))
                {
                    sDest = dtValue.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
                }
                if (DateTime.TryParseExact(objDate.ToString(), "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dtValue1))
                {
                    sDest = dtValue1.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
                }
                if (DateTime.TryParseExact(objDate.ToString(), "dd-MM-yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dtValue2))
                {
                    sDest = dtValue2.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
                }
            }
            return sDest;
        }

        public static DateTime ToDateTime(string sSource, string dateFormat = "MM/dd/yyyy")
        {
            var dtValue = DateTime.Now; // Default value if parsing fails or input is null.
            if (!string.IsNullOrEmpty(sSource))
            {
                if (DateTime.TryParseExact(sSource, dateFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out dtValue))
                {
                    // Parsing successful; dtValue now holds the parsed DateTime.
                }
            }
            return dtValue;
        }

        public static DateTime ToDateTime(string sSource)
        {
            if (DateTime.TryParse(sSource, out var dtValue))
            {
                return dtValue; // Parsing was successful; return the parsed DateTime.
            }
            return DateTime.Now;
        }

        public static DateTime ToDateTime(object objDate)
        {
            if (objDate == null)
            {
                throw new ArgumentNullException(nameof(objDate), "Input object cannot be null.");
            }

            if (objDate is DateTime dateValue)
            {
                return dateValue; // If the object is already a DateTime, return it directly.
            }

            if (DateTime.TryParse(objDate.ToString(), out var dtValue))
            {
                return dtValue;
            }
            return DateTime.Now;
        }

        /// <summary>
        /// this method is used to return Null if object value is empty -- 03/16/2020
        /// </summary>
        /// <param name="objDate"></param>
        /// <returns></returns>
        public static DateTime? ToDateTimeNull(object objDate)
        {
            if (DateTime.TryParse(ToString(objDate), out var dtValue))
            {
                return dtValue;
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="sSource"></param>
        /// <returns></returns>
        public static short ToInt16(string sSource)
        {
            if (short.TryParse(sSource, out short iValue))
            {
                return iValue;
            }
            return 0;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="objSource"></param>
        /// <returns></returns>
        public static short ToInt16(object objSource)
        {
            if (objSource != null && short.TryParse((string?)objSource, out short iValue))
            {
                return iValue;
            }
            return 0;
        }

        public static int ToInt32(string sSource)
        {
            if (int.TryParse(sSource, out int iValue))
            {
                return iValue;
            }
            return 0;
        }

        public static int ToInt32(object sSource)
        {
            if (sSource != null && int.TryParse((string?)sSource, out int iValue))
            {
                return iValue;
            }
            return 0;
        }

        public static long ToInt64(object objSource)
        {
            if (long.TryParse(objSource?.ToString(), out long iValue))
            {
                return iValue;
            }
            return 0;
        }

        public static int ToInteger(string sSource)
        {
            if (int.TryParse(sSource, out int iValue))
            {
                return iValue;
            }
            return 0;
        }

        public static int ToInteger(object objSource)
        {
            if (int.TryParse(objSource?.ToString(), out int iValue))
            {
                return iValue;
            }
            return 0;
        }

        public static int ToInteger(bool istrue)
        {
            return istrue ? 1 : 0;
        }

        public static decimal ToDecimal(string sSource)
        {
            if (decimal.TryParse(sSource?.ToString(), out decimal iValue))
            {
                return iValue;
            }
            return 0;
        }

        public static decimal ToDecimal(object obj)
        {
            if (decimal.TryParse(obj?.ToString(), out decimal result))
            {
                return result;
            }
            return 0.0M;
        }

        public static double ToDouble(string sSource)
        {
            return double.TryParse(sSource, out double result) ? result : 0.0;
        }

        public static double ToDouble(object obj)
        {
            return double.TryParse(obj?.ToString(), out double result) ? result : 0.0;
        }

        public static float ToFloat(string sSource)
        {
            return float.TryParse(sSource, out float result) ? result : 0.0f;
        }

        public static float ToFloat(object obj)
        {
            return float.TryParse(obj?.ToString(), out float result) ? result : 0.0f;
        }

        public static bool ToBoolean(string sSource)
        {
            return bool.TryParse(sSource, out bool result) && result;
        }

        public static bool ToBoolean(object obj)
        {
            return bool.TryParse(obj?.ToString(), out bool result) && result;
        }

        public static string ToStringF2<T>(T? value) where T : struct, IFormattable
        {
            return value?.ToString("F2", CultureInfo.InvariantCulture) ?? "0.00";
        }

        public static string ToIndianFormat(decimal amount)
        {
            var hindi = new CultureInfo("hi-IN");
            return string.Format(hindi, "{0:N2}", amount);
        }

        public static DateTime CustomParseDatetime(string dateString)
        {
            string format = "MM/dd/yyyy h:mm:ss.fff tt";
            var parsedDate = new DateTime();
            try
            {
                parsedDate = DateTime.ParseExact(dateString, format, null, DateTimeStyles.None);
            }
            catch (Exception)
            {
            }

            return parsedDate;
        }

        /// <summary>
        /// Parses a date string to a DateTime object using exact formats.
        /// </summary>
        /// <param name="dateString">The date string to parse.</param>
        /// <returns>A DateTime object parsed from the string.</returns>
        /// <exception cref="ArgumentException">Thrown when the date format is invalid.</exception>
        public static DateTime ParseExactDate(string dateString)
        {
            try
            {
                // Define possible formats
                string[] formats = ["yyyy-MM-dd", "dd/MM/yyyy"];
                // Specify the exact format to parse
                return DateTime.ParseExact(dateString, formats, CultureInfo.InvariantCulture);
            }
            catch (FormatException)
            {
                throw new ArgumentException($"Invalid date format. Input: {dateString}");
            }
        }

        public static string FormatDateWithoutTime(string inputDate)
        {
            // Array of possible input date formats
            string[] formats = ["dd-MM-yyyy HH:mm:ss", "yyyy-MM-dd HH:mm:ss", "MM/dd/yyyy HH:mm:ss"];

            // Parse the input date string to DateTime using multiple formats
            var parsedDate = DateTime.ParseExact(inputDate, formats, CultureInfo.InvariantCulture, DateTimeStyles.None);

            // Format the DateTime without time component to "dd/MM/yyyy" format
            return parsedDate.ToString("dd/MM/yyyy");
        }

        public static string FormatDate(DateTime? dateTime)
        {
            if (dateTime == null)
            {
                return string.Empty;
            }
            // Convert UTC to IST
            var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istTime = TimeZoneInfo.ConvertTimeFromUtc(dateTime ?? DateTime.Now, istZone);
            return $"{istTime.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture)}";
        }

        public static string FormatTime(TimeOnly? time)
        {
            if (!time.HasValue)
            {
                return string.Empty;
            }

            return time.Value.ToString("hh:mm tt", CultureInfo.InvariantCulture);
        }

        public static string FormatDatewithMonth(DateTime? dateTime)
        {
            if (dateTime == null)
            {
                return string.Empty;
            }
            // Convert UTC to IST
            var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istTime = TimeZoneInfo.ConvertTimeFromUtc(dateTime ?? DateTime.Now, istZone);
            return $"{istTime.ToString("dd-MMMM yyyy", CultureInfo.InvariantCulture)}";
        }

        public static string FormatDateTime(DateTime dateTime)
        {
            // Convert UTC to IST
            var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istTime = TimeZoneInfo.ConvertTimeFromUtc(dateTime, istZone);
            return $"{istTime.ToString("dd/MM/yyyy hh:mm tt", CultureInfo.InvariantCulture)}";
        }

        public static string FormatDateTime(DateTime? dateTime)
        {
            if (dateTime == null)
            {
                return string.Empty;
            }
            // Convert UTC to IST
            var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istTime = TimeZoneInfo.ConvertTimeFromUtc(dateTime ?? DateTime.Now, istZone);
            return $"{istTime.ToString("dd/MM/yyyy hh:mm tt", CultureInfo.InvariantCulture)}";
        }

        public static string ToDate(DateOnly startDate)
        {
            return startDate.ToString("dd/MM/yyyy");
        }

        public static string FormatDate(DateOnly? date)
        {
            if (date == null)
            {
                return string.Empty;
            }

            // Convert DateOnly to DateTime
            var dateTime = date.Value.ToDateTime(TimeOnly.MinValue);

            // Convert UTC to IST
            var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istTime = TimeZoneInfo.ConvertTimeFromUtc(dateTime, istZone);
            return $"{istTime.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture)}";
        }

        /// <summary>
        /// Calculates the week number of the year for a given date.
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static int GetWeekOfYear(DateTime date)
        {
            var calendar = CultureInfo.InvariantCulture.Calendar;
            int weekNumber = calendar.GetWeekOfYear(date, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
            return weekNumber;
        }

        public static string? CalculateAge(DateTime? birthDate)
        {
            if (!birthDate.HasValue)
            {
                return null;
            }

            var today = DateTime.Now;

            int years = today.Year - birthDate.Value.Year;
            int months = today.Month - birthDate.Value.Month;
            int days = today.Day - birthDate.Value.Day;

            if (days < 0)
            {
                var prevMonth = today.AddMonths(-1);
                days += DateTime.DaysInMonth(prevMonth.Year, prevMonth.Month);
                months -= 1;
            }

            if (months < 0)
            {
                months += 12;
                years -= 1;
            }

            return $"{years}Y {months}M {days}D";
        }

        /// <summary>
        /// Converts a DateTime to midnight UTC, preserving only the date part.
        /// This is useful for date-only fields like expiry dates to avoid timezone issues.
        /// </summary>
        /// <param name="dateTime">The DateTime to normalize</param>
        /// <returns>A DateTime set to midnight UTC of the same date</returns>
        public static DateTime ToUtcDate(DateTime dateTime)
        {
            return new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 0, 0, 0, DateTimeKind.Utc);
        }

        /// <summary>
        /// Converts a nullable DateTime to midnight UTC, preserving only the date part.
        /// Returns null if the input is null.
        /// </summary>
        /// <param name="dateTime">The nullable DateTime to normalize</param>
        /// <returns>A DateTime set to midnight UTC of the same date, or null</returns>
        public static DateTime? ToUtcDate(DateTime? dateTime)
        {
            return dateTime.HasValue ? ToUtcDate(dateTime.Value) : null;
        }

        public static string GetScholarshipValues(string total, int dioceseId)
        {
            string TotalHSScholarshipValue = total;
            string spaces = "";
            int iIncrement = 0;
            int iTotal = 0;

            if (dioceseId == 24)
            {
                iIncrement = 2500;
                iTotal = 30000;
            }
            else
            {
                iIncrement = 1000;
                iTotal = 10000;
            }

            spaces = decimal.TryParse(TotalHSScholarshipValue, out decimal n)
                ? n == 0
                    ? "$0"
                    : n == iTotal + 1
                        ? string.Format(new CultureInfo("en-US"), "{0:C0}", iTotal + 1) + " and above"
                        : string.Format(new CultureInfo("en-US"), "{0:C0}", n) + " - " + string.Format(new CultureInfo("en-US"), "{0:C0}", n + iIncrement - 1)
                : "";
            return spaces;
        }
        public static void ParseCsvFile(IFormFile file, DataTable dt)
        {
            ArgumentNullException.ThrowIfNull(file);
            ArgumentNullException.ThrowIfNull(dt);
            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream, Encoding.UTF8);

            string[]? headers = null;
            string? line;
            bool isFirst = true;

            while ((line = reader.ReadLine()) != null)
            {
                if (string.IsNullOrWhiteSpace(line))
                {
                    continue;
                }

                if (isFirst)
                {
                    string[] originalHeaders = CommonMethods.SplitCsvRow(line);
                    headers = new string[originalHeaders.Length];
                    for (int i = 0; i < originalHeaders.Length; i++)
                    {
                        headers[i] = CommonMethods.CleanTerraNovaColumnName(originalHeaders[i]);
                    }
                    isFirst = false;
                }
                else
                {
                    string[] cells = CommonMethods.SplitCsvRow(line);
                    AddRowToDataTable(cells, headers, dt);
                }
            }
        }

        public static void ParseExcelFile(IFormFile file, string extension, DataTable dt)
        {
            ArgumentNullException.ThrowIfNull(file);
            ArgumentNullException.ThrowIfNull(dt);
            using var stream = file.OpenReadStream();
            IWorkbook workbook = extension == ".xlsx"
                ? new XSSFWorkbook(stream)
                : new HSSFWorkbook(stream);

            var sheet = workbook.GetSheetAt(0);
            if (sheet == null || sheet.PhysicalNumberOfRows == 0)
            {
                return;
            }

            var headerRow = sheet.GetRow(0);
            if (headerRow == null)
            {
                return;
            }

            string[] headers = new string[headerRow.LastCellNum];
            for (int i = 0; i < headerRow.LastCellNum; i++)
            {
                var cell = headerRow.GetCell(i);
                headers[i] = CommonMethods.CleanTerraNovaColumnName(cell?.ToString() ?? string.Empty);
            }

            for (int rowIdx = 1; rowIdx <= sheet.LastRowNum; rowIdx++)
            {
                var row = sheet.GetRow(rowIdx);
                if (row == null)
                {
                    continue;
                }

                string[] cells = new string[headerRow.LastCellNum];
                bool hasData = false;
                for (int colIdx = 0; colIdx < headerRow.LastCellNum; colIdx++)
                {
                    var cell = row.GetCell(colIdx);
                    cells[colIdx] = CommonMethods.GetCellValue(cell);
                    if (!string.IsNullOrWhiteSpace(cells[colIdx]))
                    {
                        hasData = true;
                    }
                }

                if (hasData)
                {
                    AddRowToDataTable(cells, headers, dt);
                }
            }
        }

        public static void AddRowToDataTable(string[] cells, string[]? headers, DataTable dt)
        {
            ArgumentNullException.ThrowIfNull(cells);
            ArgumentNullException.ThrowIfNull(dt);
            if (headers == null)
            {
                return;
            }

            var dr = dt.NewRow();
            int limit = Math.Min(cells.Length, headers.Length);

            for (int i = 0; i < limit; i++)
            {
                string columnName = headers[i];
                if (!dt.Columns.Contains(columnName))
                {
                    continue;
                }

                string cellValue = cells[i]?.Trim() ?? string.Empty;

                // Replicate student ID formatting fallback from legacy code
                if (columnName == "StudentID" && string.IsNullOrEmpty(cellValue))
                {
                    dr[columnName] = string.Empty;
                }
                else
                {
                    var column = dt.Columns[columnName];
                    if (column != null)
                    {
                        dr[columnName] = column.DataType == typeof(int) ? ToInteger(cellValue) : string.IsNullOrEmpty(cellValue) ? DBNull.Value : cellValue;
                    }
                }
            }

            dt.Rows.Add(dr);
        }
    }
}
