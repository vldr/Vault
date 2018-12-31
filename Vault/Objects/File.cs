using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Vault.Objects
{
    public class File
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Ext { get; set; }

        public long Size { get; set; }

        public DateTime Created { get; set; }

        public string Hash { get; set; }

        public string Path { get; set; }

        public bool IsReady { get; set; }

        public int Owner { get; set; }

        public int Folder { get; set; }

        public int Hits { get; set; }

        // Share Related

        public bool IsSharing { get; set; }

        public string ShareId { get; set; }

        public string ShareKey { get; set; }
    }
}
