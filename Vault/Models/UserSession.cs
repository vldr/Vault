using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vault.Models
{
    public class UserSession
    {
        public int Id { get; set; }
        public int Folder { get; set; }
        public int SortBy { get; set; }
    }
}
