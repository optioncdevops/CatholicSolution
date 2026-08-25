// Copyright (c) OptionC. All rights reserved.

using System.Net;
using System.Text.Json;

namespace CFR.Base.Middlewares
{
    public class GlobalExceptionHandlerMiddleware(RequestDelegate next)
    {
        private readonly RequestDelegate _next = next;

        public async Task InvokeAsync(HttpContext context)
        {
            ArgumentNullException.ThrowIfNull(context);

            try
            {
                await _next(context); // Proceed to the next middleware in the pipeline
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = HttpStatusCode.InternalServerError; // 500 if unexpected

            // Log exception details here if logging is enabled
            // You can implement your own logging logic here

            var response = new ErrorResponse
            {
                StatusCode = (int)statusCode,
                Message = exception.Message
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = response.StatusCode;

            string result = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(result);
        }
    }

    internal sealed class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}