// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common;

public class LoginRequest
{
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public long SchoolId { get; set; }
    public short IsSuperAdmin { get; set; }
    public string LoginTransferId { get; set; } = string.Empty;
}

public class LoginResponse
{
    public bool IsAuthenticated { get; set; }
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserContextData UserContext { get; set; } = new();
    /// <summary>OptionCMM-style filtered top nav for the resolved layout.</summary>
    public MattMoneyNavigationResult Navigation { get; set; } = new();
}

public class SignupRequest
{
    public string SchoolEmail { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public int SchoolType { get; set; }
    public string TelegramSkypePhone { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int IsMMPlatform { get; set; }
}

public class SignupResponse
{
    public bool IsRegistered { get; set; }
    public bool AlreadyExists { get; set; }
}

/// <summary>Legacy Home/CheckDuplicateUserName — username is organization signup email.</summary>
public class CheckDuplicateUserNameRequest
{
    public string UserName { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string UserName { get; set; } = string.Empty;
}

public class ForgotPasswordResponse
{
    public bool IsReset { get; set; }
}

public class ForgotPasswordUserDetail
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class VerifyCurrentPasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
}

public class VerifyCurrentPasswordResponse
{
    public bool IsValid { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ChangePasswordResponse
{
    public bool IsChanged { get; set; }
}
