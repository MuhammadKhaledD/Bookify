using System;

namespace Bookify_Backend.DTOs
{
    public class CategoryDTO
    {
        public class CategoryResponseDTO
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public DateTime CreatedOn { get; set; }
            public DateTime? UpdatedOn { get; set; }
        }

        public class CreateCategoryDTO
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
        }

        public class UpdateCategoryDTO
        {
            public string? Name { get; set; }
            public string? Description { get; set; }
        }

        public class CategoryListDTO
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
        }
    }
}