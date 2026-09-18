---
name: backend-api-standards
description: Layered .NET backend API coding standards for the Controller to Service to Repository to SQL Stored Procedure architecture (Dapper + ResultArgs + Serilog). Use this skill whenever adding, changing, or reviewing ANY backend API code — a new endpoint, controller, service, repository, DTO, stored-procedure call, or CRUD feature — even if the user only says "add an API", "new endpoint", "create a feature", or "fix this controller". Follow it as the checklist for every backend change. Tables with InsertedBy/UpdatedBy must stamp those columns from ICurrentUserService.UserId in the repository, never from the client.
---

# Backend API Coding Standards

Layered architecture: **Controller -> Service -> Repository -> SQL Stored Procedure**.

Use this file as the checklist when adding or changing any API.
Example feature used throughout: **Customer Directory** in an **Administration** module.
Replace `CustomerDirectory` with the real feature name.

## Placeholders used in this skill

| Placeholder | Meaning | Example |
|---|---|---|
| `{Company}` | Company / product name for file headers | `Contoso` |
| `{ApiHostProject}` | The API host (controllers, DI, Program.cs) | `Contoso.Api` |
| `{ServiceProject}` | The business-logic project | `Contoso.Service` |
| `{InfraProject}` | The data-access project | `Contoso.Infrastructure` |
| `{CommonProject}` | Shared constants project | `Contoso.Common` |
| `{CommonServiceProject}` | Shared current-user / helpers project | `Contoso.CommonService` |
| `{Module}` | Product area | `Administration` |
| `{Feature}` | The feature being built | `CustomerDirectory` |
| `{SpGroup}` | Grouping class for stored-procedure constants | `Directory` |
| `{Schema}` | SQL schema of the stored procedures | `dbo` |

## Step 0 — Discover the host project's conventions FIRST

Before writing any code, open one existing, recently-built feature in the host solution and mirror it:

- Actual project names for `{ApiHostProject}`, `{ServiceProject}`, `{InfraProject}`, `{CommonProject}`.
- Actual folder spellings — some codebases intentionally use `Repositorys` and `StroredProc`; match whatever already exists. In a brand-new project use `Repositories` and `StoredProc`.
- The existing file-header comment, base controller, result wrapper (`ResultArgs`), logger helper (`AppLogger`), and Dapper wrapper (`IDapperHandler`) — reuse the project's equivalents rather than inventing new ones.
- Whether the project uses **typed DTOs** or **dynamic** for repository results (see rule 0.5) — follow the existing style.

---

## 0. STYLE RULES (MUST FOLLOW)

### 0.1 File header (every .cs file)
Match the project's existing header. Typical form:
```csharp
// Copyright (c) {Company}. All rights reserved.
```

### 0.2 Primary constructor is ONE line
```csharp
// YES
public class CustomerDirectoryService(ICustomerDirectoryRepository repository, ILogger<CustomerDirectoryService> logger): ICustomerDirectoryService

// NO — do not break parameters across lines
```

### 0.3 Controller action body is ONE return line
```csharp
// YES
return ApiResultArgs(await service.GetCustomerDirectoryListAsync(), APIHttpType.HttpGet);

// NO — do not split into var result = ...; return ...;
```

### 0.4 Dapper call is ONE line
```csharp
// YES
var result = await dapperHandler.QueryAsync<CustomerDirectoryOutput>(StoredProc.{SpGroup}.GetCustomerDirectoryList, parameters, CommandType.StoredProcedure);

// NO — do not split arguments across multiple lines
```

### 0.5 Repository results: typed DTOs OR dynamic — both are allowed
Two accepted styles. Pick ONE per feature and stay consistent — do not mix both within the same feature.

**Style A — Typed DTOs (preferred default):**
- Input  -> `{InfraProject}/Models/Input/{Feature}Input.cs`
- Output -> `{InfraProject}/Models/Output/{Feature}Output.cs`
- Repository returns `List<TOutput>`, `TOutput`, `int`, or `bool`.
- Best for: public contracts, Swagger docs, compile-time safety.

**Style B — dynamic:**
- Repository returns `Task<dynamic>` / `Task<List<dynamic>>` straight from Dapper.
- Best for: ad-hoc result shapes, quick internal endpoints, or when the host project already uses dynamic.
- Input payloads may still use an Input DTO or simple parameters.

Either way, the Service wraps the result in `ResultArgs`.

### 0.6 try/catch lives ONLY in the Service
- **Controller** = no try/catch, no Serilog, no Dapper
- **Service** = business rules + try/catch + Serilog + ResultArgs
- **Repository** = DynamicParameters + stored procedure only (no try/catch). When the table has `InsertedBy` / `UpdatedBy`, also inject `ICurrentUserService` (see rule 0.9). Save with id = 0 → `InsertedBy`. Save with id present → `UpdatedBy`. PUT status / DELETE → `UpdatedBy`.

### 0.7 Regions by HTTP verb (in controller, service, repository and their interfaces)
```csharp
#region GET Methods
#endregion GET Methods

#region POST Methods
#endregion POST Methods

#region PUT Methods
#endregion PUT Methods

#region DELETE Methods
#endregion DELETE Methods
```

### 0.8 XML comments are REQUIRED on:
- every class / interface
- every public action / method
- every public DTO and every DTO property

