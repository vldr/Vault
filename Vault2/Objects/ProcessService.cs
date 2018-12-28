﻿using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Vault.Objects;

namespace Vault2.Objects
{
    public class ProcessService
    {
        // Our vault database context...
        private VaultContext _context { get; set; }

        // Instance of our configuration...
        private IConfiguration _configuration;

        /// <summary>
        /// Sets up a simple enum to represent attribute types....
        /// </summary>
        public enum AttributeTypes
        {
            FolderIcon = 1,
            FolderStyle = 2,
            FileIcon = 3,
            FileAction = 4,
        }

        /**
         * Constructor...
         */
        public ProcessService(VaultContext context, IConfiguration configuration) {
            _context = context;
            _configuration = configuration;
        }

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

        /**
         * Gets a folder given an id...
         */
        public IEnumerable<Folder> GetFolders(int ownerId, int folderId) 
            => _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId);

        /**
         * Gets a list of folder listings with matching owners and folder id...
         */
        public List<FolderListing> GetFolderListings(int ownerId, int folderId)
            => _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId)
            .Select(x => new FolderListing
            {
                Id = x.Id,
                Name = x.Name,
                Icon = GetFolderAttribute(x.Colour, AttributeTypes.FolderIcon),
                Style = GetFolderAttribute(x.Colour, AttributeTypes.FolderStyle)
            }).ToList();

        /**
         * Gets a list of file listings with matching owners and folder id...
         */
        public List<FileListing> GetFileListings(int ownerId, int folderId)
            => _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId)
            .Select(x => new FileListing
            {
                Id = x.Id,
                Name = x.Name,
                Icon = GetFileAttribute(x.Id, x.Ext, AttributeTypes.FileIcon),
                Action = GetFileAttribute(x.Id, x.Ext, AttributeTypes.FileAction),
                IsSharing = x.IsSharing,
                ShareId = x.ShareId
            }).ToList();

        /**
         * Gives all the files inside a folder...
         */
        public IEnumerable<File> GetFiles(int ownerId, int folderId) 
            => _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId);

        /**
         * Gives all the files inside a folder using a List...
         */
        public List<File> GetFilesList(int ownerId, int folderId)
        {
            return _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).ToList();
        }

        /**
         * Gets a folders unique attribute depending on its colour...
         */
        public string GetFolderAttribute(int colour, AttributeTypes type = AttributeTypes.FolderIcon)
        {
            switch (colour)
            {
                case 1:
                    if (type == AttributeTypes.FolderIcon)
                        return "/manager/images/folder-icon2.png";
                    else
                        return "purple-icon";
                case 2:
                    if (type == AttributeTypes.FolderIcon)
                        return "/manager/images/folder-icon3.png";
                    else
                        return "green-icon";
                case 3:
                    if (type == AttributeTypes.FolderIcon)
                        return "/manager/images/folder-icon4.png";
                    else
                        return "red-icon";
                case 4:
                    if (type == AttributeTypes.FolderIcon)
                        return "/manager/images/folder-icon5.png";
                    else
                        return "blue-icon";
                default:
                    if (type == AttributeTypes.FolderIcon)
                        return "/manager/images/folder-icon.png";
                    else
                        return "orange-icon";
            }
        }

        /**
        * Gets a folders unique attribute depending on its colour...
        */
        public string GetFileAttribute(int id, string ext, AttributeTypes type = AttributeTypes.FileIcon)
        {
            // Setup our default action so we don't repeat ourselves...
            var defaultAction = "processDownload(event)";

            switch (ext)
            {
                case ".zip":
                case ".rar":
                case ".tar":
                case ".gz":
                case ".zipx":
                    if (type == AttributeTypes.FileIcon)
                        return "/manager/images/zip-icon.png";
                    else
                        return defaultAction;
                case ".mov":
                case ".mp4":
                case ".webm":
                    if (type == AttributeTypes.FileIcon)
                        return "/manager/images/video-icon.png";
                    else
                        return defaultAction;
                case ".docx":
                case ".asd":
                case ".dotx":
                case ".dotm":
                case ".wbk":
                case ".docm":
                    if (type == AttributeTypes.FileIcon)
                        return "/manager/images/word-icon.png";
                    else
                        return defaultAction;
                case ".pptx":
                case ".pps":
                    if (type == AttributeTypes.FileIcon)
                        return "/manager/images/PowerPoint-icon.png";
                    else
                        return defaultAction;
                case ".pub":
                    if (type == AttributeTypes.FileIcon)
                        return "/manager/images/Publisher-icon.png";
                    else
                        return defaultAction;
                case ".exe":
                case ".app":
                case ".dmg":
                case ".bat":
                case ".elf":
                case ".sys":
                case ".msi":
                case ".sh":
                case ".deb":
                case ".com":
                    if (type == AttributeTypes.FileIcon)
                        return "/manager/images/shell-icon.png";
                    else
                        return defaultAction;
                case ".xlsx":
                case ".xls":
                    if (type == AttributeTypes.FileIcon)
                        return "/manager/images/Excel-icon.png";
                    else
                        return defaultAction;
                case ".png":
                case ".jpg":
                case ".jpeg":
                case ".bmp":
                case ".pjpeg":
                case ".gif":
                    if (type == AttributeTypes.FileIcon)
                        return "/manager/process/thumbnail/" + id;
                    else
                        return "viewImage(event)";
                default:
                    if (type == AttributeTypes.FileIcon)
                        return "/manager/images/unknown-icon.png";
                    else
                        return defaultAction;
            }
        }

        /**
         * Gets a folder given an id using a list...
         */
        public List<Folder> GetFoldersList(int ownerId, int folderId)
        {
            return _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId).ToList();
        }

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
            // Add our folder to the context...
            _context.Folders.Add(folder);

            // Save our changes!
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
         * Returns the string representation of the folder's location...
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
         * Returns the string representation of the folder's location in html format...
         */
        public string GetFolderLocationFormatted(Folder folder, int limit = 0, StringBuilder location = null)
        {
            // If our location parameter is null then initialize it.
            if (location == null) location = new StringBuilder();

            // Loop until we've hit our limit folder!
            while (folder.FolderId != limit)
            {
                // Insert our folder's name at the start of the string builder.
                location.Insert(0, $"<a href='#' data-folder-id='{folder.Id}' onclick='processMove(event)'>{folder.Name}</a> / ");

                // Get the next folder in the chain!
                folder = GetFolder(folder.Owner, folder.FolderId);
            }

            // Return the final location string!
            return location.ToString();
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
                var files = GetFiles(ownerId, folderId);

                // Check if the file even exists...
                if (files == null)
                    return false;

                // Iterate through all our files in the folder...
                foreach (var file in files)
                {
                    // Dispose all our related files off of the disk!
                    DisposeFileOnDisk(file.Path);

                    // Remove each file from the dataset...
                    _context.Files.Remove(file);
                } 

                // Get our current folder...
                Folder currentFolder = GetFolder(ownerId, folderId);

                // Get our new folder...
                int newFolderId = currentFolder.FolderId;

                // Get all folders inside our folder...
                var folders = GetFolders(ownerId, folderId);

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
         * Disposes all the files related to the file path!
         */
        public void DisposeFileOnDisk(string filePath)
        {
            try
            {
                // Get our files inside our vault storage location and starting with  the file path...
                var files = Directory.GetFiles(_configuration["VaultStorageLocation"], "*")
                    .Where(x => x.StartsWith(filePath));

                // For every file iterate throughout!
                foreach (var file in files)
                {
                    // If the file exists!
                    if (System.IO.File.Exists(file))
                        // Delete it!
                        System.IO.File.Delete(file);
                }
                
            }
            catch { }
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

                ///////////////////////////////////////////

                // Dispose all our related files off of the disk!
                DisposeFileOnDisk(file.Path);

                ///////////////////////////////////////////

                // Remove our file...
                _context.Files.Remove(file);

                // Save our changes.
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
