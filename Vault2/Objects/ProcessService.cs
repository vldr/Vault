using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vault2.Objects
{
    public class ProcessService
    {
        // Our vault database context...
        private VaultContext _context { get; set; }

        /**
         * Constructor...
         */
        public ProcessService(VaultContext context) => _context = context;

        /**
        * Checks if the userid even exists
        */
        public bool UserExists(int id)
            => _context.Users.Any(b => b.Id == id);

        /**
        * Gets the hashed password from the database!
        */
        public string GetPasswordHash(int id) 
            => _context.Users.Where(b => b.Id == id).FirstOrDefault().Password;

        /**
        * Checks if the userid even exists
        */
        public bool IsFolderValid(int ownerId, int id)
            => _context.Folders.Any(b => b.Id == id && b.Owner == ownerId);

        /*
         * Gets a folder given an id...
         */
        public IEnumerable<Folder> GetFolders(int ownerId, int folderId) 
            => _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId);

        /**
         * Gives all the files inside a folder...
         */ 
        public IEnumerable<File> GetFiles(int ownerId, int folderId) 
            => _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId);

        /**
         * Gives all the files inside a folder... (Sorted)
         */
        public IEnumerable<File> GetFiles(int ownerId, int folderId, int sortBy = 0)
        {
            switch (sortBy)
            {
                // Size
                case 1:
                    return _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).OrderBy(b => b.Size);
                // Name
                case 2:
                    return _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).OrderBy(b => b.Name);
                // Id
                case 3:
                    return _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).OrderBy(b => b.Id);
                // Extension
                default:
                    return _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).OrderBy(b => b.Ext);
            }
        }

        /**
         * Checks if a folder can move there...
         */
        public bool IsShareIdTaken(int ownerId, int fileId, string shareId)
            => _context.Files.Any(b => b.Id == fileId && b.Owner == ownerId && b.ShareId == shareId);

        /**
         * Checks if a folder can move there...
         */
        public bool CanFolderMove(int ownerId, int id, int folderId) 
            => _context.Folders.Any(b => b.Id == id && b.Owner == ownerId && b.FolderId == folderId);
        
        /**
         * Checks if a file can move there...
         */ 
        public bool CanFileMove(int ownerId, int id, int folderId) 
            => _context.Files.Any(b => b.Id == id && b.Owner == ownerId && b.Folder == folderId);

        /**
         * Gets a folder when asked for one...
         */
        public Folder GetFolder(int ownerId, int folderId)
            => _context.Folders.Where(b => b.Id == folderId && b.Owner == ownerId).FirstOrDefault();
        
        
        /**
         * Gets a file when asked for one...
         */
        public File GetFile(int ownerId, int fileId) 
            => _context.Files.Where(b => b.Id == fileId && b.Owner == ownerId).FirstOrDefault();

        /**
         * Gets a file using the shareId, only works if it is being shared!
         */
        public File GetSharedFile(string shareId)
            => _context.Files.Where(b => b.IsSharing == true && b.ShareId == shareId).FirstOrDefault();


        /**
         * Adds a new file to the dataset...
         */
        public void AddNewFile(File file)
        {
            _context.Files.Add(file);
            _context.SaveChanges();
        }

        /**
         * Increment our file hits!
         */
        public void IncrementFileHit(File file)
        {
            file.Hits++;

            _context.SaveChanges();
        }


        /**
         * Adds a new folder to the dataset...
         */
        public void AddNewFolder(Folder folder)
        {
            _context.Folders.Add(folder);
            _context.SaveChanges();
        }

        /**
        * Share our file!
        */
        public bool ShareFile(int id, int fileId, bool option)
        {
            // Setup function to generate random string...
            Func<int, string> randomString = count =>
            {
                string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                var stringChars = new char[count];
                var random = new Random();

                for (int i = 0; i < stringChars.Length; i++)
                {
                    stringChars[i] = chars[random.Next(chars.Length)];
                }

                return new string(stringChars);
            };

            // Catch any exceptions...
            try
            {
                // Get our actual user...
                File file = _context.Files.Where(b => b.Id == fileId && b.Owner == id).FirstOrDefault();

                // Check if our user is null!
                if (file == null)
                    return false;

                // If we want to toggle off our share, then it is simple!
                if (option == false)
                {
                    // Set our is sharing accordingly!
                    file.IsSharing = false;

                    // Empty our share id!
                    file.ShareId = String.Empty;
                }
                // Otherwise, turn everything on!
                else
                {
                    // Set our is sharing accordingly!
                    file.IsSharing = true;

                    // Setup a variable to store our share id!
                    string shareId = randomString(32);

                    // Check if our share id is taken!
                    if (IsShareIdTaken(id, fileId, shareId))
                        // Return false if it is taken!
                        return false;

                    // Generate our random string for our share id!
                    file.ShareId = shareId;
                }

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /**
         * Update our file name!
         */
        public bool UpdateFileName(int id, int fileId, string newName)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                File file = _context.Files.Where(b => b.Id == fileId && b.Owner == id).FirstOrDefault();

                // Check if our user is null!
                if (file == null)
                    return false;

                // Update our users name!
                file.Name = newName;

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /**
         * Update our folder name!
         */
        public bool UpdateFolderName(int id, int folderId, string newName)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                Folder folder = _context.Folders.Where(b => b.Id == folderId && b.Owner == id).FirstOrDefault();

                // Check if our user is null!
                if (folder == null)
                    return false;

                // Update our users name!
                folder.Name = newName;

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /**
         * Update our folder colour!
         */
        public bool UpdateFolderColour(int id, int folderId, int newColour)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                Folder folder = _context.Folders.Where(b => b.Id == folderId && b.Owner == id).FirstOrDefault();

                // Check if our user is null!
                if (folder == null)
                    return false;

                // Update our users name!
                folder.Colour = newColour;

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /**
         * Returns the string representation of the folder's location
         */
        public string GetFolderLocation(Folder folder, int limit = 0, StringBuilder location = null)
        {
            // If our location parameter is null then initialize it.
            if (location == null) location = new StringBuilder();

            // Insert our folder's name at the start of the string builder.
            location.Insert(0, folder.Name + "/");

            // Easy case, check if we're on the root folder.
            if (folder.FolderId == limit)
            {
                // Return the final location string!
                return location.ToString();
            }

            // Call our get folder location once more to get the next folder!
            return GetFolderLocation(GetFolder(folder.Owner, folder.FolderId), limit, location);
        }

        /**
         * Update our sort by field!
         */
        public bool UpdateSortBy(int id, int newSortBy)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                User user = _context.Users.Where(b => b.Id == id).FirstOrDefault();

                // Check if our user is null!
                if (user == null)
                    return false;

                // Update our users name!
                user.SortBy = newSortBy;

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /**
         * Update our name!
         */
        public bool UpdateName(int id, string newName)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                User user = _context.Users.Where(b => b.Id == id).FirstOrDefault();

                // Check if our user is null!
                if (user == null)
                    return false;

                // Update our users name!
                user.Name = newName;

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /**
         * Update our password
         */
        public bool UpdatePassword(int id, string currentPassword, string newPassword)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                User user = _context.Users.Where(b => b.Id == id).FirstOrDefault();

                // Check if our user is null!
                if (user == null)
                    return false;

                // If our user's password matches then proceed!
                if (BCrypt.BCryptHelper.CheckPassword(currentPassword, user.Password))
                {
                    // Update our user's password!
                    user.Password = BCrypt.BCryptHelper.HashPassword(newPassword, BCrypt.BCryptHelper.GenerateSalt());

                    // Save our changes!
                    _context.SaveChanges();
                    
                    // Return true as it was successful...
                    return true;
                }
            }
            catch
            {
                // Exception, false...
                return false;
            }

            return false;
        }


        /**
         * Deletes a file from the dataset...
         */
        public bool DeleteFolder(int ownerId, int folderId)
        {
            // Catch any exceptions...
            try
            {
                // Get our file...
                IEnumerable<File> files = GetFiles(ownerId, folderId);

                // Check if the file even exists...
                if (files == null)
                    return false;

                // Iterate through all our files in the folder...
                foreach (var file in files)
                {
                    // Delete the file from disk...
                    System.IO.File.Delete(file.Path);

                    // Setup our thumbnail path!
                    string thumbnailPath = file.Path + ".thumb";

                    // Check if our thumbnail file exists!
                    if (System.IO.File.Exists(thumbnailPath))
                        // Delete it if it does!
                        System.IO.File.Delete(thumbnailPath);

                    // Remove each file from the dataset...
                    _context.Files.Remove(file);
                } 

                // Get our current folder...
                Folder currentFolder = GetFolder(ownerId, folderId);

                // Get our new folder...
                int newFolderId = currentFolder.FolderId;

                // Get all folders inside our folder...
                IEnumerable<Folder> folders = GetFolders(ownerId, folderId);

                // Replace all their folder id's with the new folder id...
                foreach (var folder in folders)
                {
                    folder.FolderId = newFolderId;
                }
                
                _context.Folders.Remove(currentFolder);

                // Remove our file...
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /**
         * Deletes a file from the dataset...
         */
        public bool DeleteFile(int ownerId, int fileId)
        {
            // Catch any exceptions...
            try
            {
                // Get our file...
                File file = GetFile(ownerId, fileId);

                // Check if the file even exists...
                if (file == null)
                    return false;

                // Ask our file io to delete the from disk...
                System.IO.File.Delete(file.Path);

                // Setup our thumbnail path!
                string thumbnailPath = file.Path + ".thumb";

                // Check if our thumbnail file exists!
                if (System.IO.File.Exists(thumbnailPath))
                    // Delete it if it does!
                    System.IO.File.Delete(thumbnailPath);

                // Remove our file...
                _context.Files.Remove(file);

                // Remove our file...
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /**
         * Moves a folder to a different folder location...
         * folder.Id -> newFolderId
         */
        public bool MoveFolder(int ownerId, int folderId, int newFolderId)
        {
            // Get our folders as objects...
            Folder folder = _context.Folders.Where(b => b.Id == folderId && b.Owner == ownerId).FirstOrDefault();
            Folder newFolder = _context.Folders.Where(b => b.Id == newFolderId && b.Owner == ownerId).FirstOrDefault();

            // Check if our new folder and our current folder isn't null...
            if (folder != null && newFolder != null)
            {
                // Modify
                folder.FolderId = newFolder.Id;

                // Save our changes...
                _context.SaveChanges();

                // Respond with a true...
                return true;
            }
            else
                // Otherwise return false...
                return false;
        }

        /**
         * Moves a file to a different folder location...
         * file.Id -> folderId
         */
        public bool MoveFile(int ownerId, int fileId, int folderId)
        {
            // Get our folders as objects...
            File file = _context.Files.Where(b => b.Id == fileId && b.Owner == ownerId).FirstOrDefault();
            Folder newFolder = _context.Folders.Where(b => b.Id == folderId && b.Owner == ownerId).FirstOrDefault();

            // Check if our new folder and our current folder isn't null...
            if (file != null && newFolder != null)
            {
                // Modify
                file.Folder = newFolder.Id;

                // Save our changes...
                _context.SaveChanges();

                // Respond with a true...
                return true;
            }
            else
                // Otherwise return false...
                return false;
        }
    }
}
