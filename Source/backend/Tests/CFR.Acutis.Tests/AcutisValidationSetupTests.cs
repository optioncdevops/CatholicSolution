// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;

using CFR.Acutis;
using CFR.AcutisInfrastructure.Models.Input;
using CFR.Common;
using CFR.DBEngine;

using Microsoft.AspNetCore.Mvc.ModelBinding;

using Xunit;

namespace CFR.Acutis.Tests;

/// <summary>
/// Covers two things: (1) that the request DTOs' DataAnnotations actually catch the malformed
/// inputs docs/acutis-auth-spec/validation-standard.md §1 requires (missing fields, whitespace,
/// invalid email), using <see cref="Validator.TryValidateObject(object, ValidationContext, ICollection{ValidationResult}?, bool)"/>
/// directly — no HTTP host needed; and (2) that <see cref="AcutisValidationSetup.BuildInvalidModelStateResult"/>
/// shapes a <see cref="ModelStateDictionary"/> failure into the same <see cref="MSResultArgs"/>
/// envelope every other Acutis response uses, with camelCase field names and no submitted value
/// ever echoed back.
/// </summary>
public class AcutisValidationSetupTests
{
    private static List<ValidationResult> Validate(object dto)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(dto, new ValidationContext(dto), results, validateAllProperties: true);
        return results;
    }

    // --- DTO-level DataAnnotations ---

    [Fact]
    public void AcutisLoginRequest_MissingFields_FailsValidation()
    {
        var results = Validate(new AcutisLoginRequest { UserName = string.Empty, Password = string.Empty });

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisLoginRequest.UserName)));
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisLoginRequest.Password)));
    }

    [Theory]
    [InlineData("   ")]
    [InlineData("not-an-email")]
    [InlineData("missing-at-sign.test")]
    public void AcutisLoginRequest_InvalidEmailFormat_FailsValidation(string invalidUserName)
    {
        var results = Validate(new AcutisLoginRequest { UserName = invalidUserName, Password = "whatever" });

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisLoginRequest.UserName)));
    }

    [Fact]
    public void AcutisLoginRequest_ValidEmailAndPassword_PassesValidation()
    {
        var results = Validate(new AcutisLoginRequest { UserName = "dev.acutis@example.test", Password = "whatever" });

        Assert.Empty(results);
    }

    [Fact]
    public void AcutisForgotPasswordRequest_InvalidEmail_FailsValidation()
    {
        var results = Validate(new AcutisForgotPasswordRequest { Email = "not-an-email" });

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisForgotPasswordRequest.Email)));
    }

    [Fact]
    public void AcutisResetPasswordRequest_MissingFields_FailsValidation()
    {
        var results = Validate(new AcutisResetPasswordRequest { Token = string.Empty, NewPassword = string.Empty, ConfirmPassword = string.Empty });

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisResetPasswordRequest.Token)));
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisResetPasswordRequest.NewPassword)));
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisResetPasswordRequest.ConfirmPassword)));
    }

    [Fact]
    public void AcutisChangePasswordRequest_MissingFields_FailsValidation()
    {
        var results = Validate(new AcutisChangePasswordRequest { CurrentPassword = string.Empty, NewPassword = string.Empty, ConfirmPassword = string.Empty });

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisChangePasswordRequest.CurrentPassword)));
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisChangePasswordRequest.NewPassword)));
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(AcutisChangePasswordRequest.ConfirmPassword)));
    }

    // --- ModelState -> MSResultArgs shaping ---

    [Fact]
    public void BuildInvalidModelStateResult_ReturnsBadRequestEnvelope()
    {
        var modelState = new ModelStateDictionary();
        modelState.AddModelError("Password", "The Password field is required.");

        MSResultArgs result = AcutisValidationSetup.BuildInvalidModelStateResult(modelState);

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
        Assert.NotEmpty(result.Errors);
    }

    [Fact]
    public void BuildInvalidModelStateResult_ConvertsFieldNamesToCamelCase()
    {
        var modelState = new ModelStateDictionary();
        modelState.AddModelError("NewPassword", "The NewPassword field is required.");
        modelState.AddModelError("UserName", "The UserName field is not a valid e-mail address.");

        MSResultArgs result = AcutisValidationSetup.BuildInvalidModelStateResult(modelState);

        Assert.Contains(result.Errors, e => e.Field == "newPassword");
        Assert.Contains(result.Errors, e => e.Field == "userName");
        Assert.DoesNotContain(result.Errors, e => e.Field == "NewPassword" || e.Field == "UserName");
    }

    [Fact]
    public void BuildInvalidModelStateResult_NeverEchoesTheSubmittedValue()
    {
        // A real submitted (invalid) password/token value must never appear in the error output —
        // only the DataAnnotations-authored message, which never contains the raw input.
        const string sensitiveAttemptedValue = "SuperSecretPassword123!";
        var modelState = new ModelStateDictionary();
        modelState.AddModelError("NewPassword", "The NewPassword field is not in the correct format.");

        MSResultArgs result = AcutisValidationSetup.BuildInvalidModelStateResult(modelState);

        Assert.DoesNotContain(result.Errors, e => e.Message.Contains(sensitiveAttemptedValue));
        Assert.DoesNotContain(result.Errors, e => e.Field.Contains(sensitiveAttemptedValue));
    }

    [Fact]
    public void BuildInvalidModelStateResult_MissingErrorMessage_FallsBackToGenericMessage()
    {
        var modelState = new ModelStateDictionary();
        modelState.AddModelError("Token", string.Empty);

        MSResultArgs result = AcutisValidationSetup.BuildInvalidModelStateResult(modelState);

        Assert.Contains(result.Errors, e => e.Field == "token" && !string.IsNullOrWhiteSpace(e.Message));
    }
}
