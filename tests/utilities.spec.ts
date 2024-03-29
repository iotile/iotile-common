import * as Utilities from "../src/utilities";

describe('namespace: Utilities, function: delay', function () {
  it('should delay with async/await', async function(done) {
  	await Utilities.delay(10);
  	done();
  })
});

describe('namespace: Utilities, function: joinPath', function () {
  it('should join correctly', function () {
  	let joined = Utilities.joinPath("/", "abc/def");
    expect(joined).toBe("/abc/def");

    joined = Utilities.joinPath("file:///data", "abc/def");
    expect(joined).toBe("file:///data/abc/def");
    
    joined = Utilities.joinPath("/abcd/", "/dev");
    expect(joined).toBe("/abcd/dev");
    
    joined = Utilities.joinPath("/", "/dev");
    expect(joined).toBe("/dev");
  })
});

describe('namespace: Utilities, function: expectedBufferSize', function () {
  it('should calculate correct buffer sizes', function() {
  	let size = Utilities.expectedBufferSize("BBHL");
    expect(size).toEqual(8);
  })

  it('should create correct buffer sizes with padding bytes', function() {
  	let size = Utilities.expectedBufferSize("H18x");
    expect(size).toEqual(20);

    size = Utilities.expectedBufferSize("H1x");
    expect(size).toEqual(3);

    size = Utilities.expectedBufferSize("8x");
    expect(size).toEqual(8);

    size = Utilities.expectedBufferSize("x");
    expect(size).toEqual(1);
  })

  it('should calculate correct buffer sizes with string', function() {
  	let size = Utilities.expectedBufferSize("H18s");
    expect(size).toEqual(20);

    size = Utilities.expectedBufferSize("H1s");
    expect(size).toEqual(3);

    size = Utilities.expectedBufferSize("8s");
    expect(size).toEqual(8);
  })

  it('should not allow counts in front of nonstrings/padding bytes', function(done) {
  	try {
      let size = Utilities.expectedBufferSize("18H");
      done.fail("expectedBufferSize did not throw on count in front of nonstring");
    } catch (err) {
      done();
    }
  })

  it('should require counts in front of strings', function(done) {
  	try {
      let size = Utilities.expectedBufferSize("Hs");
      done.fail("expectedBufferSize did not throw on lack of count in front of string");
    } catch (err) {
      done();
    }
  })

  it('should not allow counts without a format code', function(done) {
  	try {
      let size = Utilities.expectedBufferSize("H18");
      done.fail("expectedBufferSize did not throw on count without a format code");
    } catch (err) {
      done();
    }
  })
});

describe('namespace: Utilities, function: appendArrayBuffer', function () {
  it('appends one buffer to another', function() {
    const buffer1 = new Uint8Array([0x32, 0x33]).buffer;
    const buffer2 = new Uint8Array([0x45, 0x46, 0x47]).buffer;
    const combined = Utilities.appendArrayBuffer(buffer1 as any, buffer2 as any);
    const [combinedStr] = Utilities.unpackArrayBuffer(buffer1.byteLength + buffer2.byteLength + 's', combined); //The unpack functionality is checked in a separate unit test

    expect(combined.byteLength).toEqual(buffer1.byteLength + buffer2.byteLength);
    expect(combinedStr).toEqual('23EFG')
  })
})

describe('namespace: Utilities, function: padArrayBuffer', function () {
  it('pads null bytes to an ArrayBuffer', function() {
    const buffer = new Uint8Array([0x32, 0x33]).buffer;
    const padLength = 5;
    const padded = Utilities.padArrayBuffer(buffer as any, padLength);

    expect(padded.byteLength).toEqual(padLength);

    let paddedWithZeros = true;

    const bufferU8 = new Uint8Array(buffer);
    const paddedU8 = new Uint8Array(padded);
    for (let i = 0; i < padLength; i++) {
      if (i < bufferU8.length && bufferU8[i] !== paddedU8[i]) {
        paddedWithZeros = false
      } else if (i >= bufferU8.length && paddedU8[i] !== 0) {
        paddedWithZeros = false
      }
    }

    expect(paddedWithZeros).toEqual(true)
  })

  it('throws an error if input is longer than padded length', function() {
    
    const buffer = new Uint8Array([0x32, 0x33]).buffer;
    const padLength = 1;

    expect(function() {
      Utilities.padArrayBuffer(buffer as any, padLength);
    }).toThrow();
  })
})

