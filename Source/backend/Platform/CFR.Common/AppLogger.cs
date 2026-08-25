// Copyright (c) OptionC. All rights reserved.

using Microsoft.Extensions.Logging;

namespace CFR.Common;

public static class AppLogger
{
    private static readonly ConcurrentDictionary<string, Delegate> _cache = new();

    public static void LogTrace(ILogger logger, Exception? exception, string message)
    {
        GetNoArg(LogLevel.Trace, message)(logger, exception);
    }

    public static void LogDebug(ILogger logger, Exception? exception, string message)
    {
        GetNoArg(LogLevel.Debug, message)(logger, exception);
    }

    public static void LogInformation(ILogger logger, Exception? exception, string message)
    {
        GetNoArg(LogLevel.Information, message)(logger, exception);
    }

    public static void LogWarning(ILogger logger, Exception? exception, string message)
    {
        GetNoArg(LogLevel.Warning, message)(logger, exception);
    }

    public static void LogError(ILogger logger, Exception? exception, string message)
    {
        GetNoArg(LogLevel.Error, message)(logger, exception);
    }

    public static void LogCritical(ILogger logger, Exception? exception, string message)
    {
        GetNoArg(LogLevel.Critical, message)(logger, exception);
    }

    public static void LogTrace<T1>(ILogger logger, Exception? exception, string message, T1 arg1)
    {
        GetOneArg<T1>(LogLevel.Trace, message)(logger, arg1, exception);
    }

    public static void LogDebug<T1>(ILogger logger, Exception? exception, string message, T1 arg1)
    {
        GetOneArg<T1>(LogLevel.Debug, message)(logger, arg1, exception);
    }

    public static void LogInformation<T1>(ILogger logger, Exception? exception, string message, T1 arg1)
    {
        GetOneArg<T1>(LogLevel.Information, message)(logger, arg1, exception);
    }

    public static void LogWarning<T1>(ILogger logger, Exception? exception, string message, T1 arg1)
    {
        GetOneArg<T1>(LogLevel.Warning, message)(logger, arg1, exception);
    }

    public static void LogError<T1>(ILogger logger, Exception? exception, string message, T1 arg1)
    {
        GetOneArg<T1>(LogLevel.Error, message)(logger, arg1, exception);
    }

    public static void LogCritical<T1>(ILogger logger, Exception? exception, string message, T1 arg1)
    {
        GetOneArg<T1>(LogLevel.Critical, message)(logger, arg1, exception);
    }

