// Copyright (c) OptionC. All rights reserved.

global using System.Data;

global using Dapper;

global using CFR.AcutisInfrastructure;
global using CFR.Common;
global using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
global using CFR.AcutisInfrastructure.Interfaces.Administration;
global using CFR.AcutisInfrastructure.Interfaces.Organization;
global using CFR.AcutisInfrastructure.Interfaces.Profile;
global using CFR.AcutisInfrastructure.Interfaces.Products;
global using CFR.AcutisInfrastructure.Interfaces.Dashboard;
global using CFR.AcutisInfrastructure.Models.Input;
global using CFR.AcutisInfrastructure.Models.Output;
global using CFR.CommonService.Interfaces;
global using CFR.DBEngine;
global using System.Text.Json.Serialization;
global using Microsoft.AspNetCore.Http;