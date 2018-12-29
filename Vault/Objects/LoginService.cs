using System;
using System.Linq;

namespace Vault2.Objects
{
    public class LoginService
    {
        // Our vault database context...
        private VaultContext _context { get; set; }

        /**
         * Constructor...
         */
        public LoginService(VaultContext context) => _context = context;

        /**
         * Attempts to log the user in the system...
         */
        public User Login(string email, string hash)
        {

            // Catch all our exceptions...
            try
            {
                // Attempt to find the user matching the email address...
                var user = _context.Users.Where(b => b.Email == email).FirstOrDefault();

                // Check if our password is null...
                if (user == null)
                    return null;

                // Check if our passwords match...
                return BCrypt.BCryptHelper.CheckPassword(hash, user.Password) ? user : null;
            }
            catch
            {
                // If theres an exception, return an error...
                return null;
            }
        }

        /**
         * Attempts to find the user's ID...
         */
        public int? GetUserId(string email) => _context.Users
                    .Where(b => b.Email == email)
                    ?.FirstOrDefault()?.Id;

        /**
         * Attempts to find the user by given id...
         */
        public User GetUser(int id) => _context.Users.Where(b => b.Id == id)?.FirstOrDefault();

        /**
         * Checks if the userid even exists
         */
        public bool UserExists(int id) => _context.Users.Any(b => b.Id == id);

        /*
         * Adds an ip address to the user
         */
        public void AppendIPAddress(int id, string ip)
        {
            _context.Users.Find(id).IPAddresses += $"{ip}\n";
            _context.SaveChanges();
        }

        /**
         * Register
         * Registers a user to the database...
         */
        public bool Register(User user)
        {
            // Catch all our exceptions...
            try
            {
                // Check if our email already exists in the database...
                bool exists = (_context.Users
                    .Where(b => b.Email == user.Email)
                    .FirstOrDefault()) != null;

                // If it does, quit here...
                if (exists)
                    return false;

                // Hash our user's password using BCrypt...
                user.Password = BCrypt.BCryptHelper.HashPassword(user.Password, BCrypt.BCryptHelper.GenerateSalt());

                // Set our created atribute to now...
                user.Created = DateTime.Now;

                // Add our user to the users dataset...
                _context.Users.Add(user);

                // Set our changes...
                _context.SaveChanges();

                // Create our folder object...
                Folder folder = new Folder() { Owner = user.Id };

                // Add our folder to the dataset...
                _context.Folders.Add(folder);

                // Set our changes...
                _context.SaveChanges();

                // Setup a new folder...
                user.Folder = folder.Id;

                // Save our changes...
                _context.SaveChanges();
            }
            catch (Exception)
            {
                // If theres an exception, return an error...
                return false;
            }

            // Otherwise, return OK...
            return true;
        }
    }
}