Comment template (copy this block):
```csharp
/// <summary>
/// One-line description.
/// </summary>
/// <remarks>
/// Purpose: ...
/// Request Flow: ...
/// Validation Details: ...
/// Business Logic: ...
/// Service Interaction: ...     (controller / service interface)
/// Repository Interaction: ...  (service / repository)
/// Response Details: ...
/// </remarks>
/// <param name="x">...</param>
/// <returns>...</returns>
/// <response code="200">...</response>   (controller actions only)
/// <response code="500">...</response>   (controller actions only)
```

### 0.9 Audit columns (`InsertedBy` / `UpdatedBy`) come from the logged-in user

Tables that have `InsertedBy` and/or `UpdatedBy` MUST stamp them from the **current login**, not from the request body and not from a hardcoded value.

How the login user is available:
- After a successful login, the JWT is sent on later requests (`Authorization: Bearer ...`).
- `ClientInfoMiddleware` (already in the host pipeline) fills the scoped `ICurrentUserService` / `CurrentUserService` from JWT claims (`UserId`, `UserName`, `RoleId`, `FirstName`, `LastName`).
- `{ServiceProject}` already registers `services.AddScoped<ICurrentUserService, CurrentUserService>();` once. Do not register it again per feature.

MUST:
- Inject `ICurrentUserService` into the **repository** (same primary-constructor line as `IDapperHandler`).
- Combined save already uses id = 0 for insert and a real id for update. Use that same check for audit params:
  - **Insert** (`UserId == 0` / `RoleId == 0`): pass `InsertedBy` only. Do **not** pass `UpdatedBy`.
  - **Update** (id is present): pass `UpdatedBy` only. Do **not** pass `InsertedBy`.
- **PUT status / DELETE**: pass `UpdatedBy` only. Do **not** pass `InsertedBy`.
- Add those names to `DBParameterName.{SpGroup}Params` (`nameof(InsertedBy)`, `nameof(UpdatedBy)`).
- Stored procedure: `@InsertedBy BIGINT = NULL`, `@UpdatedBy BIGINT = NULL`. Insert sets `[InsertedBy]` only; update / status / delete sets `[UpdatedBy]` (and `[UpdatedDate]`). Treat `0` as NULL (`NULLIF(@InsertedBy, 0)`).
- Add `global using CFR.CommonService.Interfaces;` in the infrastructure `ImplicitUsings.cs`. If the infrastructure project does not yet reference `{CommonServiceProject}`, add that project reference.
- GET list / GET by id do not pass audit params.

MUST NOT:
- Put `InsertedBy` / `UpdatedBy` on the frontend payload or Input DTO.
- Pass both `InsertedBy` and `UpdatedBy` on the same save call.
- Pass `UpdatedBy` when inserting a new row (`UserId == 0`).
- Pass `InsertedBy` when updating (`UserId` present), changing status, or deleting.
- Read the user id in the controller or service and pass it as a method argument — the repository reads `ICurrentUserService` itself.
- Invent a second current-user helper. Use `{CommonServiceProject}/Service/CurrentUserService.cs` (`ICurrentUserService`).

Repository constructor (ONE line):
```csharp
public class CustomerDirectoryRepository(IDapperHandler dapperHandler, ICurrentUserService currentUserService): ICustomerDirectoryRepository
```

Save — insert vs update from the existing id:
```csharp
if (input.UserId == 0)
{
    parameters.Add(DBParameterName.{SpGroup}Params.InsertedBy, currentUserService.UserId, DbType.Int64);
}
else
{
    parameters.Add(DBParameterName.{SpGroup}Params.UpdatedBy, currentUserService.UserId, DbType.Int64);
}
```

PUT status / DELETE — `UpdatedBy` only:
```csharp
parameters.Add(DBParameterName.{SpGroup}Params.UpdatedBy, currentUserService.UserId, DbType.Int64);
```

### 0.10 Unused usings MUST be removed
When adding or changing any `.cs` file, remove unused `using` statements. Do not add a `using` that is already covered by that project's `ImplicitUsings.cs`. Do not leave unused usings "for later".

---

## 1. WHERE EACH FILE GOES

| Layer | Project | Folder / File |
|---|---|---|
| Controller | `{ApiHostProject}` | `Controllers/{Module}/{Feature}Controller.cs` |
| Service interface | `{ServiceProject}` | `Interfaces/{Module}/I{Feature}Service.cs` |
| Service | `{ServiceProject}` | `Service/{Module}/{Feature}Service.cs` |
| Repo interface | `{InfraProject}` | `Interfaces/{Module}/I{Feature}Repository.cs` |
| Repository | `{InfraProject}` | `Repositories/{Module}/{Feature}Repository.cs` (match host spelling) |
| Input DTO | `{InfraProject}` | `Models/Input/{Feature}Input.cs` |
| Output DTO | `{InfraProject}` | `Models/Output/{Feature}Output.cs` |
| DI | `{ApiHostProject}` | `ServiceExtension.cs` -> `AddDIServicesSetup()` |
| Global usings | each project | `ImplicitUsings.cs` |
| Action names | `{CommonProject}` | `APIActionName.cs` |
| SP names | `{InfraProject}` | `StoredProc.cs` (match host spelling) |
| SP parameter names | `{InfraProject}` | `SQLParams.cs` (`DBParameterName`) |
| Serilog messages | `{CommonProject}` | `MessageCatalog.cs` (`SerilogErrorMessages`) |

