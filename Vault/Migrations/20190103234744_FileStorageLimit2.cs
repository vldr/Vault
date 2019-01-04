﻿using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class FileStorageLimit2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UsedBytes",
                table: "Users");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "UsedBytes",
                table: "Users",
                nullable: false,
                defaultValue: 0L);
        }
    }
}
