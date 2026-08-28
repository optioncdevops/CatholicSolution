// Copyright (c) OptionC. All rights reserved.

namespace CFR.CommonService.Interfaces
{
    /// <summary>
    /// Defines the interface for the current user service.
    /// </summary>
    public interface ICurrentUserService
    {
        long UserId { get; set; }
        string UserName { get; set; }
        int RoleId { get; set; }
        string ClientIPAddress { get; set; }
        string DeviceType { get; set; }
        string BrowserName { get; set; }
        string FirstName { get; set; }
        string LastName { get; set; }        
    }
}
