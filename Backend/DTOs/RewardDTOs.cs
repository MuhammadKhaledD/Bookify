using System;

namespace Bookify_Backend.DTOs
{
    public class RewardDTO
    {
        public class RewardResponseDTO
        {
            public int Id { get; set; }
            public string? Name { get; set; }
            public string? Description { get; set; }
            public int PointsRequired { get; set; }
            public string? RewardType { get; set; }
            public int? Discount { get; set; }
            public DateTime? ExpireDate { get; set; }
            public bool Status { get; set; }
            public int? ItemProductId { get; set; }
            public int? ItemTicketId { get; set; }
            public ProductBasicDTO? ItemProduct { get; set; }
            public TicketBasicDTO? ItemTicket { get; set; }
        }

        public class CreateRewardDTO
        {
            public int PointsRequired { get; set; }
            public string? Name { get; set; }
            public string? Description { get; set; }
            public string? RewardType { get; set; }
            public int? Discount { get; set; }
            public DateTime? ExpireDate { get; set; }
            public bool Status { get; set; } = true;
            public int? ItemProductId { get; set; }
            public int? ItemTicketId { get; set; }
        }

        public class UpdateRewardDTO
        {
            public int? PointsRequired { get; set; }
            public string? Name { get; set; }
            public string? Description { get; set; }
            public string? RewardType { get; set; }
            public int? Discount { get; set; }
            public DateTime? ExpireDate { get; set; }
            public bool? Status { get; set; }
            public int? ItemProductId { get; set; }
            public int? ItemTicketId { get; set; }
        }

        public class RewardListDTO
        {
            public int Id { get; set; }
            public string? Name { get; set; }
            public int PointsRequired { get; set; }
            public string? RewardType { get; set; }
            public bool Status { get; set; }
            public DateTime? ExpireDate { get; set; }
        }

        public class ProductBasicDTO
        {
            public int Id { get; set; }
            public string? Name { get; set; }
            public decimal? Price { get; set; }
        }

        public class TicketBasicDTO
        {
            public int Id { get; set; }
            public string? Type { get; set; }
            public decimal? Price { get; set; }
        }
    }
}