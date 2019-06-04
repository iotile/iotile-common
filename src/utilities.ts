import {ArgumentError, InsufficientSpaceError} from "./app-errors";

/**
 * @ngdoc object
 * @name Utilities
 *
 * @description
 * The utilities namespace contains common routines that are used in other modules
 * including delays and generic parsing functions.
 */

/**
 * @ngdoc object
 * @name Utilities.function:endsWith
 * @description
 * Check if a string ends with another string
 *
 *
 * @param {string} str The input string
 * @param {string} suffix The suffix to check
 * @returns {bool} Whether the string ends with the suffix
 */
export function endsWith(str:string, suffix:string) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * @ngdoc object
 * @name Utilities.function:startsWith
 * @description
 * Check if a string ends with another string
 *
 *
 * @param {string} str The input string
 * @param {string} prefix The prefix to check
 * @returns {bool} Whether the string ends with the suffix
 */
export function startsWith(str:string, prefix:string) {
    return str.indexOf(prefix, 0) == 0;
}

export function joinPath(path1: string, path2: string) {
    if (path1[path1.length - 1] !== '/') {
        path1 += '/';
    }

    if (path2[0] == '/') {
        path2 = path2.substring(1);
    }

    return path1 + path2;
}

//From https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export function guid() : string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/**
 * @ngdoc object
 * @name Utilities.function:delay
 * @description
 * Delay for a fixed number of milliseconds
 *
 * This function wraps setTimeout in a promise API that can be
 * used with async/await.
 *
 * @param {number} delayMS - The number of milliseconds to wait
 * @returns {Promise} A promise that is fullfilled after delayMS milliseconds
 */
export function delay(delayMS: number) {
    return new Promise<void>(resolve => {
        function doResolve() {
        resolve();
    }

    setTimeout(doResolve, delayMS);
    });
}

/**
 * @ngdoc object
 * @name Utilities.function:deviceIDToSlug
 * @description
 * Convert a numeric deviceID to an IOTile cloud device slug 
 *
 * This function converts a device id like 0x20 to a string slug of 
 * the form:
 * d--XXXX-XXXX-XXXX-XXXX
 *
 * The slug always has the hex string in lowercase.
 * 
 * @param {number} deviceID - The device ID to convert into a slug
 * @returns {string} The corresponding device slug
 */

export function deviceIDToSlug(deviceID: number) {
    let hexString = Number(deviceID).toString(16);
    
    while (hexString.length < 16) {
        hexString = '0' + hexString;
    }

    hexString = hexString.toLowerCase();
    return 'd--' + hexString.substr(0, 4) + '-' + hexString.substr(4, 4) + '-' + hexString.substr(8, 4) + '-' + hexString.substr(12, 4);
}

/**
 * @ngdoc object
 * @name Utilities.function:createStreamerSlug
 * @description
 * Convert a numeric deviceID and streamer index to an IOTile cloud streamer slug 
 *
 * This function converts a device id like 0x20 and streamer 0 to a string slug of 
 * the form:
 * t--XXXX-XXXX-XXXX-XXXX--YYYY
 *
 * The slug always has the hex string in lowercase.  The device id is converted
 * into the XXXX portion and the streamer is converted to the YYYY portion.
 * 
 * @param {number} deviceID - The device ID to convert into a slug
 * @param {number} streamer - The streamer index to convert into a slug
 * @returns {string} The corresponding streamer slug
 */
export function createStreamerSlug(deviceID: number, streamer: number) {
    let deviceString = numberToHexString(deviceID, 16);
    let streamerString = numberToHexString(streamer, 4);

    return 't--' + deviceString.substr(0, 4) + '-' + deviceString.substr(4, 4) + '-' + deviceString.substr(8, 4) + '-' + deviceString.substr(12, 4) + '--' + streamerString;
}

/**
 * @ngdoc object
 * @name Utilities.function:numberToHexString
 * @description
 * Convert a number to lowercase hex string
 *
 * This function takes a number like 0x16 and returns
 * the string '16'.  It would also take 0xAF and return
 * 'af'.  It will pad the number out to a fixed length 
 * using the second length parameter.
 *
 * The slug always has the hex string in lowercase.
 * 
 * @param {number} inputNumber - The number to convert to a hex string
 * @param {number} length - The number of hex digits to pad out to.
 * @returns {string} The correspond lowercase hex string
 */
