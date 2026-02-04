using System;

namespace Bookify_Backend.DTOs
{
    public class OrganizationDTO
    {
        public class OrganizationResponseDTO
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public string? ContactEmail { get; set; }
            public string? ContactPhone { get; set; }
            public string? Address { get; set; }
            public DateTime AddedOn { get; set; }
            public DateTime? UpdatedOn { get; set; }
        }

        public class CreateOrganizationDTO
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public string? ContactEmail { get; set; }
            public string? ContactPhone { get; set; }
            public string? Address { get; set; }
        }

        public class UpdateOrganizationDTO
        {
            public string? Name { get; set; }
            public string? Description { get; set; }
            public string? ContactEmail { get; set; }
            public string? ContactPhone { get; set; }
            public string? Address { get; set; }
        }

        public class OrganizationListDTO
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public string? ContactEmail { get; set; }

        }
    }
}