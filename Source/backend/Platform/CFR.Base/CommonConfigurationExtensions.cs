// Copyright (c) OptionC. All rights reserved.

using Microsoft.Extensions.Configuration;

namespace CFR.Base
{
    public static class ConfigurationExtensions
    {
        public static IConfigurationBuilder AddCustomConfiguration(this IConfigurationBuilder builder)
        {
            // Step 1: Create a temporary config to read "Environment" from appsettings.json
            var tempConfig = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddEnvironmentVariables()
                .Build(); // Build the temporary configuration

            // IIS usually sets ASPNETCORE_ENVIRONMENT; this repo also uses a custom "Environment" key.
            string env =
                Environment.GetEnvironmentVariable("Environment")
                ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                ?? tempConfig["Environment"]
                ?? "Live";

            // Step 3: Build the final configuration with the correct environment
            builder
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env}.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            return builder;
        }
    }
}