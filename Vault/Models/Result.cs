using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vault.Models
{
    /// <summary>
    /// A collection of all possible status codes.
    /// </summary>
    public enum ResultStatus
    {
        OK = 0,
        Exception,
        InvalidFolderName,
        InvalidFolderHandle,
        ModifyingHomeFolder,
        InvalidFileName,
        InvalidFileHandle,
        ShareIDTaken,
        InvalidUserHandle,
        FolderInsideFolder,
        FolderInsideItself,
        NoParentFolder,
        FailedToAddFile,
        NoRecycleBinGiven,
        DoNotDestroyFile,
        FailedToDeleteFileOnDisk,
        DestroyFile,
        InvalidName,
        PasswordDoesNotMatch,
        DestroyFolder,
        DoNotDestroyFolder,
        FolderShareIDTaken,
        FileIsEncrypted,
        NotEnoughStorage,
        InternalFileNameTaken,
        UnableToDuplicate,
        EmailTaken,
        FileDoesNotExistOnDisk,
        FileTooLargeToEdit,
    }

    /// <summary>
    /// Base type Result.
    /// </summary>
    public abstract class ResultBase
    {
        public ResultStatus Status { get; private set; }
        public string CustomErrorMessage = null;

        protected ResultBase(ResultStatus status)
        {
            Status = status;
        }

        public object FormatError()
        {
            if (IsOK()) throw new InvalidOperationException("You cannot format an error for an OK status!");

            return new
            {
                Success = false,
                Reason = CustomErrorMessage == null ? $"We could not complete your request due to an error: ({Status})" : CustomErrorMessage
            };
        }

        public bool IsOK() => Status == ResultStatus.OK;
    }

    public class Result<T> : ResultBase
    {
        private T Obj;

        Result(ResultStatus status, T obj) : base(status)
        {
            Obj = obj;
        }

        public static Result<T> New(ResultStatus status, T obj)
        {
            return new Result<T>(status, obj);
        }

        public static Result<T> New(T obj)
        {
            return new Result<T>(ResultStatus.OK, obj);
        }

        public T Get()
        {
            return Obj;
        }
    }

    public class Result<T, S> : ResultBase
    {
        private T Obj;
        private S Obj2;

        Result(ResultStatus status, T obj, S obj2) : base(status)
        {
            Obj = obj;
            Obj2 = obj2;
        }

        public static Result<T, S> New(ResultStatus status, T obj, S obj2)
        {
            return new Result<T, S>(status, obj, obj2);
        }

        public static Result<T, S> New(T obj, S obj2)
        {
            return new Result<T, S>(ResultStatus.OK, obj, obj2);
        }

        public (T, S) Get()
        {
            return (Obj, Obj2);
        }
    }

    public class Result : ResultBase
    {
        public Result(ResultStatus status) : base(status) { }

        public static Result New(ResultStatus status)
        {
            return new Result(status);
        }

        public static Result New()
        {
            return new Result(ResultStatus.OK);
        }
    }
}