URL shape:
```
api/v1/{Controller}/{Action}
Example: GET /api/v1/CustomerDirectory/GetCustomerDirectory
```

Request flow:
```
Client
  -> Controller     (HTTP only, one-line return)
    -> Service      (try/catch, ResultArgs, Serilog)
      -> Repository (params + stored procedure)
        -> SQL Server
```

---

## 2. NAMING

Feature: Customer Directory | Module: Administration

| Piece | Name |
|---|---|
| Controller | `CustomerDirectoryController` |
| Service interface | `ICustomerDirectoryService` |
| Service class | `CustomerDirectoryService` |
| Repo interface | `ICustomerDirectoryRepository` |
| Repo class | `CustomerDirectoryRepository` |
| Input DTO | `CustomerDirectoryInput` |
| Output DTO | `CustomerDirectoryOutput` |
| Action constant | `API_{Module}.GetCustomerDirectory` |
| SP constant | `StoredProc.{SpGroup}.GetCustomerDirectoryList` |
| Param constant | `DBParameterName.{SpGroup}Params.CustomerEmailAddress` |
| Serilog constant | `SerilogErrorMessages.{SpGroup}LogMessages.FetchCustomerDirectoriesFailed` |

Method names = **Verb + Feature + Async**:
- GET -> `GetCustomerDirectoryListAsync`
- POST -> `AddCustomerDirectoryAsync` / `SaveCustomerDirectoryAsync`
- PUT -> `UpdateCustomerDirectoryAsync`
- DELETE -> `DeleteCustomerDirectoryAsync`

Controller action names match `APIActionName` constants. Never hard-code action strings.

---

## 3. CHECKLIST (DO IN THIS ORDER)

1. `APIActionName.cs` — action constants
2. `StoredProc.cs` — stored procedure name constants
3. `SQLParams.cs` — parameter name constants
4. `MessageCatalog.cs` — Serilog error strings
5. `Models/Output` DTO — typed result of SELECT *(skip if using the dynamic style)*
6. `Models/Input` DTO — typed body / save payload (if POST/PUT)
7. `I{Feature}Repository` — typed return or dynamic (match the chosen style)
8. `{Feature}Repository` — params + one-line SP call. If the table has `InsertedBy` / `UpdatedBy`, inject `ICurrentUserService` (rule 0.9). Save with id = 0 → `InsertedBy`. Save with id present → `UpdatedBy`. PUT / DELETE → `UpdatedBy`. Never take those values from the client.
9. `I{Feature}Service` — XML comments on class AND every method
10. `{Feature}Service` — try/catch + Serilog + ResultArgs
11. `{Feature}Controller` — one-line `ApiResultArgs` return
12. `ServiceExtension.cs` — `AddScoped` service + repository pair
13. `ImplicitUsings.cs` — global using for new namespaces (host, service, infra)

---

## 4. SUPPORTING CONSTANTS (WRITE THESE FIRST)

### 4.1 Action names — `{CommonProject}/APIActionName.cs`
```csharp
public static class API_Administration
{
    public const string GetCustomerDirectory = nameof(GetCustomerDirectory);
    public const string SaveCustomerDirectory = nameof(SaveCustomerDirectory);
    public const string DeleteCustomerDirectory = nameof(DeleteCustomerDirectory);
}
```

### 4.2 Stored procedure names — `{InfraProject}/StoredProc.cs`
```csharp
public class StoredProc
{
    public class {SpGroup}
    {
        public const string GetCustomerDirectoryList = "[{Schema}].[GetCustomerDirectory]";
        public const string AddCustomerDirectoryList = "[{Schema}].[AddCustomerDirectory]";
        public const string DeleteCustomerDirectoryList = "[{Schema}].[DeleteCustomerDirectory]";
    }
}
```

### 4.3 Parameter names — `{InfraProject}/SQLParams.cs`
```csharp
public static class DBParameterName
{
    public static class {SpGroup}Params
    {
        public const string CustomerEmailAddress = nameof(CustomerEmailAddress);
        public const string ID = nameof(ID);
        public const string InsertedBy = nameof(InsertedBy);
        public const string UpdatedBy = nameof(UpdatedBy);
        public const string ReturnValue = nameof(ReturnValue);
    }
}
```
Never pass a raw `"@Email"` string to `parameters.Add`. Always use `DBParameterName.*`.

### 4.4 Serilog messages — `{CommonProject}/MessageCatalog.cs`
```csharp
public static class SerilogErrorMessages
{
    public static class {SpGroup}LogMessages
    {
        public const string FetchCustomerDirectoriesFailed = "Error while fetching customer directories";
        public const string AddCustomerDirectoryFailed = "Error while adding customer directory";
        public const string DeleteCustomerDirectoryFailed = "Error while deleting customer directory";
    }
}
```
Service catch block:
```csharp
AppLogger.LogError(logger, ex, SerilogErrorMessages.{SpGroup}LogMessages.FetchCustomerDirectoriesFailed);
```
If the message has placeholders, pass values:
```csharp
// "GetClassCatalog failed for Org {OrgId}"
AppLogger.LogError(logger, ex, SerilogErrorMessages.{SpGroup}LogMessages.GetClassCatalogFailed, orgId);
```
Never put a raw error string in catch.

