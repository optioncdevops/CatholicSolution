// Copyright (c) OptionC. All rights reserved.

namespace CFR.DBEngine
{
    public class TableSetDto
    {
        public List<List<Dictionary<string, object?>>> Tables { get; set; } = new();
    }

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

        public bool Success { get; set; }

        public bool IsShowExceptionMessage { get; set; } = true;

        public int RowsAffected { get; set; }

        public bool IsDeadLock { get; set; }

        public object RowUniqueId
        {
            get;
            set
            {
                Success = true;
                field = value;
            }
        } = "";

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

        public object? ReturnValue { get; set; }

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

            /// <summary>
            /// Get Dataset Object
            /// </summary>
            public DataSet TableSet => _dataSource as DataSet ?? new DataSet();

            /// <summary>
            /// Get Data Table Object
            /// </summary>
            public DataTable Table => _dataSource as DataTable ?? new DataTable();

            /// <summary>
            /// Get Data View Object
            /// </summary>
            public DataView TableView => _dataSource as DataView ?? new DataView();

            /// <summary>
            /// Get Sclar value
            /// </summary>
            ///
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
}
