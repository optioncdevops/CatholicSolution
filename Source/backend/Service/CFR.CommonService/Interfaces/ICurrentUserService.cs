// Copyright (c) OptionC. All rights reserved.

namespace CFR.CommonService.Interfaces
{
    /// <summary>
    /// Defines the interface for the current user service.
    /// </summary>
    public interface ICurrentUserService
    {
        long UserId { get; set; }

        /// <summary>
        /// The authenticated CFR member's identity (auth.User.CFRUserId), set only for a CFR.Portal
        /// session — Acutis/DataSync callers use the long <see cref="UserId"/> instead and leave
        /// this null.
        /// </summary>
        Guid? CFRUserId { get; set; }

        string UserName { get; set; }
        int RoleId { get; set; }
        string ClientIPAddress { get; set; }
        string DeviceType { get; set; }
        string BrowserName { get; set; }
        string FirstName { get; set; }
        string LastName { get; set; }        
    }
}
