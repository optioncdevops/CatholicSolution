// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncService.Service.Security
{
    /// <summary>
    /// Provides a per-request service for accessing the current authenticated ApiClient.
    /// </summary>
    public class CurrentApiClientService: ICurrentApiClient
    {
        public bool IsAuthenticated { get; set; }

        public int ApiClientId { get; set; }

        public string ClientId { get; set; } = string.Empty;

        public int ProductId { get; set; }

        public string ClientIPAddress { get; set; } = "Unknown";
    }
}
