using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bookify_Backend.Migrations
{
    /// <inheritdoc />
    public partial class PaymentOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "payment_reference",
                table: "payments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "payment_reference",
                table: "payments");
        }
    }
}
