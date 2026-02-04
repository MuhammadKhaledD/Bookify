using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Bookify_Backend.Helpers;

public class AzureBlobHelper
{
    private readonly BlobContainerClient _containerClient;
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5MB
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    public AzureBlobHelper(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"];
        var containerName = configuration["AzureStorage:ContainerName"];
        
        if (string.IsNullOrEmpty(connectionString))
            throw new InvalidOperationException("Azure Storage connection string is not configured");
        
        if (string.IsNullOrEmpty(containerName))
            throw new InvalidOperationException("Azure Storage container name is not configured");

        var blobServiceClient = new BlobServiceClient(connectionString);
        _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        
        // Ensure container exists (create if it doesn't)
        _containerClient.CreateIfNotExists(PublicAccessType.Blob);
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        ValidateImage(file);

        var newFileName = GenerateFileName(file.FileName);
        var blobClient = _containerClient.GetBlobClient(newFileName);

        // Upload file to Azure Blob Storage
        using (var stream = file.OpenReadStream())
        {
            await blobClient.UploadAsync(stream, overwrite: true);
        }

        // Return the public URL of the uploaded blob
        return blobClient.Uri.ToString();
    }

    private void ValidateImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new Exception("Image is required");

        if (file.Length > MaxFileSizeBytes)
            throw new Exception("Image must be less than 5MB");

        var extension = Path.GetExtension(file.FileName).ToLower();
        
        if (!AllowedExtensions.Contains(extension))
            throw new Exception($"Invalid image format. Allowed: {string.Join(", ", AllowedExtensions)}");
    }

    private string GenerateFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName).ToLower();
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var uniqueId = Guid.NewGuid().ToString("N").Substring(0, 10);
        
        return $"{timestamp}_{uniqueId}{extension}";
    }
}