describe('namespace: Utilities, function: convertVariableLengthFormatCode', function () {
  it('returns original code if no "V" at end', function() {
    const fmt = 'HB';
    const convertedFmt = Utilities.convertVariableLengthFormatCode(fmt, new ArrayBuffer(1), true);
    expect(fmt).toEqual(convertedFmt);
  })

  it('converts "V" to "#s" for "packArrayBuffer"', function() {
    const fmt = 'BBV';
    const convertedFmt = Utilities.convertVariableLengthFormatCode(fmt, new ArrayBuffer(6), true);
    expect(convertedFmt).toEqual('BB6s');
  })

  it('converts "V" to "#s" for "unpackArrayBuffer"', function() {
    const fmt = 'BBV';
    const convertedFmt = Utilities.convertVariableLengthFormatCode(fmt, new ArrayBuffer(6), false);
    expect(convertedFmt).toEqual('BB4s');
  })

  it('should not return a string format if the count is 0', function() {
    const fmt = 'BBV';
    const convertedFmt = Utilities.convertVariableLengthFormatCode(fmt, new ArrayBuffer(2), false);
    expect(convertedFmt).toEqual('BB');
  })

  
})

describe('namespace: Utilities, function: stringToBuffer', function () {
  it('converts a string to an ArrayBuffer', function() {
    const str = '23EF';
    const buffer = new Uint8Array(Utilities.stringToBuffer(str));
    expect(buffer.length).toEqual(4);
    expect(buffer[0]).toEqual(0x32);
    expect(buffer[1]).toEqual(0x33);
    expect(buffer[2]).toEqual(0x45);
    expect(buffer[3]).toEqual(0x46);
  })
})

describe('namespace: Utilities, function: toUint32', function () {
  it('converts a number to Uint32 format', function() {
    const num = Number.parseInt("0xFF") << 24
    const Int32Str = num.toString(16);
    const Uint32Str = Utilities.toUint32(num).toString(16);
    expect(Int32Str).toEqual("-1000000");
    expect(Uint32Str).toEqual("ff000000");
  })
})

describe('namespace: Utilities, function: unpackArrayBuffer', function () {
  it('should unpack strings from buffers', function() {
    let data = Uint8Array.from([18, 0, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82]);

  	let [length, stringObject] = Utilities.unpackArrayBuffer("H18s", data.buffer);

    expect(length).toEqual(18);
    expect(stringObject.length).toEqual(18);
    expect(stringObject).toEqual('ABCDEFGHIJKLMNOPQR');

  })

  it('should handle variable length byte arrays', function() {
    let data = Uint8Array.from([18, 0, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82]);

  	let [length, stringObject] = Utilities.unpackArrayBuffer("HV", data.buffer);

    expect(length).toEqual(18);
    expect(stringObject.length).toEqual(18);
    expect(stringObject).toEqual('ABCDEFGHIJKLMNOPQR');

  })

  it('should unpack buffers with padding bytes, dropping the padding', function() {
    let data = Uint8Array.from([0, 18, 0, 3, 0, 234, 0]); // Should drop padding bytes even if nonzero

  	let [first, second] = Utilities.unpackArrayBuffer("xB3xBx", data.buffer);

    expect(first).toEqual(18);
    expect(second).toEqual(234);
  })

  it('should unpack signed ints from buffers', function() {
    let signedData = Int32Array.from([-1, -2, -3, -4, -5, -6, -7, -8, -9, -2147483648]);

    let [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10] = Utilities.unpackArrayBuffer("llllllllll", signedData.buffer);
    expect(l1).toEqual(-1);
    expect(l2).toEqual(-2);
    expect(l3).toEqual(-3);
    expect(l4).toEqual(-4);
    expect(l5).toEqual(-5);
    expect(l6).toEqual(-6);
    expect(l7).toEqual(-7);
    expect(l8).toEqual(-8);
    expect(l9).toEqual(-9);
    expect(l10).toEqual(-2147483648);  
  })
})

