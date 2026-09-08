// Copyright (c) OptionC. All rights reserved.

namespace CFR.Base;

public static class DefaultData
{
    public const string WebStartPage = @"<!DOCTYPE html>
<html>
<head>
    <title>{0}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0;
        }

        .wrapper {
            display: flex;
            gap: 30px; /* space between panels */
        }

        .container {
            text-align: center;
            background-color: #fff;
            padding: 40px 60px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            min-width: 250px;
        }

        h1 {
            color: #333;
            font-size: 20px;
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
    <div class=""wrapper"">
        <div class=""container"">
            <h1>Welcome to {0} API Service!</h1>
            <a href=""/swagger"">Swagger UI</a>
        </div>

        <div class=""container"">
            <h1>Welcome to {0} API Service!</h1>
            <a href=""/scalar"">Scalar UI</a>
        </div>
    </div>
</body>
</html>";
}