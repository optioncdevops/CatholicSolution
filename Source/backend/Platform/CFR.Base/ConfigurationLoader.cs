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
            // An "Environment" OS/process environment variable (e.g. set on the IIS app pool)
            // overrides the literal value baked into appsettings.json — without this, a deployed
            // server can never select its own appsettings.{Environment}.json purely via an
            // environment variable, since .AddEnvironmentVariables() below is only added AFTER this
            // decision and only affects individual keys, not which env-specific file gets loaded.
            string? env = Environment.GetEnvironmentVariable("Environment");
            if (string.IsNullOrWhiteSpace(env))
            {
                env = tempConfig["Environment"]; // Read environment after initial load
            }

            builder.AddJsonFile($"appsettings.{env}.json", optional: true, reloadOnChange: true)
                   .AddEnvironmentVariables();

            return builder.Build();
        }
    }
}