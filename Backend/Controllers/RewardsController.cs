using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Bookify_Backend.Services;
using static Bookify_Backend.DTOs.RewardDTO;

namespace Bookify_Backend.Controllers
{
    [ApiController]
    [Route("api/rewards")]
    public class RewardsController : ControllerBase
    {
        private readonly RewardService _rewardService;

        public RewardsController(RewardService rewardService)
        {
            _rewardService = rewardService;
        }

        /// <summary>
        /// GET api/rewards
        /// Get all rewards (no pagination)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllRewards()
        {
            try
            {
                var rewards = await _rewardService.GetAllRewardsAsync();

                if (rewards == null)
                    return StatusCode(500, new { message = "An error occurred while retrieving rewards." });

                return Ok(rewards);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// GET api/rewards/{id}
        /// Get reward by id (with details)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRewardById(int id)
        {
            try
            {
                var reward = await _rewardService.GetRewardByIdAsync(id);

                if (reward == null)
                    return NotFound(new { message = "Reward not found." });

                return Ok(reward);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// POST api/rewards
        /// Create a reward
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateReward([FromBody] CreateRewardDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Invalid request data." });

                var reward = await _rewardService.CreateRewardAsync(dto);

                if (reward == null)
                    return BadRequest(new { message = "Failed to create reward. Please check validation requirements." });

                return CreatedAtAction(nameof(GetRewardById), new { id = reward.Id }, reward);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// PUT api/rewards/{id}
        /// Update reward
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReward(int id, [FromBody] UpdateRewardDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Invalid request data." });

                var reward = await _rewardService.UpdateRewardAsync(id, dto);

                if (reward == null)
                    return BadRequest(new { message = "Failed to update reward. Reward not found or validation failed." });

                return Ok(new { message = "Reward updated successfully.", data = reward });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// DELETE api/rewards/{id}
        /// Delete (soft) reward
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReward(int id)
        {
            try
            {
                var result = await _rewardService.DeleteRewardAsync(id);

                if (!result)
                    return NotFound(new { message = "Reward not found." });

                return Ok(new { message = "Reward deleted successfully." });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}