export function numberToHexString(inputNumber: number, length: number) {
    let hexString = Number(inputNumber).toString(16);
    
    while (hexString.length < length) {
        hexString = '0' + hexString;
    }

    hexString = hexString.toLowerCase();
    return hexString;
}

/**
 * @ngdoc object
 * @name Utilities.function:mapStreamName
 * @description
 * Convert a string description of an IOTile variable into a number
 *
 * This function converts string like 'output 1' into 16 bit integers
 * like 0x5001.  
 *
 * @param {string} streamName - The string name of the variable that you want to convert
 * @returns {number} The numerical stream identifier
 */
export function mapStreamName(streamName: string) {
    var knownStreams: {[key: string]: number} = {
    'buffered node': 0,
    'unbuffered node': 1,
    'constant': 2,
    'input': 3,
    'counter': 4,
    'output': 5
    };

    var system = 0;
    var parts = streamName.split(' ');
    if (parts[0] === 'system') {
    system = 1;
    parts = parts.slice(1);
    }

    var name = parts.slice(0, parts.length - 1).join(' ');
    var id = parseInt(parts[parts.length - 1]);

    if (!(name in knownStreams)) {
        throw new ArgumentError('Unknown stream name: ' + name);
    }

    var streamType = knownStreams[name];

    return (streamType << 12) | (system << 11) | id;
}

/**
 * @ngdoc object
 * @name Utilities.function:convertVariableLengthFormatCode
 * @description
 * Convert the variable length byte array format code ('V') into a fixed length
 * format code ('#s') based on the size of the provided buffer and whether or not this
 * is for packing (buffer is the last argument to pack) or unpacking (buffer is the entire
 * response).
 * 
 * ## See Also
 * {@link Utilities.function:packArrayBuffer Utilities.packArrayBuffer}
 * 
 * {@link Utilities.function:unpackArrayBuffer Utilities.unpackArrayBuffer}
 *
 * @param {string} fmt - The format code to convert 
 * @param {ArrayBuffer} buffer - Either the variable length arg to pack or the response buffer
 * @param {boolean} pack - Whether this is for packing (true) or unpacking (false)
 * 
 * @returns {string} - The converted format code
 */
export function convertVariableLengthFormatCode(fmt: string, buffer: ArrayBuffer, pack: boolean): string {
    if (fmt[fmt.length - 1] !== 'V') {
        return fmt
    }
    fmt = fmt.slice(0, -1);

    const fixedSize = expectedBufferSize(fmt);
    const varSize = pack ? buffer.byteLength : buffer.byteLength - fixedSize;

    fmt = fmt + varSize + 's';

    return fmt;
}

/**
 * @ngdoc object
 * @name Utilities.function:stringToBuffer
 * @description
 * Takes a string and returns an ArrayBuffer containing each character's
 * char code value.
 *
 * @param {string} str - The string to convert
 * 
 * @returns {ArrayBuffer}
 */
export function stringToBuffer(str: string): ArrayBuffer {
    const buffer = new Uint8Array(str.length);

    for (let i = 0; i < str.length; i++) {
        buffer[i] = str.charCodeAt(i);
    }

    return buffer.buffer as ArrayBuffer;
}

/**
 * @ngdoc object
 * @name Utilities.function:parseBufferFormatCode
 * @description
 * Parse a string format code describing the packing of a binary buffer
 * into an array of entries where each entry has a type code and a count
 * prefix. For example,
 * 
 * "18sH" would turn into [{count: 18, code: 's'}, {count: 8, code: 'H'}]
 * 
 * ## See Also
 * {@link Utilities.function:packArrayBuffer Utilities.packArrayBuffer}
 * 
 * {@link Utilities.function:unpackArrayBuffer Utilities.unpackArrayBuffer}
 *
 * @param {string} fmt - The format we are trying to determine the size of 
 * @returns {[FormatCode]} A list of the parsed format codes that were extracted
 *     from the input format string.
 */
