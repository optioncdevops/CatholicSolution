// Copyright (c) OptionC. All rights reserved.

using CFR.Common;
using System.Text.Json.Serialization;

namespace CFR.DBEngine
{
    public class TableSetDto
    {
        public List<List<Dictionary<string, object?>>> Tables { get; set; } = new();
    }

    public class ErrorDetail(string field, string message)
    {
        public string Field { get; set; } = field;
        public string Message { get; set; } = message;
    }

    /// <summary>
    /// Paginated result metadata for a data query.
    /// </summary>
    public class ResponseData
    {
        public int TotalRecords { get; set; }
        public int TotalMale { get; set; }
        public int TotalFemale { get; set; }
        public int TotalTransgender { get; set; }
        public int FilteredCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public object Data { get; set; } = null!;
    }

    /// <summary>
    /// Shared result envelope for DB operations and API responses.
    /// </summary>
    public class MSResultArgs: IDisposable
    {
        private Dictionary<string, object>? _rowUniqueIdCollection;
        private ResultSource? _resultSource = new();

        public MSResultArgs()
        {
        }

        public MSResultArgs(bool isShowExceptionMessage)
        {
            IsShowExceptionMessage = isShowExceptionMessage;
        }

        #region API response

        public long StatusCode { get; set; } = ErrorCodes.Success;
        public string? StatusMessage { get; set; } = ErrorMessages.Success;
        public object? ResultData { get; set; }
        public List<ErrorDetail> Errors { get; set; } = [];
        public string TraceId { get; set; } = Guid.NewGuid().ToString();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public static MSResultArgs Custom(string message)
        {
            return new MSResultArgs
            {
                StatusCode = ErrorCodes.CustomMessage,
                StatusMessage = message
            };
        }

        #endregion API response

        #region DB result

        [JsonIgnore]
        public bool Success { get; set; }

        [JsonIgnore]
        public bool IsShowExceptionMessage { get; set; } = true;

        [JsonIgnore]
        public int RowsAffected { get; set; }

        [JsonIgnore]
        public bool IsDeadLock { get; set; }

        [JsonIgnore]
        public object RowUniqueId
        {
            get;
            set
            {
                Success = true;
                field = value;
            }
        } = "";

        [JsonIgnore]
        public Dictionary<string, object> RowUniqueIdCollection
        {
            get
            {
                _rowUniqueIdCollection ??= new Dictionary<string, object>();

                return _rowUniqueIdCollection;
            }
            set
            {
                Success = true;
                _rowUniqueIdCollection = value;
            }
        }

        [JsonIgnore]
        public object? ReturnValue { get; set; }

        [JsonIgnore]
        public ResultSource DataSource
        {
            get
            {
                _resultSource ??= new ResultSource();
                return _resultSource;
            }

            set
            {
                Success = true;
                _resultSource ??= new ResultSource();
                _resultSource.Data = value;
            }
        }

        #endregion DB result

        #region Class Result Source

        public class ResultSource: IDisposable
        {
            private object? _dataSource;

            public ResultSource()
            {
                ScalarType1 = new ScalarType();
            }

            public object Data
            {
                get => _dataSource ?? string.Empty;
                set
                {
                    _dataSource = value;
                    (ScalarType1 ??= new ScalarType()).SclarSource = _dataSource;
                }
            }

            public DataSet TableSet => _dataSource as DataSet ?? new DataSet();

            public DataTable Table => _dataSource as DataTable ?? new DataTable();

            public DataView TableView => _dataSource as DataView ?? new DataView();

            public ScalarType Scalar => ScalarType1 ?? new ScalarType();

            public ScalarType? ScalarType1 { get => ScalarType2; set => ScalarType2 = value; }

            public ScalarType? ScalarType2 { get; set; }

            public class ScalarType
            {
                private object? _dataSource;

                public object SclarSource
                {
                    set => _dataSource = value;
                }

                public new string ToString
                {
                    get
                    {
                        string sclarVal = "";

                        if (_dataSource != null)
                        {
                            sclarVal = _dataSource.ToString() ?? string.Empty;
                        }

                        return sclarVal;
                    }
                }

                public int ToInteger => int.TryParse(ToString, out int scalarVal) ? scalarVal : 0;
            }

            #region IDisposable Members

            public void Dispose()
            {
                ScalarType1 = null;
                _dataSource = null;
                GC.SuppressFinalize(this);
            }

            #endregion IDisposable Members
        }

        #endregion Class Result Source

        #region IDisposable Members

        public void Dispose()
        {
            _resultSource?.Dispose();
            _resultSource = null;
            _rowUniqueIdCollection?.Clear();
            _rowUniqueIdCollection = null;
            GC.SuppressFinalize(this);
        }

        #endregion IDisposable Members
    }

    /// <summary>
    /// Typed API response envelope.
    /// </summary>
    public class MSResultArgs<T>
    {
        public long StatusCode { get; set; } = ErrorCodes.Success;
        public string? StatusMessage { get; set; } = ErrorMessages.Success;
        public T? ResultData { get; set; }
        public List<ErrorDetail> Errors { get; set; } = [];
        public string TraceId { get; set; } = string.Empty;
    }
}
