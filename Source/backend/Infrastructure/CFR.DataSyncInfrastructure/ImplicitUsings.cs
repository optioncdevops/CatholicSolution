// Copyright (c) OptionC. All rights reserved.

global using System.Data;

global using Dapper;

global using Microsoft.Data.SqlClient;

global using CFR.DataSyncInfrastructure.Interfaces.OrganizationSync;
global using CFR.DataSyncInfrastructure.Interfaces.Security;
global using CFR.DataSyncInfrastructure.Interfaces.UserSync;
global using CFR.DataSyncInfrastructure.Models.Input;
global using CFR.DataSyncInfrastructure.Models.Output;
global using CFR.CommonService.Interfaces;
global using CFR.DBEngine;
global using System.Text.Json.Serialization;
