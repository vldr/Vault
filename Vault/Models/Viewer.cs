using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vault.Models
{
    public class Viewer
    {
        public bool Success { get; set; }

        public string Name { get; set; }
        public string Ext { get; set; }
        public long Size { get; set; }

        public string Icon { get; set; }
        public string Action { get; set; }
        public string URL { get; set; }
        public string RelativeURL { get; set; }
    }
}