describe('namespace: Utilities, function: packArrayBuffer', function () {
  it('should pack strings into buffers', function() {
  	let arrBuff = Utilities.packArrayBuffer("H18s", 18, 'ABCDEFGHIJKLMNOPQR');
    let [length, stringObject] = Utilities.unpackArrayBuffer("H18s", arrBuff); //The unpack functionality is checked in a separate unit test

    expect(length).toEqual(18);
    expect(stringObject.length).toEqual(18);
    expect(stringObject).toEqual('ABCDEFGHIJKLMNOPQR');
  })

  it('should pack ArrayBuffers into buffers', function() {
    let argBuff = new Uint8Array([0x32, 0x33, 0x45, 0x46]).buffer;
  	let arrBuff = Utilities.packArrayBuffer("H4sB", 18, argBuff, 5);
    let [length, stringObject, footer] = Utilities.unpackArrayBuffer("H4sB", arrBuff); //The unpack functionality is checked in a separate unit test

    expect(length).toEqual(18);
    expect(stringObject.length).toEqual(4);
    expect(stringObject).toEqual('23EF');
    expect(footer).toEqual(5);
  })

  it('should pack padding bytes into buffers', function() {
    let arrBuff = Utilities.packArrayBuffer("H2xL", 18, 234);
    let [first, second] = Utilities.unpackArrayBuffer("H2xL", arrBuff); //The unpack functionality is checked in a separate unit test

    expect(arrBuff.byteLength).toEqual((2+1+1+4));
    expect(first).toEqual(18);
    expect(second).toEqual(234);

    arrBuff = Utilities.packArrayBuffer("H2xLx", 18, 234);
    [first, second] = Utilities.unpackArrayBuffer("H2xLx", arrBuff); //The unpack functionality is checked in a separate unit test

    expect(arrBuff.byteLength).toEqual((1+2+1+1+4));
    expect(first).toEqual(18);
    expect(second).toEqual(234);

  	arrBuff = Utilities.packArrayBuffer("xH2xL", 18, 234);
    [first, second] = Utilities.unpackArrayBuffer("xH2xL", arrBuff); //The unpack functionality is checked in a separate unit test

    expect(arrBuff.byteLength).toEqual((1+2+1+1+4));
    expect(first).toEqual(18);
    expect(second).toEqual(234);
  })

  it('should pack signed ints into buffers', function(){
    let arrBuff = Utilities.packArrayBuffer("lll", -45, -2345, -345);
    let [l1, l2, l3] = Utilities.unpackArrayBuffer("lll", arrBuff);

    expect(l1).toEqual(-45);
    expect(l2).toEqual(-2345);
    expect(l3).toEqual(-345);
  })

  it('should pack variable length byte arrays into buffers', function(){
    let arrBuff = Utilities.packArrayBuffer("llV", -45, -2345, new Uint8Array([0x45, 0x46]).buffer);
    let [l1, l2, V] = Utilities.unpackArrayBuffer("llV", arrBuff);

    expect(l1).toEqual(-45);
    expect(l2).toEqual(-2345);
    expect(V).toEqual('EF');
  })

  it('should not pack overflowing ints into buffers', function(){
    expect(function() {
      Utilities.packArrayBuffer("B", 256);
    }).toThrow();
    expect(function() {
      Utilities.packArrayBuffer("H", 65536);
    }).toThrow();
    expect(function() {
      Utilities.packArrayBuffer("L", (0xFFFFFFFF + 1));
    }).toThrow();
    expect(function() {
      Utilities.packArrayBuffer("l", (0x7FFFFFFF + 1));
    }).toThrow();
  })

  it('should pad shorts strings with nulls before packing', function() {
  	let arrBuff = Utilities.packArrayBuffer("H18s", 18, 'ABCDEFGHIJKLMNO');
    let [length, stringObject] = Utilities.unpackArrayBuffer("H18s", arrBuff); //The unpack functionality is checked in a separate unit test

    expect(length).toEqual(18);
    expect(stringObject.length).toEqual(18);
    expect(stringObject).toEqual('ABCDEFGHIJKLMNO\0\0\0');
  })
})

describe('namespace: Utilities, function: deviceIDToSlug', function () {
  it('should create correct slugs', function() {
  	let slug1 = Utilities.deviceIDToSlug(0xab);
    expect(slug1).toBe('d--0000-0000-0000-00ab');

    let slug2 = Utilities.deviceIDToSlug(0x90);
    expect(slug2).toBe('d--0000-0000-0000-0090');

    let slug3 = Utilities.deviceIDToSlug(0xABCDEF12);
    expect(slug3).toBe('d--0000-0000-abcd-ef12');
  })
});

describe('namespace: Utilities, function: createStreamerSlug', function () {
  it('should create correct streamer slugs', function() {
  	let slug1 = Utilities.createStreamerSlug(0xab, 0);
    expect(slug1).toBe('t--0000-0000-0000-00ab--0000');

    let slug2 = Utilities.createStreamerSlug(0x90, 0xAB);
    expect(slug2).toBe('t--0000-0000-0000-0090--00ab');

    let slug3 = Utilities.createStreamerSlug(0xABCDEF12, 1);
    expect(slug3).toBe('t--0000-0000-abcd-ef12--0001');
  })
});

describe('namespace: Utilities, function: numberToHexString', function () {
  it('should create correctly padded hex strings', function() {
  	let slug1 = Utilities.numberToHexString(0xab, 2);
    expect(slug1).toBe('ab');

    let slug2 = Utilities.numberToHexString(0x90, 4);
    expect(slug2).toBe('0090');

    let slug3 = Utilities.numberToHexString(0xABCDEF12, 12);
    expect(slug3).toBe('0000abcdef12');
  })
});

describe('namespace: Utilities, function: base64ToArrayBuffer, arrayBufferToBase64', function () {
  it('should correctly convert', function() {
    let string = "AgEaCv9MABAFAxxEr9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  	
    let buffer = Utilities.base64ToArrayBuffer(string);

    let u8array = new Uint8Array(buffer);

    expect(u8array[13]).toBe(208);
    
    let convertedString = Utilities.arrayBufferToBase64(buffer);

    expect(convertedString).toEqual(string)
  })
});