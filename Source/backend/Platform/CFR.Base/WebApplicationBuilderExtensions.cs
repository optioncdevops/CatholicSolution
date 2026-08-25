// Copyright (c) OptionC. All rights reserved.

namespace CFR.Base
{
    public static class WebApplicationBuilderExtensions
    {
        /// <summary>
        ///  var builder = WebApplication.CreateBuilder(args).UseSecureKestrel();  in program.cs files
        /// </summary>
        /// <param name="builder"></param>
        /// <returns></returns>
        public static WebApplicationBuilder UseSecureKestrel(this WebApplicationBuilder builder)
        {
            ArgumentNullException.ThrowIfNull(builder);

            builder.WebHost.ConfigureKestrel(options =>
            {
                options.AddServerHeader = false;
            });

            return builder;
        }
    }
}