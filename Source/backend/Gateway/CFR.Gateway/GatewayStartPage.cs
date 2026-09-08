// Copyright (c) OptionC. All rights reserved.

namespace CFR.Gateway;

/// <summary>
/// Gateway home page: pick Swagger or Scalar, and shows both public API path shapes.
/// </summary>
internal static class GatewayStartPage
{
    internal static string Html()
    {
        return """
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
                    <p>Both shapes are proxied to the same microservices:</p>
                    <ul>
                        <li>Existing: <code>/api/v1/{controller}/{action}</code> — Portal controllers (<code>CFRLaunch</code>, <code>PortalLogin</code>) go to Portal; all other controllers go to Acutis.</li>
                        <li>Service: <code>/portal/api/v1/{controller}/{action}</code> and <code>/acutis/api/v1/{controller}/{action}</code></li>
                    </ul>
                </div>
            </body>
            </html>
            """;
    }
}
