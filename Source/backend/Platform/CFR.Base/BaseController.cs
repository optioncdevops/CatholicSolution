// Copyright (c) OptionC. All rights reserved.

// <copyright file="BaseController.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using CFR.Common;
using CFR.DBEngine;

using Serilog;
using Serilog.Context;

using Swashbuckle.AspNetCore.Annotations;

namespace CFR.Base;

[ApiController]
[Route(Constant.ApiRouteConstants.APIController)]
[Produces(Constant.InputType.ApplicationJson)]
//[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[SwaggerResponse(StatusCodes.Status200OK, "Request successful.")]
[SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid request: The item data is incomplete or incorrect.")]
[SwaggerResponse(StatusCodes.Status404NotFound, "Resource not found.")]
[SwaggerResponse(StatusCodes.Status409Conflict, "Resource already exists.")]
[SwaggerResponse(StatusCodes.Status500InternalServerError, "An internal server error occurred.")]
public class BaseController : ControllerBase
{
    [ApiExplorerSettings(IgnoreApi = true)]
    public void AuditSeriLog(string userId, string controllerName = "", string actionName = "", string changeData = "", string message = "Dashboard")
    {
        _ = LogContext.PushProperty("UserId", userId);
        _ = LogContext.PushProperty("ControllerName", controllerName);
        _ = LogContext.PushProperty("ActionName", actionName);
        using (LogContext.PushProperty("ChangeData", changeData))
        {
            Log.Information(message);
        }
    }

    [ApiExplorerSettings(IgnoreApi = true)]
    public void AuditSeriLog(string controllerName = "", string actionName = "", string changeData = "", string message = "Dashboard")
    {
        _ = LogContext.PushProperty("ControllerName", controllerName);
        _ = LogContext.PushProperty("ActionName", actionName);
        using (LogContext.PushProperty("ChangeData", changeData))
        {
            Log.Information(message);
        }
    }

    [ApiExplorerSettings(IgnoreApi = true)]
    public void AuditSeriLog(string changeData = "", string message = "Dashboard")
    {
        _ = LogContext.PushProperty("ControllerName", ControllerContext.ActionDescriptor.ControllerName);
        _ = LogContext.PushProperty("ActionName", ControllerContext.ActionDescriptor.ActionName);
        using (LogContext.PushProperty("ChangeData", changeData))
        {
            Log.Information(message);
        }
    }

    /// <summary>
    /// Handles MSResultArgs and returns an appropriate IActionResult.
    /// </summary>
    /// <param name="resultArgs">The result arguments.</param>
    /// <param name="type">The HTTP type of the API call.</param>
    /// <returns>An IActionResult based on resultArgs and type.</returns>
    [ApiExplorerSettings(IgnoreApi = true)]
    public IActionResult ApiResultArgs(MSResultArgs resultArgs, APIHttpType type = APIHttpType.HttpGet)
    {
        try
        {
            if (resultArgs == null)
            {
                return BadRequest();
            }

            ResultArgsHandler.SetResultArgs(resultArgs, type);

            return GetResponseByStatusCode(resultArgs.StatusCode, resultArgs);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
        }
    }

    /// <summary>
    /// Handles generic MSResultArgs and returns an appropriate IActionResult.
    /// </summary>
    /// <typeparam name="T">The type of data in MSResultArgs.</typeparam>
    /// <param name="resultArgs">The result arguments.</param>
    /// <param name="type">The HTTP type of the API call.</param>
    /// <returns>An IActionResult based on resultArgs and type.</returns>
    [ApiExplorerSettings(IgnoreApi = true)]
    public IActionResult ApiResultArgs<T>(MSResultArgs<T> resultArgs, APIHttpType type = APIHttpType.HttpGet)
    {
        try
        {
            if (resultArgs == null)
            {
                return BadRequest();
            }
            ResultArgsHandler.SetResultArgs(resultArgs, type);

            return GetResponseByStatusCode(resultArgs.StatusCode, resultArgs);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
        }
    }

    /// <summary>
    /// Returns a file response with the specified content type and filename.
    /// </summary>
    /// <typeparam name="T">The type of data in MSResultArgs.</typeparam>
    /// <param name="resultArgs">The result arguments.</param>
    /// <param name="fileName">The name of the file to be downloaded.</param>
    /// <param name="contentType">The content type of the file (default: "application/pdf").</param>
    /// <returns>An IActionResult containing the file or an error response if the file is invalid.</returns>
    [ApiExplorerSettings(IgnoreApi = true)]
    protected IActionResult ApiResultArgs<T>(MSResultArgs<T> resultArgs, string fileName, string contentType = "application/pdf")
    {
        ArgumentNullException.ThrowIfNull(resultArgs);

        if (resultArgs.ResultData == null || resultArgs.ResultData is not byte[] fileBytes)
        {
            return ApiResultArgs(new MSResultArgs
            {
                StatusCode = ErrorCodes.InternalServerError,
                StatusMessage = ErrorMessages.InternalServerError
            }, APIHttpType.HttpPost);
        }
        return File(fileBytes, contentType, fileName);
    }

    /// <summary>
    /// Returns a bad request result argument response.
    /// </summary>
    /// <param name="message">The bad request message.</param>
    /// <returns>An IActionResult representing bad request.</returns>
    [ApiExplorerSettings(IgnoreApi = true)]
    protected IActionResult BadRequestApi(string message)
    {
        return this.ApiResultArgs(new MSResultArgs
        {
            StatusCode = ErrorCodes.BadRequest,
            StatusMessage = message,
        }, APIHttpType.HttpPost);
    }

    /// <summary>
    /// Returns an appropriate IActionResult based on the status code.
    /// </summary>
    /// <param name="statusCode">The status code to be evaluated.</param>
    /// <param name="resultArgs">The result arguments.</param>
    /// <returns>An IActionResult based on the provided status code.</returns>
    private IActionResult GetResponseByStatusCode(long statusCode, object resultArgs)
    {
        return statusCode switch
        {
            StatusCodes.Status200OK => Ok(resultArgs),
            StatusCodes.Status102Processing => Ok(resultArgs),// Custom message
            StatusCodes.Status201Created => Created(string.Empty, resultArgs),
            StatusCodes.Status202Accepted => Accepted(resultArgs),
            // StatusCodes.Status203NonAuthoritative => StatusCode(StatusCodes.Status203NonAuthoritative, resultArgs),
            StatusCodes.Status205ResetContent => StatusCode(StatusCodes.Status205ResetContent, resultArgs),
            StatusCodes.Status204NoContent => NoContent(),
            StatusCodes.Status206PartialContent => new ObjectResult(resultArgs) { StatusCode = StatusCodes.Status206PartialContent },
            StatusCodes.Status400BadRequest => BadRequest(resultArgs),
            StatusCodes.Status401Unauthorized => Unauthorized(resultArgs),
            StatusCodes.Status403Forbidden => Forbid(),
            StatusCodes.Status404NotFound => NotFound(resultArgs),
            StatusCodes.Status405MethodNotAllowed => StatusCode(StatusCodes.Status405MethodNotAllowed, resultArgs),
            StatusCodes.Status406NotAcceptable => StatusCode(StatusCodes.Status406NotAcceptable, resultArgs),
            StatusCodes.Status408RequestTimeout => StatusCode(StatusCodes.Status408RequestTimeout, resultArgs),
            StatusCodes.Status409Conflict => Conflict(resultArgs),
            StatusCodes.Status410Gone => StatusCode(StatusCodes.Status410Gone, resultArgs),
            StatusCodes.Status412PreconditionFailed => StatusCode(StatusCodes.Status412PreconditionFailed, resultArgs),
            StatusCodes.Status415UnsupportedMediaType => StatusCode(StatusCodes.Status415UnsupportedMediaType, resultArgs),
            StatusCodes.Status422UnprocessableEntity => UnprocessableEntity(resultArgs),
            StatusCodes.Status426UpgradeRequired => StatusCode(StatusCodes.Status426UpgradeRequired, resultArgs),
            StatusCodes.Status429TooManyRequests => StatusCode(StatusCodes.Status429TooManyRequests, resultArgs),
            StatusCodes.Status500InternalServerError => StatusCode(StatusCodes.Status500InternalServerError, resultArgs),
            StatusCodes.Status501NotImplemented => StatusCode(StatusCodes.Status501NotImplemented, resultArgs),
            StatusCodes.Status502BadGateway => StatusCode(StatusCodes.Status502BadGateway, resultArgs),
            StatusCodes.Status503ServiceUnavailable => StatusCode(StatusCodes.Status503ServiceUnavailable, resultArgs),
            StatusCodes.Status504GatewayTimeout => StatusCode(StatusCodes.Status504GatewayTimeout, resultArgs),
            _ => BadRequest(resultArgs),
        };
    }
}