---

## 5. INPUT / OUTPUT DTOs (typed style)

Put DTOs in the Infrastructure project, not in the API host and not in the Service project.

- **Input** = request body or values sent INTO the stored procedure
  `{InfraProject}/Models/Input/{Feature}Input.cs` — namespace `{InfraProject}.Models.Input`
- **Output** = columns returned FROM the stored procedure
  `{InfraProject}/Models/Output/{Feature}Output.cs` — namespace `{InfraProject}.Models.Output`

Property names must match stored procedure column aliases so Dapper can map them.
Add XML comments on the class and on every property.
Use `JsonPropertyName` when the JSON name should differ from the C# name.

```csharp
// Output DTO (SELECT result)
namespace {InfraProject}.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.{SpGroup}.GetCustomerDirectoryList.
    /// Holds one customer directory row returned to the service and controller.
    /// </summary>
    public class CustomerDirectoryOutput
    {
        /// <summary>
        /// Gets or sets the directory record identifier.
        /// </summary>
        [JsonPropertyName("id")]
        public int ID { get; set; }

        /// <summary>
        /// Gets or sets the registered customer email address.
        /// </summary>
        [JsonPropertyName("emailAddress")]
        public string EmailAddress { get; set; } = string.Empty;
    }
}
```

```csharp
// Input DTO (POST / PUT body)
namespace {InfraProject}.Models.Input
{
    /// <summary>
    /// Input DTO used to add or update a customer directory email address.
    /// Bound from the controller request body and passed to the service and repository.
    /// </summary>
    public class CustomerDirectoryInput
    {
        /// <summary>
        /// Gets or sets the email address to register.
        /// </summary>
        [JsonPropertyName("emailAddress")]
        public string EmailAddress { get; set; } = string.Empty;
    }
}
```

**If using the dynamic style instead:** skip the Output DTO, return `Task<List<dynamic>>` / `Task<dynamic>` from the repository, and keep the rest of the flow (constants, ResultArgs, regions, XML comments) exactly the same.

---

## 6. REPOSITORY INTERFACE

File: `{InfraProject}/Interfaces/{Module}/I{Feature}Repository.cs`

Rules:
- XML comments on the interface AND on every method
- Regions by HTTP verb
- Return typed DTO / `List<T>` / `int` / `bool` — or `dynamic` / `List<dynamic>` when using the dynamic style

```csharp
namespace {InfraProject}.Interfaces.Administration
{
    /// <summary>
    /// Repository interface for Customer Directory database operations.
    /// Repository Responsibility:
    /// - Declares SELECT, INSERT, and DELETE operations against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface ICustomerDirectoryRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all customer directory records.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the list of registered customer email directories.
        /// Request Flow: ICustomerDirectoryService -> ICustomerDirectoryRepository.GetCustomerDirectoryListAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.{SpGroup}.GetCustomerDirectoryList.
        /// Response Details: Returns a list of CustomerDirectoryOutput records.
        /// </remarks>
        /// <returns>A list of customer directory output records.</returns>
        Task<List<CustomerDirectoryOutput>> GetCustomerDirectoryListAsync();

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Inserts a new customer directory email address.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new email address to the customer directory.
        /// Request Flow: ICustomerDirectoryService -> ICustomerDirectoryRepository.AddCustomerDirectoryAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Calls insert stored procedure with the email value.
        /// Repository Interaction: Executes StoredProc.{SpGroup}.AddCustomerDirectoryList.
        /// Response Details: Returns the scalar result from the stored procedure.
        /// </remarks>
        /// <param name="input">Input DTO containing the email address to add.</param>
        /// <returns>Scalar result of the insert stored procedure.</returns>
        Task<int> AddCustomerDirectoryAsync(CustomerDirectoryInput input);

        #endregion POST Methods

        #region DELETE Methods

        /// <summary>
        /// Deletes a customer directory record by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove a directory entry from the database.
        /// Request Flow: ICustomerDirectoryService -> ICustomerDirectoryRepository.DeleteCustomerDirectoryAsync() -> SQL Database.
        /// Validation Details: ID parameter mapping.
        /// Business Logic: Executes delete stored procedure.
        /// Repository Interaction: Executes StoredProc.{SpGroup}.DeleteCustomerDirectoryList.
        /// Response Details: Returns true when one or more rows were affected.
        /// </remarks>
        /// <param name="id">Directory record identifier.</param>
        /// <returns>True when deletion succeeded; otherwise false.</returns>
        Task<bool> DeleteCustomerDirectoryAsync(int id);

        #endregion DELETE Methods
    }
}
```

---

## 7. REPOSITORY IMPLEMENTATION

File: `{InfraProject}/Repositories/{Module}/{Feature}Repository.cs`

Rules:
- Primary constructor on ONE line
- Inject `IDapperHandler`. Also inject `ICurrentUserService` when the table has `InsertedBy` / `UpdatedBy` (rule 0.9)
- Build `DynamicParameters` from `DBParameterName.*`
- SP name from `StoredProc.*`
- Always `CommandType.StoredProcedure`
- Dapper call on ONE line
- No try/catch, no ResultArgs, no AppLogger
- XML comments on the class AND on every method
- Never copy audit user ids from the Input DTO or from a controller argument

