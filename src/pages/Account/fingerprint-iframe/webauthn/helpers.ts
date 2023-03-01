import * as base64url from './base64url-arraybuffer';

export var bufferToString = (buff: any) => {
  var enc = new TextDecoder(); // always utf-8
  return enc.decode(buff);
};

export var getEndian = () => {
  let arrayBuffer = new ArrayBuffer(2);
  let uint8Array = new Uint8Array(arrayBuffer);
  let uint16array = new Uint16Array(arrayBuffer);
  uint8Array[0] = 0xaa; // set first byte
  uint8Array[1] = 0xbb; // set second byte

  if (uint16array[0] === 0xbbaa) return 'little';
  else return 'big';
};

export var readBE16 = (buffer: any) => {
  if (buffer.length !== 2) throw new Error('Only 2byte buffer allowed!');

  if (getEndian() !== 'big') buffer = buffer.reverse();

  return new Uint16Array(buffer.buffer)[0];
};

export var readBE32 = (buffer: any) => {
  if (buffer.length !== 4) throw new Error('Only 4byte buffers allowed!');

  if (getEndian() !== 'big') buffer = buffer.reverse();

  return new Uint32Array(buffer.buffer)[0];
};

export var bufToHex = (buffer: any) => {
  // buffer is an ArrayBuffer
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
};

// https://gist.github.com/herrjemand/dbeb2c2b76362052e5268224660b6fbc
export var parseAuthData = (buffer: any) => {
  let rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);
  let flagsBuf = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  let flagsInt = flagsBuf[0];
  let flags = {
    up: !!(flagsInt & 0x01),
    uv: !!(flagsInt & 0x04),
    at: !!(flagsInt & 0x40),
    ed: !!(flagsInt & 0x80),
    flagsInt,
  };

  let counterBuf = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  let counter = readBE32(counterBuf);

  let aaguid = undefined;
  let credID = undefined;
  let COSEPublicKey = undefined;

  if (flags.at) {
    aaguid = buffer.slice(0, 16);
    buffer = buffer.slice(16);
    let credIDLenBuf = buffer.slice(0, 2);
    buffer = buffer.slice(2);
    let credIDLen = readBE16(credIDLenBuf);
    credID = buffer.slice(0, credIDLen);
    buffer = buffer.slice(credIDLen);
    COSEPublicKey = buffer;
  }

  return {
    rpIdHash,
    flagsBuf,
    flags,
    counter,
    counterBuf,
    aaguid,
    credID,
    COSEPublicKey,
  };
};

export var generateRandomBuffer = (length: any) => {
  if (!length) length = 32;

  var randomBuff = new Uint8Array(length);
  window.crypto.getRandomValues(randomBuff);
  return randomBuff;
};

export var publicKeyCredentialToJSON: any = (pubKeyCred: any) => {
  if (pubKeyCred instanceof Array) {
    let arr = [];
    for (let i of pubKeyCred) arr.push(publicKeyCredentialToJSON(i));

    return arr;
  }

  if (pubKeyCred instanceof ArrayBuffer) {
    return base64url.encode(pubKeyCred);
  }

  if (pubKeyCred instanceof Object) {
    let obj: any = {};

    for (let key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
    }

    return obj;
  }

  return pubKeyCred;
};

export var preformatMakeCredReq = (makeCredReq: any) => {
  makeCredReq.challenge = base64url.decode(makeCredReq.challenge);
  makeCredReq.user.id = base64url.decode(makeCredReq.user.id);

  return makeCredReq;
};

export var preformatGetAssertReq = (getAssert: any) => {
  getAssert.challenge = base64url.decode(getAssert.challenge);

  if (getAssert.allowCredentials) {
    for (let allowCred of getAssert.allowCredentials) {
      allowCred.id = base64url.decode(allowCred.id);
    }
  }

  return getAssert;
};
