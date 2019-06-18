using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vault.Models
{
    public class Settings
    {
        public bool Success { get; set; }
        public string Name { get; set; }
        public string Storage { get; set; }
        public bool APIEnabled { get; set; }
        public string APIKey { get; set; }
    }
}
