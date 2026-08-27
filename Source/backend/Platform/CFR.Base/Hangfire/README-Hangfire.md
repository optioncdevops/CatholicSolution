# Hangfire Architecture Documentation

This document describes the design, integration, and usage guidelines for the **independent, isolated Hangfire architecture** in the LNTHCIApps backend.

---

## 🏛️ Architecture

To preserve microservice autonomy and avoid single points of failure or database sharing, we employ a **Distributed, Isolated Hangfire Model**:

* **Isolated Storage**: Each microservice maintains its own Postgres Hangfire schema. There is **no shared database** between microservice schedulers.
* **Isolated Server**: Each microservice runs its own Hangfire Background Job Server inside its own host process.
* **No Direct RPC**: Background jobs in one microservice must **never** perform direct database modifications on another microservice's tables, nor call another service's internal APIs directly. They should use the API Gateway or existing message broker integration (RabbitMQ) if asynchronous inter-service communication is required.
* **Hidden Behind Abstraction**: The core Application layer has **zero dependencies** on the `Hangfire` package. Schedulers and runners are hidden entirely behind the `IBackgroundJobService` interface.

---

## 📂 Folder Structure

The reusable infrastructure lives inside the **`CFR.Base`** platform project:

```
Platform/CFR.Base/Hangfire/
├── Constants/
│   └── QueueNames.cs                  # Standardized queue names (default, emails, reports, etc.)
├── Options/
│   └── HangfireOptions.cs             # Strongly-typed configuration class
├── Jobs/
│   ├── IBackgroundJobService.cs       # Clean abstraction interface for scheduling jobs
│   └── HangfireBackgroundJobService.cs# Hangfire wrapper implementing IBackgroundJobService
├── Dashboard/
│   └── DashboardAuthorizationFilter.cs# Authorization filter to secure the dashboard in production
├── Diagnostics/
│   └── HangfireHealthCheck.cs         # Connection and active server health diagnostics
├── Extensions/
│   ├── HangfireCorrelationIdFilter.cs # Automatically sets CorrelationId on client creation
│   └── HangfireJobLoggerFilter.cs    # Intercepts performing/performed states for Logging
├── Scheduling/
│   └── IRecurringJobRegistrar.cs      # Interface for self-registering recurring jobs
└── Configuration/
    ├── HangfireServiceCollectionExtensions.cs  # Register services & PostgreSQL storage
    └── HangfireApplicationBuilderExtensions.cs # Enable dashboard & run registrars
```

---

## ⚙️ Configuration

Hangfire is configured using strongly typed options bound to the `"Hangfire"` section in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "ConnString": "Host=127.0.0.1;Database=lnt_rebarpro;Username=postgres;Password=..."
  },
  "Hangfire": {
    "Enabled": true,
    "DashboardEnabled": true,
    "DashboardPath": "/hangfire",
    "WorkerCount": 10,
    "RetryCount": 3,
    "BackoffIntervalInSeconds": 5,
    "Queues": [ "default", "reports" ]
  }
}
```

### Options Description

| Key | Type | Description |
| :--- | :--- | :--- |
| `Enabled` | `bool` | Enables or disables the entire Hangfire processing server & DB connection. |
| `DashboardEnabled` | `bool` | Controls whether the Dashboard UI is mapped. |
| `DashboardPath` | `string` | URL route segment for the Hangfire Dashboard (default: `/hangfire`). |
| `WorkerCount` | `int` | Number of concurrent execution threads on the host process server. |
| `ConnectionString` | `string` | Explicit connection string for Hangfire PostgreSQL storage (falls back to `ConnString` if null). |
| `RetryCount` | `int` | Max attempts for failed jobs with exponential backoff delays. |
| `BackoffIntervalInSeconds` | `int` | Delay factor used for the backoff calculation (e.g. 5s initial, then 10s, 20s). |
| `Queues` | `string[]` | Queues this Hangfire server will poll for jobs (default: `[ "default" ]`). |

---

## 🚀 Adding a New Job

Background jobs must be written as **clean C# classes** following the orchestration pattern:

1. **Orchestration Only**: Keep jobs thin. They should coordinate and invoke business logic residing inside **Application Services**, not implement business logic directly.
2. **Dependency Injection**: Use constructor injection for all dependencies.
3. **Cancellation Token**: Always accept a `CancellationToken` in your job methods so Hangfire can gracefully abort them.
4. **Idempotent Design**: Ensure executing the job twice with the same inputs has no side effects.

### Job Class Example

```csharp
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

