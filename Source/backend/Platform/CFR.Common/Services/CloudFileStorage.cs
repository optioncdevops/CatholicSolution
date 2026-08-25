// Copyright (c) OptionC. All rights reserved.

using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace CFR.Common.Services;

/// <summary>
/// Azure blob storage helper matching legacy Diocese portal <c>CloudFileStorage</c>.
/// </summary>
public class CloudFileStorage
{
    private readonly CloudBlobContainer _container;

    public CloudFileStorage(IConfiguration configuration, string container)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        string connectionString = configuration["AppStrings:StorageConnectionString"]
            ?? throw new InvalidOperationException("AppStrings:StorageConnectionString is not configured.");

        CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connectionString);
        CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
        _container = blobClient.GetContainerReference(container);
        _ = _container.CreateIfNotExistsAsync();
    }

    public async Task AddFile(string azurePath, Stream stream)
    {
        CloudBlockBlob blockBlob = _container.GetBlockBlobReference(azurePath);
        await blockBlob.UploadFromStreamAsync(stream);
    }

    public void DeleteFile(string azurePath)
    {
        CloudBlockBlob blockBlob = _container.GetBlockBlobReference(azurePath);
        _ = blockBlob.DeleteIfExistsAsync();
    }

    public async Task<MemoryStream> GetFileAsync(string azurePath)
    {
        CloudBlockBlob blockBlob = _container.GetBlockBlobReference(azurePath);
        MemoryStream memoryStream = new();
        await blockBlob.DownloadToStreamAsync(memoryStream);
        memoryStream.Position = 0;
        return memoryStream;
    }

    public CloudBlockBlob GetBlockBlobReference(string azurePath)
    {
        return _container.GetBlockBlobReference(azurePath);
    }
}
