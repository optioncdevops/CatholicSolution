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
            if (string.IsNullOrWhiteSpace(env))
            {
                env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            }
            if (string.IsNullOrWhiteSpace(env))
            {
                env = tempConfig["Environment"];
            }

            builder.AddJsonFile($"appsettings.{env}.json", optional: true, reloadOnChange: true)
                   .AddEnvironmentVariables();

            return builder.Build();
        }
    }
}