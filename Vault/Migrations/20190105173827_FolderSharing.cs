using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class FolderSharing : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSharing",
                table: "Folders",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ShareId",
                table: "Folders",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSharing",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "ShareId",
                table: "Folders");
        }
    }
}
