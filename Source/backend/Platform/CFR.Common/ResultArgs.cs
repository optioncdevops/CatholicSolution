// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    public class ResultArgs
    {
        public long StatusCode { get; set; } = ErrorCodes.Success;
        public string? StatusMessage { get; set; } = ErrorMessages.Success;
        public object? ResultData { get; set; }
        public List<ErrorDetail> Errors { get; set; } = [];
        public string TraceId { get; set; } = Guid.NewGuid().ToString();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? RowUniqueId { get; set; }

        public static ResultArgs Custom(string message)
        {
            return new ResultArgs
            {
                StatusCode = ErrorCodes.CustomMessage,
                StatusMessage = message
            };
        }
    }

    public class ResultArgs<T>
    {
        public long StatusCode { get; set; } = ErrorCodes.Success;
        public string? StatusMessage { get; set; } = ErrorMessages.Success;
        public T? ResultData { get; set; }
        public List<ErrorDetail> Errors { get; set; } = [];
        public string TraceId { get; set; } = string.Empty;
    }
    public class ErrorDetail(string field, string message)
    {
        public string Field { get; set; } = field;
        public string Message { get; set; } = message;
    }

    /// <summary>
    /// Represents a paginated result for a data query, containing metadata about the total records,
    /// current page, page size, and the actual data for the page.
    /// </summary>
    public class ResponseData
    {
        /// <summary>
        /// Gets or sets the total number of records in the dataset.
        /// </summary>
        public int TotalRecords { get; set; }

        public int TotalMale { get; set; }

        public int TotalFemale { get; set; }

        public int TotalTransgender { get; set; }

        /// <summary>
        /// Gets or sets the filtered count including all filters (for grid pagination).
        /// </summary>
        public int FilteredCount { get; set; }

        /// <summary>
        /// Gets or sets the current page number being returned in the paginated result.
        /// </summary>
        public int PageNumber { get; set; }

        /// <summary>
        /// Gets or sets the number of records per page.
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Gets or sets the data for the current page.
        /// </summary>
        public object Data { get; set; } = null!;
    }
}
