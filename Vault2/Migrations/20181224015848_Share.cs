using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault2.Migrations
{
    public partial class Share : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Hits",
                table: "Files",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsSharing",
                table: "Files",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ShareDate",
                table: "Files",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ShareId",
                table: "Files",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShareKey",
                table: "Files",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Hits",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "IsSharing",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "ShareDate",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "ShareId",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "ShareKey",
                table: "Files");
        }
    }
}
