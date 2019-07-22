using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class Encryption : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "IV",
                table: "Files",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEncrypted",
                table: "Files",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IV",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "IsEncrypted",
                table: "Files");
        }
    }
}