export function parseBufferFormatCode(fmt: string) {
    var parsed = []
    var i;
    var count = 0; //For accumulating counts like 18s
    
    //Calculate expected size
    for (i = 0; i < fmt.length; ++i) {
        if (fmt[i] >= '0' && fmt[i] <= '9') {
            count *= 10;
            count += parseInt(fmt[i]);
        } 
        else {
            switch (fmt[i]) {
                case 'B':
                if (count !== 0) {
                    throw new ArgumentError('Invalid count in format code that does not take a count: count = ' + count);
                }

                parsed.push({count: 0, code:'B', size: 1, argumentsConsumed: 1});
                break;

                case 'H':
                if (count !== 0) {
                    throw new ArgumentError('Invalid count in format code that does not take a count: count = ' + count);
                }

                parsed.push({count: 0, code:'H', size: 2, argumentsConsumed: 1});
                break;

                case 'L':
                if (count !== 0) {
                    throw new ArgumentError('Invalid count in format code that does not take a count: count = ' + count);
                }

                parsed.push({count: 0, code:'L', size: 4, argumentsConsumed: 1});
                break;

                case 'l':
                if (count !== 0) {
                    throw new ArgumentError('Invalid count in format code that does not take a count: count = ' + count);
                }

                parsed.push({count: 0, code:'l', size: 4, argumentsConsumed: 1});
                break;

                case 'x':
                let size = Math.max(count, 1);
                parsed.push({count: count, code:'x', size: size , argumentsConsumed: 0});
                break;

                case 's':
                if (count === 0) {
                    throw new ArgumentError('Invalid count in string that should be prefixed with a count: count = ' + count);
                }

                parsed.push({count: count, code:'s', size: count, argumentsConsumed: 1});
                break;

                default:
                throw new ArgumentError('Unknown format code in expectedBufferSize: ' + fmt[i]);
            }

            count = 0;
        }
    }

    if (count != 0) {
        throw new ArgumentError("Format code ended in a number: " + fmt)
    }

    return parsed;
}

/**
 * @ngdoc object
 * @name Utilities.function:padString
 * @description
 * Pad a string by appended a given character until it reaches a fixed length
 * 
 * @param {string} input The string we are trying to pad.
 * @param {string} pad The padding character to add.
 * @param {number} length The length of the final string you want.  
 * @returns {string} The correctgly padded string.
 */
export function padString(input: string, pad: string, length: number) : string {
    if (input.length === length) {
        return input;
    }

    if (input.length > length) {
        throw new ArgumentError("String passed to padString is longer than the desired length: string = " + input);
    }

    while (input.length < length) {
        input += pad;
    }

    return input;
}

/**
 * @ngdoc object
 * @name Utilities.function:padArrayBuffer
 * @description
 * Pad a string by appending null bytes to meet a fixed length
 * 
 * @param {ArrayBuffer} input The buffer we are trying to pad.
 * @param {number} length The length of the final buffer you want.  
 * @returns {ArrayBuffer} The correctly padded ArrayBuffer.
 */
export function padArrayBuffer(input: ArrayBuffer, length: number) : ArrayBuffer {
    if (input.byteLength === length) {
        return input;
    }

    if (input.byteLength > length) {
        throw new ArgumentError("ArrayBuffer passed to padArrayBuffer is longer than the desired length: ArrayBuffer = " + input);
    }

    return appendArrayBuffer(input, new ArrayBuffer(length - input.byteLength));
}

/**
 * @ngdoc object
 * @name Utilities.function:appendArrayBuffer
 * @description
 * Append one ArrayBuffer to the end of another.
 * 
 * @param {ArrayBuffer} buffer1 The first ArrayBuffer.
 * @param {ArrayBuffer} buffer2 The second ArrayBuffer.
 * @returns {ArrayBuffer} The resulting combined ArrayBuffer.
 */
