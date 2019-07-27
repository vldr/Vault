using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class okok : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Tag",
                table: "Files",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tag",
                table: "Files");
        }
    }
}
