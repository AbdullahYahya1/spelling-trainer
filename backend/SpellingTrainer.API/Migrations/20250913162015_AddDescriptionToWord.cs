using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpellingTrainer.API.Migrations
{

    public partial class AddDescriptionToWord : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Words",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Words");
        }
    }
}
