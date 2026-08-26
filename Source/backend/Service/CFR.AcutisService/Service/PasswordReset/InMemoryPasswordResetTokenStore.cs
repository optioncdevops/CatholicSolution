// Copyright (c) OptionC. All rights reserved.

using System.Collections.Concurrent;
using System.Security.Cryptography;

using CFR.AcutisInfrastructure.Models.Output;
using CFR.AcutisService.Interfaces.PasswordReset;

namespace CFR.AcutisService.Service.PasswordReset;

/// <summary>
/// DEVELOPMENT-ONLY implementation of <see cref="IPasswordResetTokenStore"/>. Backed by an
/// in-process <see cref="ConcurrentDictionary{TKey,TValue}"/> — non-durable (lost on app restart),
/// not shared across instances, and NOT a substitute for the production storage design deferred
/// in docs/acutis-auth-spec/database-contract.md ("do not design database changes now"). Must
/// never be relied on outside local development/testing.
/// </summary>
public class InMemoryPasswordResetTokenStore : IPasswordResetTokenStore
{
    private sealed class Entry
    {
        public required long UserId { get; init; }

        public required DateTimeOffset ExpiresAtUtc { get; init; }

        public bool Used { get; set; }
    }

    private readonly ConcurrentDictionary<string, Entry> _tokens = new(StringComparer.Ordinal);

    public Task<string> IssueResetTokenAsync(long userId, TimeSpan validity, CancellationToken cancellationToken = default)
    {
        string token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');

        _tokens[token] = new Entry
        {
            UserId = userId,
            ExpiresAtUtc = DateTimeOffset.UtcNow.Add(validity),
        };

        return Task.FromResult(token);
    }

    public Task<PasswordResetTokenValidationResult> ValidateAndConsumeTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(token) || !_tokens.TryGetValue(token, out var entry))
        {
            return Task.FromResult(new PasswordResetTokenValidationResult
            {
                IsValid = false,
                FailureReason = PasswordResetTokenFailureReason.NotFound,
            });
        }

        if (entry.Used)
        {
            return Task.FromResult(new PasswordResetTokenValidationResult
            {
                IsValid = false,
                FailureReason = PasswordResetTokenFailureReason.AlreadyUsed,
            });
        }

        if (entry.ExpiresAtUtc < DateTimeOffset.UtcNow)
        {
            return Task.FromResult(new PasswordResetTokenValidationResult
            {
                IsValid = false,
                FailureReason = PasswordResetTokenFailureReason.Expired,
            });
        }

        entry.Used = true;

        return Task.FromResult(new PasswordResetTokenValidationResult
        {
            IsValid = true,
            UserId = entry.UserId,
        });
    }
}
