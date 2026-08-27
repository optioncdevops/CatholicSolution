// Copyright (c) OptionC. All rights reserved.

using CFR.Common;
using CFR.DBEngine;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.DependencyInjection;

namespace CFR.Acutis;

/// <summary>
/// Makes a DataAnnotations model-binding failure (e.g. a missing/malformed
/// <c>AcutisLoginRequest.Password</c>) return the same <see cref="MSResultArgs"/> envelope every
/// other Acutis response uses, instead of ASP.NET Core's default <c>ValidationProblemDetails</c>
/// shape. Without this, the frontend's <c>apiRequest</c> (which parses
/// <c>{statusCode, statusMessage, resultData}</c>) cannot read a DataAnnotations failure's field
/// errors at all — it would only see a generic "Request failed (400)". `CFR.Acutis`-only, layered
/// via <c>IServiceCollection.Configure&lt;ApiBehaviorOptions&gt;</c> exactly like
/// <see cref="AcutisAuthenticationHardening"/> layers JWT hardening — <c>CFR.Base</c>,
/// <c>CFR.Gateway</c>, and <c>CFR.Portal</c> are unaffected. See
/// docs/acutis-auth-spec/validation-standard.md.
/// </summary>
public static class AcutisValidationSetup
{
    public static IServiceCollection AddAcutisValidationSetup(this IServiceCollection services)
    {
        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = context => new BadRequestObjectResult(BuildInvalidModelStateResult(context.ModelState));
        });

        return services;
    }

    /// <summary>
    /// Pure, directly-unit-testable core of the factory above — no <c>ActionContext</c>/host
    /// required, only a <see cref="ModelStateDictionary"/>. Never includes a submitted value (only
    /// the DataAnnotations-authored message, e.g. "The Password field is required."), so a
    /// malformed password/token value is never echoed back in a validation error.
    /// </summary>
    public static MSResultArgs BuildInvalidModelStateResult(ModelStateDictionary modelState)
    {
        List<ErrorDetail> errors = modelState
            .Where(kvp => kvp.Value?.Errors.Count > 0)
            .SelectMany(kvp => kvp.Value!.Errors.Select(error => new ErrorDetail(
                ToCamelCase(kvp.Key),
                string.IsNullOrWhiteSpace(error.ErrorMessage) ? "This field is invalid." : error.ErrorMessage)))
            .ToList();

        return new MSResultArgs
        {
            StatusCode = ErrorCodes.BadRequest,
            StatusMessage = "One or more fields are invalid.",
            Errors = errors,
        };
    }

    /// <summary>DataAnnotations reports the C# property name (PascalCase); the frontend's field
    /// names are camelCase (matching System.Text.Json's default policy used everywhere else on
    /// this API) — converted here so <c>Errors[].field</c> always matches what the frontend expects,
    /// with no per-call mapping needed on either side.</summary>
    private static string ToCamelCase(string field) =>
        string.IsNullOrEmpty(field) ? field : char.ToLowerInvariant(field[0]) + field[1..];
}
