// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Models.Output
{
    /// <summary>
    /// Subset of Auth0's /userinfo response actually needed to resolve a CFR member.
    /// </summary>
    public class Auth0UserInfo
    {
        /// <summary>
        /// Gets or sets the verified email address Auth0 has on file for this identity.
        /// </summary>
        public string Email { get; set; } = string.Empty;
    }
}
