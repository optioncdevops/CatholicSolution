// Copyright (c) OptionC. All rights reserved.

namespace CFR.DBEngine
{
    public interface IDapperHandler
    {
        IDbConnection Connection { get; }

        Task<T> QueryFirstOrDefaultAsync<T>(string sql, object? parameters = null, CommandType commandType = CommandType.Text);  // return the Single row Data table values

        Task<T> QuerySingleAsync<T>(string sql, object? parameters = null, CommandType commandType = CommandType.Text); // return the Data table with singel row oblject  with SP

        Task<T> ExecuteScalarAsync<T>(string sql, object? parameters = null, CommandType commandType = CommandType.Text, int timeOut = 300);  // return the object values

        Task<int> ExecuteAsync(string sql, object? parameters = null, CommandType commandType = CommandType.Text, int commandTimeout = 300); // Insert, Update and Delete

        Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null, CommandType commandType = CommandType.Text);   // return the data table with more the one rows

        Task<GridReader> QueryMultipleAsync(string sql, object? parameters = null, CommandType commandType = CommandType.Text);  // return the Data Set values

        Task<TableSetDto> QueryMultipleTableSetAsync(string sql, DynamicParameters? parameters, int expectedTables);

        Task<IDataReader> ExecuteReaderAsync(IDbConnection connection, string sql, CommandType commandType, object? parameters = null);

        void ExecuteScript(string script);

        object ExecuteScalar(string script);
    }

    public class DapperHandler(IConfiguration configuration): IDapperHandler
    {
        static DapperHandler()
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        private readonly IConfiguration _configuration = configuration;

        public IDbConnection Connection
        {
            get
            {
                var sqlconnection = new SqlConnection(_configuration.GetConnectionString("ConnString"));
                return sqlconnection;
            }
        }

        public async Task<T> QueryFirstOrDefaultAsync<T>(string sql, object? parameters = null, CommandType commandType = CommandType.Text)
        {
            using (Connection)
            {
                var result = await Connection.QueryFirstOrDefaultAsync<T>(sql, parameters, commandType: commandType);
                return result ?? default!;
            }
        }

        public async Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null, CommandType commandType = CommandType.Text)
        {
            using (Connection)
            {
                return await Connection.QueryAsync<T>(sql, parameters, commandType: commandType, commandTimeout: 600);
            }
        }

        public async Task<T> QuerySingleAsync<T>(string sql, object? parameters = null, CommandType commandType = CommandType.Text)
        {
            using (Connection)
            {
                return await Connection.QuerySingleAsync<T>(sql, parameters, commandType: commandType);
            }
        }

        public async Task<T> ExecuteScalarAsync<T>(string sql, object? parameters = null, CommandType commandType = CommandType.Text, int timeOut = 300)
        {
            using (Connection)
            {
                var result = await Connection.ExecuteScalarAsync<T>(sql, parameters, commandType: commandType, commandTimeout: timeOut);
                return result ?? default!;
            }
        }

        public async Task<int> ExecuteAsync(string sql, object? parameters = null, CommandType commandType = CommandType.Text, int commandTimeout = 300)
        {
            using var connection = Connection;
            return await connection.ExecuteAsync(sql, parameters, commandType: commandType, commandTimeout: commandTimeout);
        }

        public async Task<GridReader> QueryMultipleAsync(string sql, object? parameters = null, CommandType commandType = CommandType.Text)
        {
            var connection = Connection;
            return await connection.QueryMultipleAsync(sql, parameters, commandType: commandType, commandTimeout: 180);
        }

        public async Task<IDataReader> ExecuteReaderAsync(IDbConnection connection, string sql, CommandType commandType, object? parameters = null)
        {
            return await connection.ExecuteReaderAsync(sql, parameters, commandType: commandType, commandTimeout: 180);
        }

        public void ExecuteScript(string script)
        {
            try
            {
                using (Connection)
                {
                    Connection.Open();
                    _ = Connection.Execute(script);
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public object ExecuteScalar(string script)
        {
            object? result = null;
            try
            {
                // code to execute script file in dapper
                using (Connection)
                {
                    Connection.Open();
                    result = Connection.ExecuteScalar(script);
                }
            }
            catch (Exception)
            {
                throw;
            }
            return result ?? string.Empty;
        }

        public async Task<TableSetDto> QueryMultipleTableSetAsync(string sql, DynamicParameters? parameters, int expectedTables)
        {
            var result = new TableSetDto();
            using var grid = await QueryMultipleAsync(sql, parameters, CommandType.StoredProcedure);

            for (int i = 0; i < expectedTables; i++)
            {
                try
                {
                    var rows = await grid.ReadAsync<dynamic>();
                    result.Tables.Add(ToRows(rows));
                }
                catch (InvalidOperationException)
                {
                    break;
                }
            }

            return result;
        }

        protected static TableSetDto FromRows(IEnumerable<dynamic> rows)
        {
            return new TableSetDto { Tables = new() { ToRows(rows) } };
        }

        protected static List<Dictionary<string, object?>> ToRows(IEnumerable<dynamic> rows)
        {
            return [.. rows
                .Select(row => ((IDictionary<string, object?>)row)
                    .ToDictionary(pair => pair.Key, pair => pair.Value is DBNull ? null : pair.Value))];
        }
    }
}