Which Dapper method:
| Result | Method |
|---|---|
| List / rowset | `QueryAsync<TOutput>` (or `QueryAsync<dynamic>` in dynamic style) |
| Single scalar / return | `ExecuteScalarAsync<int>` |
| Insert / update / delete | `ExecuteAsync` then `affected > 0` |

```csharp
namespace {InfraProject}.Repositories.Administration
{
    /// <summary>
    /// Dapper implementation of ICustomerDirectoryRepository for the Administration module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to CustomerDirectoryOutput.
    /// </summary>
    public class CustomerDirectoryRepository(IDapperHandler dapperHandler, ICurrentUserService currentUserService): ICustomerDirectoryRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches customer directory rows using StoredProc.{SpGroup}.GetCustomerDirectoryList.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all customer directories from the database.
        /// Request Flow: ICustomerDirectoryService -> CustomerDirectoryRepository.GetCustomerDirectoryListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Maps stored procedure rows to CustomerDirectoryOutput.
        /// Repository Interaction: Executes StoredProc.{SpGroup}.GetCustomerDirectoryList.
        /// Response Details: Returns a list of CustomerDirectoryOutput records.
        /// </remarks>
        /// <returns>A list of customer directory output records.</returns>
        public async Task<List<CustomerDirectoryOutput>> GetCustomerDirectoryListAsync()
        {
            var parameters = new DynamicParameters();
            var result = await dapperHandler.QueryAsync<CustomerDirectoryOutput>(StoredProc.{SpGroup}.GetCustomerDirectoryList, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds a customer directory record using StoredProc.{SpGroup}.AddCustomerDirectoryList.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert a new email address into the customer directory.
        /// Request Flow: ICustomerDirectoryService -> CustomerDirectoryRepository.AddCustomerDirectoryAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds CustomerDirectoryInput to DynamicParameters and executes the insert stored procedure.
        /// Repository Interaction: Executes StoredProc.{SpGroup}.AddCustomerDirectoryList.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="input">Input DTO containing the email address to add.</param>
        /// <returns>Scalar result of the insert stored procedure.</returns>
        public async Task<int> AddCustomerDirectoryAsync(CustomerDirectoryInput input)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.{SpGroup}Params.CustomerEmailAddress, input.EmailAddress, DbType.String);
            parameters.Add(DBParameterName.{SpGroup}Params.InsertedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.{SpGroup}Params.ReturnValue, 0, DbType.Int16);
            var result = await dapperHandler.ExecuteScalarAsync<int>(StoredProc.{SpGroup}.AddCustomerDirectoryList, parameters, CommandType.StoredProcedure);
            return result;
        }

        #endregion POST Methods

        #region DELETE Methods

        /// <summary>
        /// Removes a customer directory record using StoredProc.{SpGroup}.DeleteCustomerDirectoryList.
        /// </summary>
        /// <remarks>
        /// Purpose: Delete the directory entry matching the identifier.
        /// Request Flow: ICustomerDirectoryService -> CustomerDirectoryRepository.DeleteCustomerDirectoryAsync() -> Database.
        /// Validation Details: ID parameter mapping.
        /// Business Logic: Binds the identifier and executes the delete stored procedure.
        /// Repository Interaction: Executes StoredProc.{SpGroup}.DeleteCustomerDirectoryList.
        /// Response Details: Returns true when one or more rows were affected.
        /// </remarks>
        /// <param name="id">Directory record identifier.</param>
        /// <returns>True when deletion succeeded; otherwise false.</returns>
        public async Task<bool> DeleteCustomerDirectoryAsync(int id)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.{SpGroup}Params.ID, id, DbType.Int32);
            parameters.Add(DBParameterName.{SpGroup}Params.UpdatedBy, currentUserService.UserId, DbType.Int64);
            int affected = await dapperHandler.ExecuteAsync(StoredProc.{SpGroup}.DeleteCustomerDirectoryList, parameters, CommandType.StoredProcedure);
            return affected > 0;
        }

        #endregion DELETE Methods
    }
}
```

---

## 8. SERVICE INTERFACE

File: `{ServiceProject}/Interfaces/{Module}/I{Feature}Service.cs`

Rules:
- Return `Task<ResultArgs>`
- XML comments on the interface AND on every method (use the template in section 14)
- Regions by HTTP verb

