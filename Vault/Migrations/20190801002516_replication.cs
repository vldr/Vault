using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class replication : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "ReplicationMaxBytes",
                table: "Users",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<bool>(
                name: "IsReplicated",
                table: "Files",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReplicationMaxBytes",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsReplicated",
                table: "Files");
        }
    }
}
