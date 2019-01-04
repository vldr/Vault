﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Vault.Models;

namespace Vault.Migrations
{
    [DbContext(typeof(VaultContext))]
    partial class VaultContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.4-rtm-31024");

            modelBuilder.Entity("Vault.Models.File", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("Created");

                    b.Property<string>("Ext");

                    b.Property<int>("Folder");

                    b.Property<string>("Hash");

                    b.Property<int>("Hits");

                    b.Property<bool>("IsReady");

                    b.Property<bool>("IsSharing");

                    b.Property<string>("Name");

                    b.Property<int>("Owner");

                    b.Property<string>("Path");

                    b.Property<string>("ShareId");

                    b.Property<string>("ShareKey");

                    b.Property<long>("Size");

                    b.HasKey("Id");

                    b.ToTable("Files");
                });

            modelBuilder.Entity("Vault.Models.Folder", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Colour");

                    b.Property<int>("FolderId");

                    b.Property<string>("Name");

                    b.Property<int>("Owner");

                    b.HasKey("Id");

                    b.ToTable("Folders");
                });

            modelBuilder.Entity("Vault.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<bool>("APIEnabled");

                    b.Property<string>("APIKey");

                    b.Property<DateTime>("Created");

                    b.Property<string>("Email");

                    b.Property<int>("Folder");

                    b.Property<string>("IPAddresses");

                    b.Property<string>("Logs");

                    b.Property<long>("MaxBytes");

                    b.Property<string>("Name");

                    b.Property<string>("Password");

                    b.Property<int>("SortBy");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });
#pragma warning restore 612, 618
        }
    }
}