export function appendArrayBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer) : ArrayBuffer {
 
    const result = new ArrayBuffer(buffer1.byteLength + buffer2.byteLength);

    copyArrayBuffer(result, buffer1, 0, 0, buffer1.byteLength);
    copyArrayBuffer(result, buffer2, 0, buffer1.byteLength, buffer2.byteLength);

    return result;
}

/**
 * @ngdoc object
 * @name Utilities.function:expectedBufferSize
 * @description
 * Determine how large a buffer is given its binary format string
 *
 * This function takes a string describing how fixed width integers are packed
 * into a binary ArrayBuffer and calculates how large the buffer would need to
 * be to contain that many integers of those sizes.  It also support packing
 * fixed length strings that must be prefixed with a number like 18s for an
 * exactly 18 character string.
 * 
 * Alignment is not taken into account, so if you are trying to match the alignment 
 * of a structure on, e.g. a 32 bit platform, you will need to insert alignment gaps as needed.
 * 
 * ## See Also
 * {@link Utilities.function:packArrayBuffer Utilities.packArrayBuffer}
 * 
 * {@link Utilities.function:unpackArrayBuffer Utilities.unpackArrayBuffer}
 *
 * @param {string} fmt - The format we are trying to determine the size of 
 * @returns {number} The number of bytes required to store fmt
 */
export function expectedBufferSize(fmt: string): number {
    var size = 0;
    var parsed = parseBufferFormatCode(fmt);
    var i;
    
    //Calculate expected size
    for (i = 0; i < parsed.length; ++i) {
        size += parsed[i].size;
    }

    return size;
}

export function expectedArraySize(fmt: string): number {
    var size = 0;
    var parsed = parseBufferFormatCode(fmt);
    var i;
    var count = 0; //For accumulating counts like 18s
    
    //Calculate expected size
    for (i = 0; i < parsed.length; ++i) {
        size += parsed[i].argumentsConsumed;
    }

    return size;
}

/**
 * @ngdoc object
 * @name Utilities.function:packArrayBuffer
 * @description
 * Pack a series of arguments into an ArrayBuffer using a format string
 *
 * This function is a javascript equivalent of the python struct.pack function.
 * It takes a format string consisting of the letters l, L, B and H and a variable
 * list of numeric arguments.  There must be exactly as many arguments as letters
 * in the format string.  The format string is used to convert each argument into
 * a little endian binary representation of the number which is serialized into
 * an ArrayBuffer.  The resulting ArrayBuffer is returned.
 *
 * The meaning of each format code is:
 * - B: An 8 bit wide unsigned integer
 * - H: A 16 bit wide unsigned integer
 * - L: A 32 bit wide unsigned integer
 * - l: A 32 bit wide signed integer
 * - #s: A fixed length string with length given by the number preceding s, e.g. 5s for a 5 
 *   character string.  If the string argument is shorter than what is specified, it is padded
 *   with null characters.
 *   UPDATE: As of v0.2 '#s' may also represent an ArrayBuffer with a bytelength given by the
 *   number preceding 's'. If the bytelength of the ArrayBuffer argument is shorter than what
 *   is specified, the ArrayBuffer will NOT be padded and an error will be thrown.
 * - V: A variable length byte array. This must come as the last format code
 * 
 * ## Exceptions
 * - **{@link type:ArgumentError} If there is an unknown format string code or the string
 *   does not match the number or type of arguments received.
 *
 * @param {string} fmt The format string specifying the size of each argument
 * @param {number[]} arguments A variable list of numberic arguments that are packed to
 * 							   create the resulting ArrayBuffer according to fmt.
 * @returns {ArrayBuffer} The packed resulting binary array buffer
 */
