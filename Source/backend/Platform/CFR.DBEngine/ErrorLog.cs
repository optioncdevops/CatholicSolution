// Copyright (c) OptionC. All rights reserved.

namespace CFR.DBEngine
{ /// <summary>
  /// Summary description for ErrorLog
  /// </summary>
    public class ErrorLog: IDisposable
    {
        #region Properties

        private static readonly string _logFilePath = string.Concat(AppDomain.CurrentDomain.BaseDirectory, "\\ErrorLog", "\\", DateTime.Today.Year + "\\", DateTime.Today.Month);

        private string _logFileName = string.Empty;
        private string _logAPIFileName = string.Empty;
        private string _logConductFileName = string.Empty;
        private string _logAttendanceFileName = string.Empty;

        #endregion Properties

        public ErrorLog()
        {
            //check if the directory exists
            if (!Directory.Exists(_logFilePath))
            {
                _ = Directory.CreateDirectory(_logFilePath);
            }
            _logFileName = string.Concat(_logFilePath, "\\", "Log_", DateTime.Today.ToShortDateString().Replace("/", "_"), ".log");
            _logAPIFileName = string.Concat(_logFilePath, "\\", "APILog_", DateTime.Today.ToShortDateString().Replace("/", "_"), ".log");
            _logConductFileName = string.Concat(_logFilePath, "\\", "ConductLog_", DateTime.Today.ToShortDateString().Replace("/", "_"), ".log");
            _logAttendanceFileName = string.Concat(_logFilePath, "\\", "AttendanceLog_", DateTime.Today.ToShortDateString().Replace("/", "_"), ".log");
        }

        /// <summary>
        /// This method is to write the passed error message and other details of error occurence
        /// </summary>
        /// <param name="sMessage">string - Error message</param>
        ///
        public void WriteLog(string sMessage)
        {
            try
            {
                var sw = File.AppendText(_logFileName);
                sw.WriteLine("Date/Time : " + DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToLongTimeString());
                sw.WriteLine("Message   : " + sMessage);
                sw.Close();
            }
            catch (Exception ex)
            {
                string ErrMsg = ex.Message;
            }
        }

        public void ConductWriteLog(string sMessage)
        {
            try
            {
                var sw = File.AppendText(_logConductFileName);
                sw.WriteLine("Date/Time : " + DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToLongTimeString());
                sw.WriteLine("Message   : " + sMessage);
                sw.Close();
            }
            catch (Exception ex)
            {
                string ErrMsg = ex.Message;
            }
        }

        public void ConductWriteEmailUpdateLog(string sMessage)
        {
            try
            {
                _logConductFileName = string.Concat(_logFilePath, "\\", "ConductEmailStatusUpdateLog_", DateTime.Today.ToShortDateString().Replace("/", "_"), ".log");
                var sw = File.AppendText(_logConductFileName);
                sw.WriteLine(DateTime.Now + " :: " + sMessage);
                sw.Close();
            }
            catch (Exception ex)
            {
                string ErrMsg = ex.Message;
            }
        }

        public void ConductInsertUpdateLog(string sMessage)
        {
            try
            {
                _logConductFileName = string.Concat(_logFilePath, "\\", "ConductInsertLog_", DateTime.Today.ToShortDateString().Replace("/", "_"), ".log");
                var sw = File.AppendText(_logConductFileName);
                sw.WriteLine(DateTime.Now + " :: " + sMessage);
                sw.Close();
            }
            catch (Exception ex)
            {
                string ErrMsg = ex.Message;
            }
        }

        public void AttendanceWriteLog(string sMessage)
        {
            try
            {
                var sw = File.AppendText(_logAttendanceFileName);
                sw.WriteLine("Date/Time : " + DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToLongTimeString());
                sw.WriteLine("Message   : " + sMessage);
                sw.Close();
            }
            catch (Exception ex)
            {
                string ErrMsg = ex.Message;
            }
        }

        public void ConductWriteEmailLog(string sMessage)
        {
            try
            {
                _logConductFileName = string.Concat(_logFilePath, "\\", "ConductEmailLog_", DateTime.Today.ToShortDateString().Replace("/", "_"), ".log");
                var sw = File.AppendText(_logConductFileName);
                sw.WriteLine(DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToShortTimeString() + " :: Message   : " + sMessage);
                sw.Close();
            }
            catch (Exception ex)
            {
                string ErrMsg = ex.Message;
            }
        }

        public void WriteLog(Exception ex)
        {
            ArgumentNullException.ThrowIfNull(ex);

            try
            {
                var sw = File.AppendText(_logFileName);
                sw.WriteLine("-----------------------------------------------------------------------------------------");
                sw.WriteLine("Date/Time  :" + DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToLongTimeString());
                sw.WriteLine("Source/MSG :" + ex.Source + " / " + ex.Message);
                sw.WriteLine("StackTrace :" + ex.StackTrace);
                sw.WriteLine("-----------------------------------------------------------------------------------------");
                sw.Close();
            }
            catch (Exception exlog)
            {
                string ErrMsg = exlog.Message;
            }
        }

        /// <summary>
        /// Method used to write the exception passed as an argument to a targeted text file in a new line.
        /// </summary>
        /// <param name="className">The class where the error occurred.</param>
        /// <param name="methodName">The method where the error occurred.</param>
        /// <param name="query">The query associated with the error, if any.</param>
        /// <param name="errMessage">The error message.</param>
        public void WriteLog(string className, string methodName, string query, string errMessage)
        {
            try
            {
                var sw = File.AppendText(_logFileName);
                sw.WriteLine("-----------------------------------------------------------------------------------------");
                sw.WriteLine("Date/Time  :" + DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToLongTimeString());
                sw.WriteLine("ClassName  :" + className);
                sw.WriteLine("MethodName :" + methodName);
                if (!string.IsNullOrEmpty(query))
                {
                    sw.WriteLine("Query      :" + query);
                }

                sw.WriteLine("Message    :" + errMessage);
                sw.WriteLine("-----------------------------------------------------------------------------------------");
                sw.Close();
            }
            catch (Exception exMsg)
            {
                string sError = exMsg.Message;
            }
            WriteLog("-----------------------------------------------------------------------------------------");
        }

        public void WriteAPILog(string module, string error)
        {
            try
            {
                var sw = File.AppendText(_logAPIFileName);
                sw.WriteLine("-----------------------------------------------------------------------------------------");
                sw.WriteLine("Date/Time  :" + DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToShortTimeString());
                sw.WriteLine("Module  :" + module);
                if (!string.IsNullOrEmpty(error))
                {
                    sw.WriteLine("Error :" + error);
                }

                sw.WriteLine("-----------------------------------------------------------------------------------------");
                sw.Close();
            }
            catch (Exception exMsg)
            {
                string sError = exMsg.Message;
            }
            WriteLog("-----------------------------------------------------------------------------------------");
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }
    }
}
