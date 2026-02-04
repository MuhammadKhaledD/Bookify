using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using static Bookify_Backend.DTOs.RewardDTO;

namespace Bookify_Backend.Services
{
    public class RewardService
    {
        private readonly IRewardRepository _rewardRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductRepository _productRepo;
        private readonly ITicketRepository _ticketRepo;

        public RewardService(
            IRewardRepository rewardRepo,
            IProductRepository productRepo,
            ITicketRepository ticketRepo,
            IUnitOfWork unitOfWork)
        {
            _rewardRepo = rewardRepo;
            _unitOfWork = unitOfWork;
            _productRepo = productRepo;
            _ticketRepo = ticketRepo;
        }

        /// <summary>
        /// Get all non-deleted rewards (no pagination)
        /// </summary>
        public async Task<List<RewardListDTO>?> GetAllRewardsAsync()
        {
            try
            {
                var rewards = await _rewardRepo.GetAllAsync();
                var activeRewards = rewards.Where(r => !r.IsDeleted).ToList();

                return activeRewards.Select(r => new RewardListDTO
                {
                    Id = r.Id,
                    Name = r.Name,
                    PointsRequired = r.PointsRequired,
                    RewardType = r.RewardType,
                    Status = r.Status,
                    ExpireDate = r.ExpireDate
                }).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Get reward by id with details
        /// </summary>
        public async Task<RewardResponseDTO?> GetRewardByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                    return null;

                var reward = await _rewardRepo.GetByIdWithDetailsAsync(id);

                if (reward == null || reward.IsDeleted)
                    return null;

                return new RewardResponseDTO
                {
                    Id = reward.Id,
                    Name = reward.Name,
                    Description = reward.Description,
                    PointsRequired = reward.PointsRequired,
                    RewardType = reward.RewardType,
                    Discount = reward.Discount,
                    ExpireDate = reward.ExpireDate,
                    Status = reward.Status,
                    ItemProductId = reward.ItemProductId,
                    ItemTicketId = reward.ItemTicketId,
                    ItemProduct = reward.item_product != null ? new ProductBasicDTO
                    {
                        Id = reward.item_product.Id,
                        Name = reward.item_product.Name,
                        Price = reward.item_product.Price
                    } : null,
                    ItemTicket = reward.item_ticket != null ? new TicketBasicDTO
                    {
                        Id = reward.item_ticket.Id,
                        Type = reward.item_ticket.TicketType,
                        Price = reward.item_ticket.Price
                    } : null
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Create a new reward
        /// </summary>
        public async Task<RewardResponseDTO?> CreateRewardAsync(CreateRewardDTO dto)
        {
            try
            {
                // Validate points required
                if (dto.PointsRequired < 0)
                    return null;

                // Validate name length if provided
                if (!string.IsNullOrWhiteSpace(dto.Name) && dto.Name.Length > 255)
                    return null;

                // Validate reward type length if provided
                if (!string.IsNullOrWhiteSpace(dto.RewardType) && dto.RewardType.Length > 20)
                    return null;

                // Validate discount if provided
                if (dto.Discount.HasValue && (dto.Discount.Value < 0 || dto.Discount.Value > 100))
                    return null;

                // Check if BOTH are null (not allowed)
                if (dto.ItemProductId is null && dto.ItemTicketId is null)
                    return null;

                // Check if BOTH have values (not allowed)
                if (dto.ItemProductId is not null && dto.ItemTicketId is not null)
                    return null;

                // Validate the one that was provided
                if (dto.ItemProductId is not null)
                {
                    var productExists = await _productRepo.ExistsAsync(dto.ItemProductId.Value);
                    if (!productExists)
                        return null;
                }

                if (dto.ItemTicketId is not null)
                {
                    var ticketExists = await _ticketRepo.ExistsAsync(dto.ItemTicketId.Value);
                    if (!ticketExists)
                        return null;
                }

                // Handle expiry date
                var expireDate = dto.ExpireDate;
                if (expireDate.HasValue)
                {
                    if (expireDate.Value < DateTime.Now)
                        return null;

                    expireDate = DateTime.SpecifyKind(expireDate.Value, DateTimeKind.Unspecified);
                }

                // Create the reward
                var reward = new Reward(
                    dto.PointsRequired,
                    dto.Name,
                    dto.Description,
                    dto.RewardType,
                    dto.Discount,
                    expireDate,
                    dto.Status,
                    dto.ItemProductId,
                    dto.ItemTicketId);

                await _rewardRepo.AddAsync(reward);
                await _unitOfWork.SaveChangesAsync();

                // Fetch with details to return complete DTO
                var createdReward = await _rewardRepo.GetByIdWithDetailsAsync(reward.Id);

                return new RewardResponseDTO
                {
                    Id = createdReward.Id,
                    Name = createdReward.Name,
                    Description = createdReward.Description,
                    PointsRequired = createdReward.PointsRequired,
                    RewardType = createdReward.RewardType,
                    Discount = createdReward.Discount,
                    ExpireDate = createdReward.ExpireDate,
                    Status = createdReward.Status,
                    ItemProductId = createdReward.ItemProductId,
                    ItemTicketId = createdReward.ItemTicketId,
                    ItemProduct = createdReward.item_product != null ? new ProductBasicDTO
                    {
                        Id = createdReward.item_product.Id,
                        Name = createdReward.item_product.Name,
                        Price = createdReward.item_product.Price
                    } : null,
                    ItemTicket = createdReward.item_ticket != null ? new TicketBasicDTO
                    {
                        Id = createdReward.item_ticket.Id,
                        Type = createdReward.item_ticket.TicketType,
                        Price = createdReward.item_ticket.Price
                    } : null
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Update an existing reward
        /// </summary>
        public async Task<RewardResponseDTO?> UpdateRewardAsync(int id, UpdateRewardDTO dto)
        {
            try
            {
                if (id <= 0)
                    return null;

                // Get existing reward
                var reward = await _rewardRepo.GetByIdAsync(id);

                if (reward == null || reward.IsDeleted)
                    return null;

                // Validate points required if provided
                if (dto.PointsRequired.HasValue && dto.PointsRequired.Value < 0)
                    return null;

                // Validate name length if provided
                if (!string.IsNullOrWhiteSpace(dto.Name) && dto.Name.Length > 255)
                    return null;

                // Validate reward type length if provided
                if (!string.IsNullOrWhiteSpace(dto.RewardType) && dto.RewardType.Length > 20)
                    return null;

                // Validate discount if provided
                if (dto.Discount.HasValue && (dto.Discount.Value < 0 || dto.Discount.Value > 100))
                    return null;

                // Validate item IDs if provided
                if (dto.ItemProductId.HasValue && dto.ItemTicketId.HasValue)
                    return null;

                if (dto.ItemProductId.HasValue)
                {
                    var productExists = await _productRepo.ExistsAsync(dto.ItemProductId.Value);
                    if (!productExists)
                        return null;
                }

                if (dto.ItemTicketId.HasValue)
                {
                    var ticketExists = await _ticketRepo.ExistsAsync(dto.ItemTicketId.Value);
                    if (!ticketExists)
                        return null;
                }

                // Handle expiry date
                var expireDate = dto.ExpireDate;
                if (expireDate.HasValue)
                {
                    if (expireDate.Value < DateTime.Now)
                        return null;

                    expireDate = DateTime.SpecifyKind(expireDate.Value, DateTimeKind.Unspecified);
                }

                reward.UpdateReward(
                    dto.PointsRequired,
                    dto.Name,
                    dto.Description,
                    dto.RewardType,
                    dto.Discount,
                    expireDate,
                    dto.Status,
                    dto.ItemProductId,
                    dto.ItemTicketId);

                await _rewardRepo.UpdateAsync(reward);
                await _unitOfWork.SaveChangesAsync();

                // Fetch with details to return complete DTO
                var updatedReward = await _rewardRepo.GetByIdWithDetailsAsync(reward.Id);

                return new RewardResponseDTO
                {
                    Id = updatedReward.Id,
                    Name = updatedReward.Name,
                    Description = updatedReward.Description,
                    PointsRequired = updatedReward.PointsRequired,
                    RewardType = updatedReward.RewardType,
                    Discount = updatedReward.Discount,
                    ExpireDate = updatedReward.ExpireDate,
                    Status = updatedReward.Status,
                    ItemProductId = updatedReward.ItemProductId,
                    ItemTicketId = updatedReward.ItemTicketId,
                    ItemProduct = updatedReward.item_product != null ? new ProductBasicDTO
                    {
                        Id = updatedReward.item_product.Id,
                        Name = updatedReward.item_product.Name,
                        Price = updatedReward.item_product.Price
                    } : null,
                    ItemTicket = updatedReward.item_ticket != null ? new TicketBasicDTO
                    {
                        Id = updatedReward.item_ticket.Id,
                        Type = updatedReward.item_ticket.TicketType,
                        Price = updatedReward.item_ticket.Price
                    } : null
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Soft-delete a reward
        /// </summary>
        public async Task<bool> DeleteRewardAsync(int id)
        {
            try
            {
                if (id <= 0)
                    return false;

                var reward = await _rewardRepo.GetByIdAsync(id);

                if (reward == null || reward.IsDeleted)
                    return false;

                reward.MarkAsDeleted();

                await _rewardRepo.UpdateAsync(reward);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}