export function packArrayBuffer (fmt: string, ...args: any[]) {
    if (fmt[fmt.length - 1] === 'V') {
        fmt = convertVariableLengthFormatCode(fmt, args[args.length - 1] as ArrayBuffer, true)
    }
    var parsed = parseBufferFormatCode(fmt);
    var size = expectedBufferSize(fmt);
    let argsConsumed = expectedArraySize(fmt);

    if (arguments.length !== (argsConsumed + 1)) {
        throw new ArgumentError('packArrayBuffer called with the wrong number of arguments for the format string');
    }

    var arrayBuffer = new ArrayBuffer(size);
    var view = new DataView(arrayBuffer);

    //Fill in all the data (always little endian format)
    var offset = 0;
    var arg_idx = 0;
    for (let i = 0; i < parsed.length; ++i) {
        let curr = parsed[i];
        let arg = arguments[arg_idx + 1];

        switch (curr.code) {
            case 'B':
            if ((arguments[arg_idx + 1] <= 0xFF) && (arguments[arg_idx + 1] >= 0)){
                view.setUint8(offset, arguments[arg_idx + 1]);
                offset += 1;
                arg_idx += 1;
            } else {
                throw new ArgumentError("Value must be a valid unsigned 8 bit integer");
            }
            break;

            case 'H':
            if ((arguments[arg_idx + 1] <= 0xFFFF) && (arguments[arg_idx + 1] >= 0)){
                view.setUint16(offset, arguments[arg_idx + 1], true);
                offset += 2;
                arg_idx += 1;
            } else {
                throw new ArgumentError("Value must be a valid unsigned 16 bit integer");
            }
            break;

            case 'L':
            if ((arguments[arg_idx + 1] <= 0xFFFFFFFF) && (arguments[arg_idx + 1] >= 0)){
                view.setUint32(offset, arguments[arg_idx + 1], true);
                offset += 4;
                arg_idx += 1;
            } else {
                throw new ArgumentError("Value must be a valid unsigned 32 bit integer");
            }
            break;

            case 'l':
            if ((arguments[arg_idx + 1] <= 0x7FFFFFFF) && (arguments[arg_idx + 1] >= -2147483648)){
                view.setInt32(offset, arguments[arg_idx + 1], true);
                offset += 4;
                arg_idx += 1;
            } else {
                throw new ArgumentError("Value must be a valid signed 32 bit integer");
            }
            break;

            case 'x':
            for (let j = 0; j < curr.size; ++j) {
                view.setUint8(offset++, 0);
            }
            break;

            case 's':
            if (typeof arg === 'string') {
                //If required add padding with nulls out to the fixed length specified
                arg = padString(arg, '\0', curr.size);

                for (let j = 0; j < curr.size; ++j) {
                    view.setUint8(offset++, arg.charCodeAt(j));
                }
            } else if (arg instanceof ArrayBuffer) {
                if (arg.byteLength !== curr.size) {
                    throw new ArgumentError(`ArrayBuffer size does not match format code: expected=${curr.size}, actual=${arg.byteLength}`)
                }
                copyArrayBuffer(arrayBuffer, arg, 0, offset, curr.size);
                offset += curr.size;
            }
            
            arg_idx += 1;
            break;

            default:
            throw new ArgumentError('Unknown format code in packArrayBuffer: ' + fmt[i]);
        }
    }

    return arrayBuffer;
}

/**
 * @ngdoc object
 * @name Utilities.function:unpackArrayBuffer
 * @description
 * Unpack an ArrayBuffer into a list of numeric values using a format string
 *
 * This function is a javascript equivalent of the python struct.unpack function.
 * It takes a format string consisting of the letters l, L, B and H and a single ArrayBuffer.
 * The format string is used to decode the ArrayBuffer into a list of numbers assuming
 * that those numbers are encoded into fixed width integers in little endian format in
 * the ArrayBuffer.
 *
 * The meaning of each format code is:
 * - B: An 8 bit wide unsigned integer
 * - H: A 16 bit wide unsigned integer
 * - L: A 32 bit wide unsigned integer
 * - l: A 32 bit wide signed integer
 * - [#]x: one or more padding bytes
 * - #s: A fixed length string.  # should be a decimal number, e.g. 5s or 18s
 * - V: A variable length byte array. This must come as the last format code.
 *   NOTE: Data upacked from a 'V' code will be returned as a string.
 * 
 * ## Exceptions
 * - **{@link type:ArgumentError} If there is an unknown format string code or the string
 *   does not match the data contained inside the ArrayBuffer.
 *
 * @param {string} fmt The format string specifying the size of each argument
 * @param {ArrayBuffer} buffer The packed ArrayBuffer that should be decoded using fmt
 * @returns {number[]} A list of numbers decoded from the buffer using fmt
 */