```csharp
namespace {ServiceProject}.Interfaces.Administration
{
    /// <summary>
    /// Service contract for Customer Directory operations.
    /// Acts as the business-logic layer between CustomerDirectoryController and ICustomerDirectoryRepository.
    /// Responsibility:
    /// - Declares methods to fetch, add, and delete customer directory entries.
    /// - Relies on ICustomerDirectoryRepository for stored procedure execution.
    /// </summary>
    public interface ICustomerDirectoryService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all customer directory records.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the list of registered customer email directories.
        /// Request Flow: CustomerDirectoryController -> ICustomerDirectoryService.GetCustomerDirectoryListAsync() -> ICustomerDirectoryRepository.GetCustomerDirectoryListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in ResultArgs.
        /// Repository Interaction: Calls ICustomerDirectoryRepository.GetCustomerDirectoryListAsync().
        /// Response Details: ResultArgs containing List of CustomerDirectoryOutput, or NoRecordFound.
        /// </remarks>
        /// <returns>ResultArgs containing the directory list.</returns>
        Task<ResultArgs> GetCustomerDirectoryListAsync();

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds a new customer directory email address.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert a new email address into the customer directory.
        /// Request Flow: CustomerDirectoryController -> ICustomerDirectoryService.AddCustomerDirectoryAsync() -> ICustomerDirectoryRepository.AddCustomerDirectoryAsync().
        /// Validation Details: Input DTO is required; empty email is rejected in the service.
        /// Business Logic: Passes CustomerDirectoryInput to the repository and wraps the scalar result.
        /// Repository Interaction: Calls ICustomerDirectoryRepository.AddCustomerDirectoryAsync().
        /// Response Details: ResultArgs containing the insert status.
        /// </remarks>
        /// <param name="input">Input DTO containing the email address to add.</param>
        /// <returns>ResultArgs containing the insert status.</returns>
        Task<ResultArgs> AddCustomerDirectoryAsync(CustomerDirectoryInput input);

        #endregion POST Methods

        #region DELETE Methods

        /// <summary>
        /// Deletes a customer directory record by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove a directory entry matching the provided identifier.
        /// Request Flow: CustomerDirectoryController -> ICustomerDirectoryService.DeleteCustomerDirectoryAsync() -> ICustomerDirectoryRepository.DeleteCustomerDirectoryAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Delegates delete to the repository and wraps the boolean result.
        /// Repository Interaction: Calls ICustomerDirectoryRepository.DeleteCustomerDirectoryAsync().
        /// Response Details: ResultArgs containing the deletion outcome.
        /// </remarks>
        /// <param name="id">Directory record identifier.</param>
        /// <returns>ResultArgs containing the deletion outcome.</returns>
        Task<ResultArgs> DeleteCustomerDirectoryAsync(int id);

        #endregion DELETE Methods
    }
}
```

---

## 9. SERVICE IMPLEMENTATION (ONLY layer with try/catch + Serilog)

File: `{ServiceProject}/Service/{Module}/{Feature}Service.cs`

Rules:
- Primary constructor on ONE line
- Inject `I{Feature}Repository` and `ILogger<{Feature}Service>`
- Always start with `var result = new ResultArgs();`
- try/catch around repository calls
- On null / empty: `ErrorCodes.NoRecordFound` + `ErrorMessages.NoRecordFound`
- On exception: `AppLogger.LogError` then `ErrorCodes.InternalServerError` + `ErrorMessages.InternalServerError`
- Do NOT call stored procedures from the service
- XML comments on the class AND on every method (same template as the interface)

GET pattern (Add/Update/Delete follow the same shape without the empty-check):
```csharp
public async Task<ResultArgs> GetCustomerDirectoryListAsync()
{
    var result = new ResultArgs();
    try
    {
        var data = await repository.GetCustomerDirectoryListAsync();
        if (data == null || data.Count == 0)
        {
            result.StatusCode = ErrorCodes.NoRecordFound;
            result.StatusMessage = ErrorMessages.NoRecordFound;
            return result;
        }

        result.ResultData = data;
    }
    catch (Exception ex)
    {
        AppLogger.LogError(logger, ex, SerilogErrorMessages.{SpGroup}LogMessages.FetchCustomerDirectoriesFailed);
        result.StatusCode = ErrorCodes.InternalServerError;
        result.StatusMessage = ErrorMessages.InternalServerError;
    }

    return result;
}
```

Class declaration:
```csharp
public class CustomerDirectoryService(ICustomerDirectoryRepository repository, ILogger<CustomerDirectoryService> logger): ICustomerDirectoryService
```

---

## 10. CONTROLLER (HTTP only, one-line return)

File: `{ApiHostProject}/Controllers/{Module}/{Feature}Controller.cs`

Rules:
- Inherit `BaseController` (route `api/v1/[controller]/[action]` is already set)
- Primary constructor on ONE line, inject `I{Feature}Service`
- `[ApiExplorerSettings(GroupName = SwaggerModuleDoc.{Module})]` — Swagger group constants live in `{CommonProject}/Constant.cs`
- `[ActionName(API_{Module}.{Name})]` — never a raw string
- Action body is ONE line: `return ApiResultArgs(await service.MethodAsync(...), APIHttpType.HttpGet);`
- `HttpGet` -> `APIHttpType.HttpGet`, `HttpPost` -> `APIHttpType.HttpPost`, `HttpPut` -> `APIHttpType.HttpPut`, `HttpDelete` -> `APIHttpType.HttpDelete`
- `[FromBody]` for Input DTO on POST/PUT
- No try/catch, no Serilog, no Dapper
- XML comments on the class AND on every action, including `<response>` tags

