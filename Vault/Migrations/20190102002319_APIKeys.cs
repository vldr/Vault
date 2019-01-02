using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class APIKeys : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "APIEnabled",
                table: "Users",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "APIKey",
                table: "Users",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "APIEnabled",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "APIKey",
                table: "Users");
        }
    }
}