export function unpackArrayBuffer(fmt: string, buffer: ArrayBuffer | SharedArrayBuffer) {
    fmt = convertVariableLengthFormatCode(fmt, buffer as ArrayBuffer, false);
    var size = expectedBufferSize(fmt);
    var parsed = parseBufferFormatCode(fmt);
    var i;

    if (size !== buffer.byteLength) {
        throw new ArgumentError('unpackArrayBuffer called on buffer with invalid size');
    }

    var view = new DataView(buffer);
    var args = [];

    //Fill in all the data (always little endian format)
    var offset = 0;
    var val;
    for (i = 0; i < parsed.length; ++i) {
        let entry = parsed[i];
        let stringData;

        switch (entry.code) {
            case 'B':
            val = view.getUint8(offset);
            offset += 1;
            break;

            case 'H':
            val = view.getUint16(offset, true);
            offset += 2;
            break;

            case 'L':
            val = view.getUint32(offset, true);
            offset += 4;
            break;

            case 'l':
            val = view.getInt32(offset, true);
            offset += 4;
            break;

            case 'x':
            val = undefined;
            offset += Math.max(entry.count, 1);
            break;

            case 's':
            stringData = new Uint8Array(buffer.slice(offset, offset+entry.size));
            val = String.fromCharCode.apply(null, stringData);
            offset += entry.size;
            break;

            default:
            throw new ArgumentError('Unknown format code in packArrayBuffer: ' + fmt[i]);
        }

        if (val != undefined){
            args.push(val);
        }
    }

    return args;
}

/**
 * @ngdoc object
 * @name Utilities.function:copyArrayBuffer
 * @description
 * Copy an ArrayBuffer into another one like memcpy
 *
 * This function is a javascript translation of memcpy. It takes a source and destination
 * ArrayBuffer, an offset into both and a length of bytes to copy.  In slicing syntax,
 * this function does the following:
 * 
 * dest[destOffset:destOffset+length] = src[srcOffset:srcOffset+length]
 * 
 * * ## Exceptions
 * - **{@link type:InsufficientSpaceError InsufficentSpaceError}:** If there is not space in the destination buffer
 *   to hold the copied data. This function will not expand the size of the destination buffer, so it must already be allocated 
 *   with enough space for the copied data.
 * 
 * @param {ArrayBuffer} dest The destination buffer that we should copy into.  There must be enough
 *   space in dest to hold what you are copying.  This function will not allocate
 *   more space for you.
 * @param {ArrayBuffer} src  The source buffer to copy from
 * @param {number} srcOffset The offset in src to start copying from, 0 would mean copy from the beginning
 * @param {number} destOffset The offset in dest to start copying into, 0 would mean to copy to the beginning
 *   of dest.
 * @param {number} length The number of bytes to copy from src into dest.
 * @throws {InsufficientSpaceError} If there is not space in the destination buffer to hold the copied data.
 */
export function copyArrayBuffer(dest: ArrayBuffer, src: ArrayBuffer | SharedArrayBuffer, srcOffset: number, destOffset: number, length: number) {
    let srcArray = new Uint8Array(src, srcOffset, length);
    let dstArray = new Uint8Array(dest, 0);

    if ((destOffset + length) > dest.byteLength) {
        throw new InsufficientSpaceError('Attempting to copy an ArrayBuffer without enough space in destination');
    }

    dstArray.set(srcArray, destOffset);
}

/**
 * @ngdoc object
 * @name Utilities.object:base64ToArrayBuffer
 * @description
 * Decode a Base 64 encoded string into an ArrayBuffer
 * 
 * @param {string} encodedString The base 64 encoded string
 * @returns {ArrayBuffer} The decoded ArrayBuffer
 */
export function base64ToArrayBuffer(encodedString: string) {
    var raw = window.atob(encodedString);
    var rawLength = raw.length;
    var rawArray = new ArrayBuffer(rawLength);
    var array = new Uint8Array(rawArray);

    for(let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }

    return rawArray;
}