```csharp
namespace {ApiHostProject}.Controllers.Administration
{
    /// <summary>
    /// API controller for viewing and managing Customer Directories.
    /// Handles listing, saving, and deleting customer email directories.
    /// Service Responsibility:
    /// - ICustomerDirectoryService retrieves data, applies validation, and returns ResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.{Module})]
    public class CustomerDirectoryController(ICustomerDirectoryService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the list of all customer email directories.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch registered customer email directory records.
        /// Request Flow: Client API GET -> CustomerDirectoryController.GetCustomerDirectory() -> ICustomerDirectoryService.GetCustomerDirectoryListAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls ICustomerDirectoryService.GetCustomerDirectoryListAsync().
        /// Response Details: Standard API result enclosing List of CustomerDirectoryOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the directory dataset.</returns>
        /// <response code="200">Successfully fetched directory list.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetCustomerDirectory)]
        public async Task<IActionResult> GetCustomerDirectory()
        {
            return ApiResultArgs(await service.GetCustomerDirectoryListAsync(), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Saves a new customer directory email address.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new email address to the customer email directories.
        /// Request Flow: Client API POST -> CustomerDirectoryController.SaveCustomerDirectory() -> ICustomerDirectoryService.AddCustomerDirectoryAsync() -> Database.
        /// Validation Details: Model binding maps CustomerDirectoryInput from the request body.
        /// Business Logic: Registers a customer email address in the service layer.
        /// Service Interaction: Calls ICustomerDirectoryService.AddCustomerDirectoryAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing the email address to register.</param>
        /// <returns>Result of the save operation.</returns>
        /// <response code="200">Successfully saved the directory entry.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.SaveCustomerDirectory)]
        public async Task<IActionResult> SaveCustomerDirectory([FromBody] CustomerDirectoryInput input)
        {
            return ApiResultArgs(await service.AddCustomerDirectoryAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods

        #region DELETE Methods

        /// <summary>
        /// Removes a customer directory entry by its identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Delete a specific customer email directory record.
        /// Request Flow: Client API DELETE -> CustomerDirectoryController.DeleteCustomerDirectory() -> ICustomerDirectoryService.DeleteCustomerDirectoryAsync() -> Database.
        /// Validation Details: Route parameter binding maps the identifier.
        /// Business Logic: Deletes the directory entry matching the identifier in the service layer.
        /// Service Interaction: Calls ICustomerDirectoryService.DeleteCustomerDirectoryAsync().
        /// Response Details: Standard API result representing the deletion outcome.
        /// </remarks>
        /// <param name="id">Identifier of the directory entry to delete.</param>
        /// <returns>Standardized success or failure response.</returns>
        /// <response code="200">Successfully deleted the directory entry.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpDelete]
        [ActionName(API_Administration.DeleteCustomerDirectory)]
        public async Task<IActionResult> DeleteCustomerDirectory(int id)
        {
            return ApiResultArgs(await service.DeleteCustomerDirectoryAsync(id), APIHttpType.HttpDelete);
        }

        #endregion DELETE Methods
    }
}
```

---

## 11. SERVICE EXTENSION (DI)

File: `{ApiHostProject}/ServiceExtension.cs` — `Program.cs` already calls `builder.Services.AddDIServicesSetup();`

Register the service and repository as a scoped pair:
```csharp
// {Module} services and repository
services.AddScoped<ICustomerDirectoryService, CustomerDirectoryService>();
services.AddScoped<ICustomerDirectoryRepository, CustomerDirectoryRepository>();
```
Do not inject the concrete class into the controller.
Keep the existing grouping comments in `AddDIServicesSetup`.

---

## 12. IMPLICIT USINGS

When you add a NEW namespace, add a global using in that project's `ImplicitUsings.cs`.
Do not add using statements inside controller / service / repository files if a global using already exists.

**API host** — `{ApiHostProject}/ImplicitUsings.cs`:
```csharp
global using {ServiceProject}.Interfaces.{Module};
global using {ServiceProject}.Service.{Module};
global using {InfraProject}.Interfaces.{Module};
global using {InfraProject}.Repositories.{Module};
global using {InfraProject}.Models.Input;
global using {InfraProject}.Models.Output;
global using static {CommonProject}.APIActionName;
global using static {CommonProject}.Constant;
```

**Service project** — `{ServiceProject}/ImplicitUsings.cs`:
```csharp
global using {InfraProject}.Interfaces.{Module};
global using {InfraProject}.Models.Input;
global using {InfraProject}.Models.Output;
global using {ServiceProject}.Interfaces.{Module};
global using {CommonProject};
```

**Infrastructure project** — `{InfraProject}/ImplicitUsings.cs`:
```csharp
global using Dapper;
global using {InfraProject}.Interfaces.{Module};
global using {InfraProject}.Models.Input;
global using {InfraProject}.Models.Output;
global using CFR.CommonService.Interfaces;
global using static {InfraProject}.StoredProc;
```

If the compiler cannot find `I{Feature}Service` in the controller, the global using is missing in `ImplicitUsings.cs` (not a missing using in the controller file).

---

## 13. RESULTARGS AND ERROR CODES

Service always returns `ResultArgs` from `{CommonProject}`:
```
result.StatusCode    = ErrorCodes.*
result.StatusMessage = ErrorMessages.*
result.ResultData    = typed DTO, list, or dynamic
```

