using System;
using System.Data;
using System.Data.SqlClient;

namespace TestApp {
    public class Program {
        public static void Main() {
            try {
                string connString = ""Server=192.168.1.7\\MSSQL2022;Database=CFRPortal;User Id=optionc;Password=optionc;TrustServerCertificate=true;"";
                using (var conn = new SqlConnection(connString)) {
                    conn.Open();
                    using (var cmd = new SqlCommand(""[dbo].[Acutis_Organization]"", conn)) {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue(""@ActionId"", 1);
                        using (var reader = cmd.ExecuteReader()) {
                            int count = 0;
                            while(reader.Read()) { count++; }
                            Console.WriteLine(""Total rows: "" + count);
                        }
                    }
                }
            } catch (Exception ex) {
                Console.WriteLine(""ERROR: "" + ex.Message);
            }
        }
    }
}
