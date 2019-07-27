using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class salt777 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Salt",
                table: "Files",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EncryptionVersion",
                table: "Files",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EncryptionVersion",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "Salt",
                table: "Files");
        }
    }
}
