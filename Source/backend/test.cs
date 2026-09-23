using System;
using System.Data;
using System.Data.SqlClient;
using Dapper;
using System.Linq;

namespace TestApp {
    public class OrganizationOutput {
        public long OrgId { get; set; }
        public string OrgName { get; set; }
        public string OrgStatus { get; set; }
        public string OrgType { get; set; }
        public string ContactEmail { get; set; }
        public string Website { get; set; }
        public string ContactPerson { get; set; }
        public string ContactPhone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Zip { get; set; }
        public int? DioceseId { get; set; }
        public DateTime InsertedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int UserCount { get; set; }
        public int ProductCount { get; set; }
    }

    public class Program {
        public static void Main() {
            try {
                string connString = ""Server=192.168.1.7\\MSSQL2022;Database=CFRPortal;User Id=optionc;Password=optionc;TrustServerCertificate=true;"";
                using (var conn = new SqlConnection(connString)) {
                    conn.Open();
                    var parameters = new DynamicParameters();
                    parameters.Add(""ActionId"", 1, DbType.Int32);
                    var result = conn.Query<OrganizationOutput>(""[dbo].[Acutis_Organization]"", parameters, commandType: CommandType.StoredProcedure).ToList();
                    Console.WriteLine(""Row count: "" + result.Count);
                    foreach(var r in result) {
                        Console.WriteLine(r.OrgName + "" - "" + r.DioceseId);
                    }
                }
            } catch (Exception ex) {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}
