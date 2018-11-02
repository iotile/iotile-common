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
  	let size = Utilities.expectedBufferSize("H18x", true);
    expect(size).toEqual(20);

    size = Utilities.expectedBufferSize("H1x", true);
    expect(size).toEqual(3);

    size = Utilities.expectedBufferSize("8x", true);
    expect(size).toEqual(8);

    size = Utilities.expectedBufferSize("x", true);
    expect(size).toEqual(1);

    size = Utilities.expectedBufferSize("H18x");
    expect(size).toEqual(2);

    size = Utilities.expectedBufferSize("H1x");
    expect(size).toEqual(2);

    size = Utilities.expectedBufferSize("8x");
    expect(size).toEqual(0);

    size = Utilities.expectedBufferSize("x");
    expect(size).toEqual(0);
  })

  it('should calculate correct buffer sizes with string', function() {
  	let size = Utilities.expectedBufferSize("H18s");
    expect(size).toEqual(20);

    size = Utilities.expectedBufferSize("H1s");
    expect(size).toEqual(3);

    size = Utilities.expectedBufferSize("8s");
    expect(size).toEqual(8);
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

describe('namespace: Utilities, function: unpackArrayBuffer', function () {
  it('should unpack strings from buffers', function() {
    let data = Uint8Array.from([18, 0, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82]);

  	let [length, stringObject] = Utilities.unpackArrayBuffer("H18s", data.buffer);

    expect(length).toEqual(18);
    expect(stringObject.length).toEqual(18);
    expect(stringObject).toEqual('ABCDEFGHIJKLMNOPQR');

  })

  it('should unpack buffers with padding bytes, dropping the padding', function() {
    let data = Uint8Array.from([0, 18, 0, 3, 0, 234, 0]); // Should drop padding bytes even if nonzero

  	let [first, second] = Utilities.unpackArrayBuffer("xB3xHx", data.buffer);

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