Common codes:
| Code | Constant | Message |
|---|---|---|
| 200 | `ErrorCodes.Success` | `ErrorMessages.Success` |
| 201 | `ErrorCodes.Created` | |
| 202 | `ErrorCodes.Updated` | |
| 203 | `ErrorCodes.Failed` | |
| 204 | `ErrorCodes.NoRecordFound` | `ErrorMessages.NoRecordFound` |
| 205 | `ErrorCodes.Deleted` | |
| 400 | `ErrorCodes.BadRequest` | |
| 401 | `ErrorCodes.UnAuthorized` | |
| 404 | `ErrorCodes.NotFound` | |
| 409 | `ErrorCodes.Conflict` | |
| 500 | `ErrorCodes.InternalServerError` | `ErrorMessages.InternalServerError` |

JSON envelope returned by `BaseController.ApiResultArgs`:
```json
{
  "statusCode": 200,
  "statusMessage": "Success",
  "resultData": { },
  "errors": [],
  "traceId": "guid",
  "timestamp": "2026-08-27T12:00:00Z"
}
```

---

## 14. XML COMMENT TEMPLATE (copy for every public method)

**Controller action:**
```csharp
/// <summary>
/// One-line description of the HTTP action.
/// </summary>
/// <remarks>
/// Purpose: Why this endpoint exists.
/// Request Flow: Client API GET|POST|PUT|DELETE -> {Controller}.{Action}() -> I{Feature}Service.{Method}Async() -> Database.
/// Validation Details: What is bound or checked at the controller.
/// Business Logic: None at the controller level; delegates to the service layer.
/// Service Interaction: Calls I{Feature}Service.{Method}Async().
/// Response Details: Standard API result with status 200 or 500.
/// </remarks>
/// <param name="name">Parameter meaning.</param>
/// <returns>What the client receives.</returns>
/// <response code="200">Success message.</response>
/// <response code="500">Internal server error occurred.</response>
```

**Service interface / service method:**
```csharp
/// <summary>
/// One-line description of the business operation.
/// </summary>
/// <remarks>
/// Purpose: Why this method exists.
/// Request Flow: {Controller} -> {Service}.{Method}Async() -> I{Feature}Repository.{Method}Async().
/// Validation Details: Null / empty / business checks.
/// Business Logic: What the service does besides calling the repository.
/// Repository Interaction: Calls I{Feature}Repository.{Method}Async().
/// Response Details: ResultArgs with data, NoRecordFound, or InternalServerError.
/// </remarks>
/// <param name="name">Parameter meaning.</param>
/// <returns>ResultArgs containing the operation result.</returns>
```

**Repository interface / repository method:**
```csharp
/// <summary>
/// One-line description of the data operation.
/// </summary>
/// <remarks>
/// Purpose: Why this method exists.
/// Request Flow: I{Feature}Service -> {Repository}.{Method}Async() -> Database.
/// Validation Details: Parameter mapping only.
/// Business Logic: Builds DynamicParameters and executes the stored procedure.
/// Repository Interaction: Executes StoredProc.{SpGroup}.{Name}.
/// Response Details: Typed DTO, list, int, bool, or dynamic.
/// </remarks>
/// <param name="name">Parameter meaning.</param>
/// <returns>Typed or dynamic data-access result.</returns>
```

**DTO class:**
```csharp
/// <summary>
/// Input or output DTO for {Feature}. Mapped to stored procedure {Name}.
/// </summary>
```

**DTO property:**
```csharp
/// <summary>
/// Gets or sets the {property meaning}.
/// </summary>
```

---

## 15. WHAT EACH LAYER MUST NOT DO

**Controller**
- Do not: try/catch, Serilog, Dapper, StoredProc, DynamicParameters, business rules
- Do not: split the action into `var result` + `return` (use one return line)

**Service**
- Do not: DynamicParameters, StoredProc, CommandType.StoredProcedure, QueryAsync
- Do not: skip XML comments on any public method
- Do not: mix typed DTOs and dynamic for the same feature — follow the style chosen for the feature

**Repository**
- Do not: try/catch, ResultArgs, AppLogger, HTTP types
- Do not: mix typed and dynamic returns within one feature (pick DTOs OR dynamic — see rule 0.5)
- Do not: split the Dapper call across multiple lines
- Do not: hard-code SP names or parameter names
- Do not: take `InsertedBy` / `UpdatedBy` from the client, Input DTO, or a service method argument — read `ICurrentUserService.UserId` in the repository (rule 0.9)
- Do not: pass both `InsertedBy` and `UpdatedBy` on the same save call
- Do not: pass `UpdatedBy` when id is 0 (insert), or `InsertedBy` when id is present (update) / status / delete
- Do not: leave unused `using` statements (rule 0.10)

---

## 16. MULTIPLE API HOSTS (same pattern)

When the solution has several API hosts (microservices), the same rules apply to every one of them — only the project names change:

| Host | Service | Infrastructure |
|---|---|---|
| `{Company}.{HostA}` | `{Company}.{HostA}Service` | `{Company}.{HostA}Infrastructure` |
| `{Company}.{HostB}` | `{Company}.{HostB}Service` | `{Company}.{HostB}Infrastructure` |

Each host has: `ServiceExtension.cs`, `ImplicitUsings.cs`, `Controllers/{Module}/`
Each infrastructure project has: `StoredProc.cs`, `SQLParams.cs` (`DBParameterName`), `Models/Input/`, `Models/Output/`, `Repositories/`
Each service project has: `Interfaces/{Module}/`, `Service/{Module}/`, `ImplicitUsings.cs`
