// Copyright (c) OptionC. All rights reserved.

// <copyright file="JWTSetting.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace CFR.Base;

public class JWTSetting
{
    public string? SecurityKey { get; set; }

    public string? AllowOrigin { get; set; }

    public string? Audience { get; set; }

    public string? Issuer { get; set; }

    public string? ScriptPath { get; set; }
}
