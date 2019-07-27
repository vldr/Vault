using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Vault.Migrations
{
    public partial class adjustednames : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.RenameColumn(
                name: "Tag",
                table: "Files",
                newName: "Nonce");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Nonce",
                table: "Files",
                newName: "Tag");
        }
    }
}
