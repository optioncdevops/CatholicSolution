// Copyright (c) OptionC. All rights reserved.

namespace Automation.Framework
{
    /// <summary>
    /// Summary description for ErrorLog
    /// </summary>
    public sealed class CommonErrorLog: IDisposable
    {
        #region Properties

        private static readonly string _logFilePath = string.Concat(AppDomain.CurrentDomain.BaseDirectory, "\\ErrorLog", "\\", DateTime.Today.Year + "\\", DateTime.Today.Month);

        private readonly string _errorLogFileName = string.Empty;
        private readonly string _logFileName = string.Empty;

        #endregion Properties

        public CommonErrorLog()
        {
            //check if the directory exists
            if (!Directory.Exists(_logFilePath))
            {
                Directory.CreateDirectory(_logFilePath);
            }

            _errorLogFileName = string.Concat(_logFilePath, "\\", "ErrorLog_", DateTime.Today.ToShortDateString().Replace("/", "_"), ".log");
            _logFileName = string.Concat(_logFilePath, "\\", "Log_", DateTime.Today.ToShortDateString().Replace("/", "_"), ".log");
        }

        /// <summary>
        /// This method is to write the passed error message and other details of error occurence
        /// </summary>
        /// <param name="sMessage">string - Error message</param>
        public void WriteLog(string sMessage)
        {
            try
            {
                using var sw = File.AppendText(_errorLogFileName);
                sw.WriteLine("Date/Time : " + DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToShortTimeString());
                sw.WriteLine("Message   : " + sMessage);
            }
            catch (Exception)
            {
                // Logging must never fail the test run.
            }
        }

        /// <summary>
        /// This method is to write the details of the passed exception to the error log.
        /// </summary>
        /// <param name="ex">The exception to record.</param>
        public void WriteLog(Exception ex)
        {
            ArgumentNullException.ThrowIfNull(ex);

            try
            {
                using var sw = File.AppendText(_errorLogFileName);
                sw.WriteLine("-----------------------------------------------------------------------------------------");
                sw.WriteLine("Date/Time  :" + DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToShortTimeString());
                sw.WriteLine("Source/MSG :" + ex.Source + " / " + ex.Message);
                sw.WriteLine("StackTrace :" + ex.StackTrace);
                sw.WriteLine("-----------------------------------------------------------------------------------------");
            }
            catch (Exception)
            {
                // Logging must never fail the test run.
            }
        }

        /// <summary>
        /// Method used to write the arugement to targetted text file in a new line
        /// </summary>
        /// <param name="sKey"> This key used to find the controls</param>
        /// <param name="sValues">Send the Values to the controls </param>
        /// <param name="sAction">Send the action that you need to performance</param>
        /// <param name="iLogMode">0 - Do not log the error in file   and 1 - Log the error in file  </param>
        public void WriteLog(string sKey, string sValues, string sAction, int iLogMode)
        {
            if (iLogMode != 1)
            {
                return;
            }

            try
            {
                using var sw = File.AppendText(_logFileName);
                sw.WriteLine("-----------------------------------------------------------------------------------------");

                // The action is parenthesised on purpose: without it the conditional
                // bound to the whole concatenation, so every line logged "Click".
                sw.WriteLine("Date/Time  : " + DateTime.Now.ToShortDateString() + " - " + DateTime.Now.ToShortTimeString()
                    + "   Action : " + (string.IsNullOrEmpty(sAction) ? "Click" : sAction)
                    + "      sKey : " + sKey + "         sValues : " + sValues);
            }
            catch (Exception)
            {
                // Logging must never fail the test run.
            }
        }

        /// <summary>
        /// Convenience entry point so callers can log an exception without
        /// having to manage the lifetime of a logger instance.
        /// </summary>
        public static void WriteErrorLog(Exception ex)
        {
            using var log = new CommonErrorLog();
            log.WriteLog(ex);
        }

        public void Dispose()
        {
            // Each write opens and closes its own StreamWriter, so there is nothing
            // left to release here. The previous version forced a full GC on every
            // logged element interaction.
            GC.SuppressFinalize(this);
        }
    }
}
