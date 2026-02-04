using Bookify_Backend.Entities;
using Bookify_Backend.Repositories;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services;

public class RedemptionService
{
    private readonly IRedemptionRepository _redemptionRepo;
    private readonly IRewardRepository _rewardRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository userRepository;

    public RedemptionService(
        IRedemptionRepository redemptionRepo,
        IRewardRepository rewardRepo,
        IUnitOfWork unitOfWork,IUserRepository userRepository)
    {
        _redemptionRepo = redemptionRepo;
        _rewardRepo = rewardRepo;
        _unitOfWork = unitOfWork;
        this.userRepository = userRepository;
    }

    // --------------------
    // Create redemption
    // --------------------
    public async Task<Redemption> CreateAsync(string userId, int rewardId)
    {
        var reward = await _rewardRepo.GetByIdAsync(rewardId)
                     ?? throw new Exception("Reward not found");

        var redemption = new Redemption(
            userId: userId,
            rewardId: rewardId,
            pointsSpent: reward.PointsRequired,
            status: "Pending"
        );
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new Exception("User not found");
        }
        user.DeductLoyaltyPoints(reward.PointsRequired);

        await _redemptionRepo.AddAsync(redemption);
        await _unitOfWork.SaveChangesAsync();
        
        return redemption;
    }

    // --------------------
    // User redemptions
    // --------------------
    public async Task<IEnumerable<Redemption>> GetMyRedemptionsAsync(string userId)
    {
        return await _redemptionRepo.GetRedemptionsByUserIdAsync(userId);
    }

    // --------------------
    // Product redemptions
    // --------------------
    public async Task<IEnumerable<Redemption>> GetByProductIdAsync(int productId)
    {
        return await _redemptionRepo.GetRedemptionsByProductIdAsync(productId);
    }

    // --------------------
    // Ticket redemptions
    // --------------------
    public async Task<IEnumerable<Redemption>> GetByTicketIdAsync(int ticketId)
    {
        return await _redemptionRepo.GetRedemptionsByTicketIdAsync(ticketId);
    }
}