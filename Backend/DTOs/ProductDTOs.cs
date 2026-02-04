    namespace Bookify_Backend.DTOs;

    // Minimized product DTO for listing products in an event shop
    public record ProductSummaryDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string? Description { get; init; }
        public decimal? Price { get; init; }
        public decimal? FinalPrice { get; init; } // Price after discount
        public int StockQuantity { get; init; }
        public decimal Discount { get; init; }
        public string? ProductImage { get; init; }
        public int? PointsEarnedPerUnit { get; init; }
        public int? ShopId { get; init; }

       public int? StoreId { get; init; }

        public string? OrganizationName { get; init; } = string.Empty;
}

    // Request DTO for creating a product
    public record CreateProductRequest
    {
        public string Name { get; init; } = string.Empty;
        public int StockQuantity { get; init; }
        public int? ShopId { get; init; }
        public int? StoreId { get; init; }
        public string? Description { get; init; }
        public decimal? Price { get; init; }
        public int LimitPerUser { get; init; } = 1;
        public decimal Discount { get; init; } = 0;
        public int PointsEarnedPerUnit { get; init; } = 0;
        public IFormFile? ProductImage { get; init; }
    }

    // Request DTO for updating a product
    public record UpdateProductRequest
    {
        public string? Name { get; init; }
        public string? Description { get; init; }
        public decimal? Price { get; init; }
        public int? StockQuantity { get; init; }
        public int? LimitPerUser { get; init; }
        public decimal? Discount { get; init; }
        public int? PointsEarnedPerUnit { get; init; }
        public IFormFile? ProductImage { get; init; }
    }