    public static void LogTrace<T1, T2>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2)
    {
        GetTwoArg<T1, T2>(LogLevel.Trace, message)(logger, arg1, arg2, exception);
    }

    public static void LogDebug<T1, T2>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2)
    {
        GetTwoArg<T1, T2>(LogLevel.Debug, message)(logger, arg1, arg2, exception);
    }

    public static void LogInformation<T1, T2>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2)
    {
        GetTwoArg<T1, T2>(LogLevel.Information, message)(logger, arg1, arg2, exception);
    }

    public static void LogWarning<T1, T2>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2)
    {
        GetTwoArg<T1, T2>(LogLevel.Warning, message)(logger, arg1, arg2, exception);
    }

    public static void LogError<T1, T2>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2)
    {
        GetTwoArg<T1, T2>(LogLevel.Error, message)(logger, arg1, arg2, exception);
    }

    public static void LogCritical<T1, T2>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2)
    {
        GetTwoArg<T1, T2>(LogLevel.Critical, message)(logger, arg1, arg2, exception);
    }

    public static void LogTrace<T1, T2, T3>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3)
    {
        GetThreeArg<T1, T2, T3>(LogLevel.Trace, message)(logger, arg1, arg2, arg3, exception);
    }

    public static void LogDebug<T1, T2, T3>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3)
    {
        GetThreeArg<T1, T2, T3>(LogLevel.Debug, message)(logger, arg1, arg2, arg3, exception);
    }

    public static void LogInformation<T1, T2, T3>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3)
    {
        GetThreeArg<T1, T2, T3>(LogLevel.Information, message)(logger, arg1, arg2, arg3, exception);
    }

    public static void LogWarning<T1, T2, T3>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3)
    {
        GetThreeArg<T1, T2, T3>(LogLevel.Warning, message)(logger, arg1, arg2, arg3, exception);
    }

    public static void LogError<T1, T2, T3>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3)
    {
        GetThreeArg<T1, T2, T3>(LogLevel.Error, message)(logger, arg1, arg2, arg3, exception);
    }

    public static void LogCritical<T1, T2, T3>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3)
    {
        GetThreeArg<T1, T2, T3>(LogLevel.Critical, message)(logger, arg1, arg2, arg3, exception);
    }

    public static void LogTrace<T1, T2, T3, T4>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
    {
        GetFourArg<T1, T2, T3, T4>(LogLevel.Trace, message)(logger, arg1, arg2, arg3, arg4, exception);
    }

    public static void LogDebug<T1, T2, T3, T4>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
    {
        GetFourArg<T1, T2, T3, T4>(LogLevel.Debug, message)(logger, arg1, arg2, arg3, arg4, exception);
    }

    public static void LogInformation<T1, T2, T3, T4>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
    {
        GetFourArg<T1, T2, T3, T4>(LogLevel.Information, message)(logger, arg1, arg2, arg3, arg4, exception);
    }

    public static void LogWarning<T1, T2, T3, T4>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
    {
        GetFourArg<T1, T2, T3, T4>(LogLevel.Warning, message)(logger, arg1, arg2, arg3, arg4, exception);
    }

    public static void LogError<T1, T2, T3, T4>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
    {
        GetFourArg<T1, T2, T3, T4>(LogLevel.Error, message)(logger, arg1, arg2, arg3, arg4, exception);
    }

    public static void LogCritical<T1, T2, T3, T4>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
    {
        GetFourArg<T1, T2, T3, T4>(LogLevel.Critical, message)(logger, arg1, arg2, arg3, arg4, exception);
    }

    public static void LogTrace<T1, T2, T3, T4, T5>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
    {
        GetFiveArg<T1, T2, T3, T4, T5>(LogLevel.Trace, message)(logger, arg1, arg2, arg3, arg4, arg5, exception);
    }

    public static void LogDebug<T1, T2, T3, T4, T5>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
    {
        GetFiveArg<T1, T2, T3, T4, T5>(LogLevel.Debug, message)(logger, arg1, arg2, arg3, arg4, arg5, exception);
    }

    public static void LogInformation<T1, T2, T3, T4, T5>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
    {
        GetFiveArg<T1, T2, T3, T4, T5>(LogLevel.Information, message)(logger, arg1, arg2, arg3, arg4, arg5, exception);
    }

    public static void LogWarning<T1, T2, T3, T4, T5>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
    {
        GetFiveArg<T1, T2, T3, T4, T5>(LogLevel.Warning, message)(logger, arg1, arg2, arg3, arg4, arg5, exception);
    }

    public static void LogError<T1, T2, T3, T4, T5>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
    {
        GetFiveArg<T1, T2, T3, T4, T5>(LogLevel.Error, message)(logger, arg1, arg2, arg3, arg4, arg5, exception);
    }

    public static void LogCritical<T1, T2, T3, T4, T5>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
    {
        GetFiveArg<T1, T2, T3, T4, T5>(LogLevel.Critical, message)(logger, arg1, arg2, arg3, arg4, arg5, exception);
    }

    public static void LogTrace<T1, T2, T3, T4, T5, T6>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5, T6 arg6)
    {
        GetSixArg<T1, T2, T3, T4, T5, T6>(LogLevel.Trace, message)(logger, arg1, arg2, arg3, arg4, arg5, arg6, exception);
    }

    public static void LogDebug<T1, T2, T3, T4, T5, T6>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5, T6 arg6)
    {
        GetSixArg<T1, T2, T3, T4, T5, T6>(LogLevel.Debug, message)(logger, arg1, arg2, arg3, arg4, arg5, arg6, exception);
    }

    public static void LogInformation<T1, T2, T3, T4, T5, T6>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5, T6 arg6)
    {
        GetSixArg<T1, T2, T3, T4, T5, T6>(LogLevel.Information, message)(logger, arg1, arg2, arg3, arg4, arg5, arg6, exception);
    }

    public static void LogWarning<T1, T2, T3, T4, T5, T6>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5, T6 arg6)
    {
        GetSixArg<T1, T2, T3, T4, T5, T6>(LogLevel.Warning, message)(logger, arg1, arg2, arg3, arg4, arg5, arg6, exception);
    }

    public static void LogError<T1, T2, T3, T4, T5, T6>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5, T6 arg6)
    {
        GetSixArg<T1, T2, T3, T4, T5, T6>(LogLevel.Error, message)(logger, arg1, arg2, arg3, arg4, arg5, arg6, exception);
    }

    public static void LogCritical<T1, T2, T3, T4, T5, T6>(ILogger logger, Exception? exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5, T6 arg6)
    {
        GetSixArg<T1, T2, T3, T4, T5, T6>(LogLevel.Critical, message)(logger, arg1, arg2, arg3, arg4, arg5, arg6, exception);
    }

    private static Action<ILogger, Exception?> GetNoArg(LogLevel level, string message)
    {
        return (Action<ILogger, Exception?>)_cache.GetOrAdd($"{level}:0:{message}", _ =>
            LoggerMessage.Define(level, new EventId(0, message), message));
    }

    private static Action<ILogger, T1, Exception?> GetOneArg<T1>(LogLevel level, string message)
    {
        return (Action<ILogger, T1, Exception?>)_cache.GetOrAdd($"{level}:1:{message}:{typeof(T1).FullName}", _ =>
            LoggerMessage.Define<T1>(level, new EventId(0, message), message));
    }

    private static Action<ILogger, T1, T2, Exception?> GetTwoArg<T1, T2>(LogLevel level, string message)
    {
        return (Action<ILogger, T1, T2, Exception?>)_cache.GetOrAdd($"{level}:2:{message}", _ =>
            LoggerMessage.Define<T1, T2>(level, new EventId(0, message), message));
    }

    private static Action<ILogger, T1, T2, T3, Exception?> GetThreeArg<T1, T2, T3>(LogLevel level, string message)
    {
        return (Action<ILogger, T1, T2, T3, Exception?>)_cache.GetOrAdd($"{level}:3:{message}", _ =>
            LoggerMessage.Define<T1, T2, T3>(level, new EventId(0, message), message));
    }

    private static Action<ILogger, T1, T2, T3, T4, Exception?> GetFourArg<T1, T2, T3, T4>(LogLevel level, string message)
    {
        return (Action<ILogger, T1, T2, T3, T4, Exception?>)_cache.GetOrAdd($"{level}:4:{message}", _ =>
            LoggerMessage.Define<T1, T2, T3, T4>(level, new EventId(0, message), message));
    }

    private static Action<ILogger, T1, T2, T3, T4, T5, Exception?> GetFiveArg<T1, T2, T3, T4, T5>(LogLevel level, string message)
    {
        return (Action<ILogger, T1, T2, T3, T4, T5, Exception?>)_cache.GetOrAdd($"{level}:5:{message}", _ =>
            LoggerMessage.Define<T1, T2, T3, T4, T5>(level, new EventId(0, message), message));
    }

    private static Action<ILogger, T1, T2, T3, T4, T5, T6, Exception?> GetSixArg<T1, T2, T3, T4, T5, T6>(LogLevel level, string message)
    {
        return (Action<ILogger, T1, T2, T3, T4, T5, T6, Exception?>)_cache.GetOrAdd($"{level}:6:{message}", _ =>
            LoggerMessage.Define<T1, T2, T3, T4, T5, T6>(level, new EventId(0, message), message));
    }
}
