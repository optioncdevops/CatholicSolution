// Copyright (c) OptionC. All rights reserved.

using Microsoft.Extensions.Configuration;

namespace CFR.Base
{
    public static class ConfigurationLoader
    {
        public static IConfiguration LoadConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

            var tempConfig = builder.Build();
            // IIS usually sets ASPNETCORE_ENVIRONMENT; this repo also uses a custom "Environment" key.
            // Either process variable overrides the value baked into appsettings.json so a deployed
            // host can load appsettings.{Environment}.json without editing the file on the server.
            string? env = Environment.GetEnvironmentVariable("Environment");
            string envSource = "Environment variable";
            if (string.IsNullOrWhiteSpace(env))
            {
                env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                envSource = "ASPNETCORE_ENVIRONMENT variable";
            }
            if (string.IsNullOrWhiteSpace(env))
            {
                // Neither process env var is set on this host - silently falling back to whatever
                // is baked into the base appsettings.json ("Development" in source control) has
                // previously caused a Pilot/Staging/Live IIS site to load appsettings.Development.json
                // on top of its own settings (wrong Doc_BasePath, a loopback ApiBaseUrl, etc.) with no
                // visible error - only a symptom like a missing email logo, days or weeks later. This
                // is logged loudly at startup specifically so that failure mode is visible immediately
                // in the IIS/console log instead of being diagnosed backwards from a broken feature.
                env = tempConfig["Environment"];
                envSource = "appsettings.json fallback (no Environment/ASPNETCORE_ENVIRONMENT variable set on this host)";
            }

            Console.WriteLine($"[ConfigurationLoader] Resolved Environment = '{env}' (source: {envSource}).");

            builder.AddJsonFile($"appsettings.{env}.json", optional: true, reloadOnChange: true)
                   .AddEnvironmentVariables();

            return builder.Build();
        }
    }
}