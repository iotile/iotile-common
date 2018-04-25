/**
 * @ngdoc object
 * @name Errors.type:BaseError
 * @description
 * The base error class for all exceptions.  All exceptions must
 * have a name that should match the name of their class and a user 
 * settable message.  Typically, subclasses of BaseError will fill in the
 * name field in their own constructor, so users do not have to set it.
 * 
 * @property {string} name The name of of the exception, which is intended
 *   to be used as a method of filtering different exceptions.
 * @property {string} message A freeform message that provides more detail
 *   into what caused this error.
 */
export class BaseError {
    public name: string;
    public message: string;

    constructor(name: string, message: string) {
        this.name = name;
        this.message = message;
    }
}

/**
 * @ngdoc object
 * @name Errors.type:ArgumentError
 * @description
 * There was an issue with one of the parameters passed to this function.
 * The parameter was invalid.  The included message should contain more
 * details about what was expected vs received.
 */
export class ArgumentError extends BaseError {
    constructor(message: string) {
        super('ArgumentError', message);
    }
}

/**
 * @ngdoc object
 * @name Errors.type:InvalidOperationError
 * @description
 * The operation could not be performed at the time that it 
 * was requested.  This may be because the application's state
 * did not allow its preconditions to be met.
 */
export class InvalidOperationError extends BaseError {
    constructor(message: string) {
        super('InvalidOperationError', message);
    }
}

/**
 * @ngdoc object
 * @name Errors.type:UnknownError
 * @description
 * There was an unspecified error with the operation.
 * See the message property for more details.
 */
export class UnknownError extends BaseError {
    constructor(message: string) {
        super('UnknownError', message);
    }
}

/**
 * @ngdoc object
 * @name Errors.type:InsufficientSpaceError
 * @description
 * There was not sufficient space to perform this operation.  This error 
 * could be thrown, if, for example, you were trying to append data to a fixed
 * size buffer and there was not room in the buffer for all the data you wanted
 * to append.
 */
export class InsufficientSpaceError extends BaseError {
    constructor(message: string) {
        super('InsufficientSpaceError', message);
    }
}

/**
 * @ngdoc object
 * @name Errors.type:UnknownKeyError
 * @description
 * A key was passed to a lookup table and it was not found.
 */
export class UnknownKeyError extends BaseError {
    constructor(message: string) {
        super('UnknownKeyError', message);
    }
}

/**
 * @ngdoc object
 * @name Errors.type:FileSystemError
 * @description
 * There was an error interacting with the file system on
 * the device.
 */
export class FileSystemError {
    static readonly NOT_FOUND_ERR = 1;
    static readonly SECURITY_ERR = 2;
    static readonly ABORT_ERR = 3;
    static readonly NOT_READABLE_ERR = 4;
    static readonly ENCODING_ERR = 5;
    static readonly NO_MODIFICATION_ALLOWED_ERR = 6;
    static readonly INVALID_STATE_ERR = 7;
    static readonly SYNTAX_ERR = 8;
    static readonly INVALID_MODIFICATION_ERR = 9;
    static readonly QUOTA_EXCEEDED_ERR = 10;
    static readonly TYPE_MISMATCH_ERR = 11;
    static readonly PATH_EXISTS_ERR = 12;
    
    public message: string;
    public name: string;
    public code: number;

    constructor(name: string, message: string, code: number) {
        this.name = name;
        this.message = message;
        this.code = code;
    }
}

/**
 * @ngdoc object
 * @name Errors.type:UnknownFileSystemError
 * 
 * @description
 * There was an error interacting with the file system on
 * the device.
 */
export class UnknownFileSystemError extends FileSystemError {
    constructor(code: number, path?: string) {
        super('UnknownFileSystemError', "Unknown filesystem error: " + code + " path: " + path, code);
    }
}

/**
 * @ngdoc object
 * @name Errors.type:BatchOperationError
 * 
 * @description
 * A batch operation failed for one or more elements that
 * were addressed.  The individual errors are listed in the
 * errors property.
 */
export class BatchOperationError {
    public name : string;
    public message : string;
    public errors : FileSystemError[];

    constructor(message : string, errors: FileSystemError[]) {
        this.name = "BatchOperationError";
        this.message = message;
        this.errors = errors;
    }
}

export class InvalidDataError {
    constructor(public name: string, public message: string) {

    }
}

export class UserNotLoggedInError {
    constructor(public message: string) {

    }
}

export class DataCorruptedError extends InvalidDataError {
    constructor(message: string) {
        super("DataCorruptedError", message);
    }
}

export class DataStaleError extends InvalidDataError {
    constructor(message: string) {
        super("DataStaleError", message);
    }
}

export class CorruptDeviceError extends InvalidDataError {
    constructor(message: string) {
        super("CorruptDeviceError", message);
    }
}