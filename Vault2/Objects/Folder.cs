﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Vault2.Objects
{
    public class Folder
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Colour { get; set; }
        public int Owner { get; set; }

        public int FolderId { get; set; }
    }
}
