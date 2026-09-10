// Copyright (c) OptionC. All rights reserved.

using System.Net;
using System.Text;

namespace CFR.Gateway;

/// <summary>
/// Gateway home page: pick Swagger or Scalar, and lists each configured service path.
/// </summary>
internal static class GatewayStartPage
{
    internal static string Html(IConfiguration configuration)
    {
        var paths = new StringBuilder();
        foreach (GatewayServiceDefinition service in GatewayServiceCatalog.Load(configuration))
        {
            string label = WebUtility.HtmlEncode(service.Label);
            string prefix = WebUtility.HtmlEncode(service.PathPrefix);
            paths.Append("<li>").Append(label).Append(": <code>").Append(prefix).Append("/api/v1/{controller}/{action}</code></li>");
        }

        return $$"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>CFR.Gateway</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        background-color: #f0f0f0;
                    }

                    .wrapper {
                        display: flex;
                        gap: 30px;
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .container {
                        text-align: center;
                        background-color: #fff;
                        padding: 40px 60px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        min-width: 250px;
                    }

                    .paths {
                        margin-top: 30px;
                        background-color: #fff;
                        padding: 24px 32px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        max-width: 720px;
                    }

                    h1 {
                        color: #333;
                        font-size: 20px;
                    }

                    p, li {
                        color: #444;
                        font-size: 14px;
                        line-height: 1.5;
                    }

                    code {
                        font-size: 13px;
                    }

                    a {
                        display: inline-block;
                        margin-top: 10px;
                        text-decoration: none;
                        color: #007bff;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="container">
                        <h1>Welcome to CFR.Gateway API Service!</h1>
                        <a href="/swagger">Swagger UI</a>
                    </div>
                    <div class="container">
                        <h1>Welcome to CFR.Gateway API Service!</h1>
                        <a href="/scalar">Scalar UI</a>
                    </div>
                </div>
                <div class="paths">
                    <h1>API paths</h1>
                    <p>Every microservice is reached through its gateway prefix. Add a new service in <code>Gateway:Services</code>.</p>
                    <ul>
                        {{paths}}
                    </ul>
                </div>
            </body>
            </html>
            """;
    }
}