public class SendInvoiceEmailJob
{
    private readonly IMailService _mailService;
    private readonly ILogger<SendInvoiceEmailJob> _logger;

    public SendInvoiceEmailJob(IMailService mailService, ILogger<SendInvoiceEmailJob> logger)
    {
        _mailService = mailService;
        _logger = logger;
    }

    public async Task RunAsync(long invoiceId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing invoice email delivery for ID: {InvoiceId}", invoiceId);
        
        // Trigger business service logic
        await _mailService.SendInvoiceEmailAsync(invoiceId, cancellationToken);
    }
}
```

---

## 📅 Scheduling Jobs

Use the constructor-injected **`IBackgroundJobService`** abstraction to interact with Hangfire in your controllers or services.

### Enqueuing a Fire-and-Forget Job
```csharp
_backgroundJobService.Enqueue<SendInvoiceEmailJob>(job => job.RunAsync(invoiceId, CancellationToken.None));
```

### Scheduling a Delayed Job
```csharp
_backgroundJobService.Schedule<SendInvoiceEmailJob>(
    job => job.RunAsync(invoiceId, CancellationToken.None), 
    TimeSpan.FromMinutes(30));
```

### Creating a Parent-Child Job Continuation
```csharp
var jobId = _backgroundJobService.Enqueue<SendInvoiceEmailJob>(
    job => job.RunAsync(invoiceId, CancellationToken.None));

_backgroundJobService.ContinueJobWith<AuditLogJob>(
    jobId, 
    job => job.LogCompletionAsync(invoiceId));
```

---

## ⏰ Recurring Jobs

To register recurring tasks automatically at startup:

1. Create a class implementing **`IRecurringJobRegistrar`** in your application project.
2. Register it as a transient dependency in your dependency injection container.
3. Define the scheduling inside the `RegisterJobs()` method using `IBackgroundJobService`.

### Example Registrar

```csharp
using CFR.Base.Hangfire.Jobs;
using CFR.Base.Hangfire.Scheduling;

public class CleanupJobRegistrar : IRecurringJobRegistrar
{
    private readonly IBackgroundJobService _jobService;

    public CleanupJobRegistrar(IBackgroundJobService jobService)
    {
        _jobService = jobService;
    }

    public void RegisterJobs()
    {
        // Executes every day at midnight on the 'default' queue
        _jobService.AddOrUpdateRecurring<DatabaseCleanupJob>(
            "db-cleanup-task",
            job => job.PurgeOldLogsAsync(CancellationToken.None),
            "0 0 * * *");
    }
}
```

### DI Registration
```csharp
services.AddTransient<IRecurringJobRegistrar, CleanupJobRegistrar>();
```

---

## 🚦 Best Practices

* **Always Use Async/Await**: Avoid blocking code (`.Wait()`, `.Result`) to keep Hangfire worker threads free.
* **Keep Job Arguments Small**: Do not pass large object payloads in job signatures. Pass primary database keys (e.g., `Guid`, `long`) and retrieve entity state inside the job execution context.
* **Log using Standard Mechanisms**: Always rely on standard `ILogger` within your job classes. Global infrastructure filters automatically capture start, completion, failure, correlation IDs, and elapsed times.
* **Configure Queue Isolation**: Direct sensitive, time-critical tasks (e.g. emails) to dedicated queues like `emails` to prevent them from being starved by long-running reports on the `default` queue.
