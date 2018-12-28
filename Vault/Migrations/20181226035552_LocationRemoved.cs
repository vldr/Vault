using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault2.Migrations
{
    public partial class LocationRemoved : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "Folders");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Folders",
                nullable: true);
        }
    }
}
