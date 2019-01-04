using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vault.Objects
{
    public class Listing
    {
        public bool Success { get; set; }
        public string Path { get; set; }
        public bool IsHome { get; set; }
        public int Previous { get; set; }
        public int Sort { get; set; }

        public IEnumerable<FolderListing> Folders { get; set; }
        public IEnumerable<FileListing> Files { get; set; }
    }

    public class FileListing
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Icon { get; set; }
        public string Action { get; set; }
        public string Date { get; set; }
        public string Size { get; set; }

        public bool IsSharing { get; set; }
        public string ShareId { get; set; }
    }

    public class FolderListing
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Icon { get; set; }
        public string Style { get; set; }
    }
}

