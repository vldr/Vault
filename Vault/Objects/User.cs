using System;

namespace Vault.Objects
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        public string Name { get; set; }
        public DateTime Created { get; set; }
        public virtual string IPAddresses { get; set; }
        public virtual string Logs { get; set; }

        public int SortBy { get; set; }
        public int Folder { get; set; }

        public bool APIEnabled { get; set; }
        public string APIKey { get; set; }
    }
}