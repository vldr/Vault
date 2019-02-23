using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class recyclebin : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRecycleBin",
                table: "Folders",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRecycleBin",
                table: "Folders");
        }
    }
}
