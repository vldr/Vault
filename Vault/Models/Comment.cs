using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Vault.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int FileId { get; set; }
        public int Parent { get; set; }

        public string Author { get; set; }
        public string Content { get; set; }
        public long Created { get; set; }

        [NotMapped]
        public string IPAddress { get; set; }
    }
}
