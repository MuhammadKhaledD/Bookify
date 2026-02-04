using System.ComponentModel.DataAnnotations;

namespace Bookify_Backend.DTOs
{
    public class RolesDTO
    {
        public class CreateRoleDTO
        {
            [Required]
            public string RoleName { get; set; }
        }

        public class RoleDTO
        {
            public string RoleId { get; set; }

            public string RoleName { get; set; }
        }
       
        public class AddUserToRoleDTO
        {
            [Required]
            public string UserId { get; set; } = null!;

            [Required]
            public string RoleId { get; set; } = null!;
            
            public string? OrganizationId { get; set; }
        }
        public class UserRoleDTO
        {
            public string UserId { get; set; }
            public string? UserName { get; set; }
            public string? ProfilePicture { get; set; }
            public bool IsSelected { get; set; }
        }
        public class UserInfoDTO 
        {
            public string UserId { get; set; }
            public string? UserName { get; set; }
            public string? ProfilePicture { get; set; }
        }
        public class EditRoleDTO
        {
            public EditRoleDTO()
            {
                Users = new List<UserInfoDTO>();
            }

            public string Id { get; set; }

            public List<UserInfoDTO> Users { get; set; }
        }
        public class RemoveUserFromRoleDTO
        {
            [Required]
            public string UserId { get; set; }
    
            [Required]
            public string RoleId { get; set; }
        }
    }
}
