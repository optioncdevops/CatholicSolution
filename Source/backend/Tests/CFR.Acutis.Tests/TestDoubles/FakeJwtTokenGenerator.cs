// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Models.Output;

namespace CFR.Acutis.Tests.TestDoubles;

/// <summary>In-memory test double for <see cref="IJwtTokenGenerator"/> — returns a fixed, obviously-fake token string, never a real signature.</summary>
public class FakeJwtTokenGenerator : IJwtTokenGenerator
{
    public string TokenToReturn { get; set; } = "fake-test-token";

    public AcutisLoginUser? LastUser { get; private set; }

    public string GenerateToken(AcutisLoginUser user)
    {
        LastUser = user;
        return TokenToReturn;
    }
}
