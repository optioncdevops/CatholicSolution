// Copyright (c) OptionC. All rights reserved.

using CFR.CommonService.Interfaces;

namespace CFR.CommonService.Service
{
    /// <summary>
    /// Provides a service for accessing the current user's information.
    /// </summary>
    public class CurrentUserService: ICurrentUserService
    {
        public long UserId { get; set; }
        public Guid? CFRUserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string ClientIPAddress { get; set; } = "Unknown";
        public string DeviceType { get; set; } = "Unknown";
        public string BrowserName { get; set; } = "Unknown";      
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
}
