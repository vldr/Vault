using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class FileStorageLimits : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "MaxBytes",
                table: "Users",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "UsedBytes",
                table: "Users",
                nullable: false,
                defaultValue: 0L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxBytes",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UsedBytes",
                table: "Users");
        }
    }
}
