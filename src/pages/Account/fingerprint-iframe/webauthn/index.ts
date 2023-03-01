import * as cbor from './cbor';
import elliptic from 'elliptic';
import base64url from 'base64url';
import { ECDSASigValue } from '@peculiar/asn1-ecc';
import { AsnParser } from '@peculiar/asn1-schema';
import { AuthenticatorAssertionResponseJSON } from '@simplewebauthn/typescript-types';
import * as utils from './utils';
import { v4 as uuidv4 } from 'uuid';
import { parseAuthData, publicKeyCredentialToJSON } from './helpers';
import { decode } from './base64url-arraybuffer';
import crypto from 'crypto';

export enum COSEKEYS {
  kty = 1,
  alg = 3,
  crv = -1,
  x = -2,
  y = -3,
  n = -1,
  e = -2,
}

export function toHash(data: any, algo = 'SHA256') {
  return crypto.createHash(algo).update(data).digest();
}

export function shouldRemoveLeadingZero(bytes: Uint8Array): boolean {
  return bytes[0] === 0x0 && (bytes[1] & (1 << 7)) !== 0;
}

const EC = elliptic.ec;
const ec = new EC('p256');

export const createCredential = async (
  username: string
): Promise<Credential | null> => {
  return navigator.credentials.create({
    publicKey: {
      rp: {
        id: window.location.hostname,
        name: window.location.hostname,
      },
      user: {
        id: await utils.sha256(new TextEncoder().encode(username)),
        name: username,
        displayName: username,
      },
      challenge: utils.parseBase64url(uuidv4()),
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      attestation: 'direct',
      authenticatorSelection: {
        userVerification: 'required', // Webauthn default is "preferred"
        authenticatorAttachment: 'platform',
      },
    },
  });
};

export const getCredential = async (
  credentialId: string,
  challenge: string
): Promise<Credential | null> => {
  return navigator.credentials.get({
    publicKey: {
      rpId: window.location.hostname,
      challenge: utils.toBuffer(challenge),
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: [
        {
          id: decode(credentialId),
          type: 'public-key',
          // transports: ['internal'],
        },
      ],
    },
  });
};

export const getPublicKey = async (attestationObject: Buffer) => {
  const authData = cbor.decode(attestationObject, undefined, undefined)
    .authData as Uint8Array;

  let authDataParsed = parseAuthData(authData);

  let pubk = cbor.decode(
    authDataParsed.COSEPublicKey.buffer,
    undefined,
    undefined
  );

  const x = pubk[COSEKEYS.x];
  const y = pubk[COSEKEYS.y];

  const pk = ec.keyFromPublic({ x, y });

  const publicKey = [
    '0x' + pk.getPublic('hex').slice(2, 66),
    '0x' + pk.getPublic('hex').slice(-64),
  ];

  return publicKey;
};

export const getAuthenticatorBytes = (attestationObject: Buffer) => {
  const authData = cbor.decode(attestationObject, undefined, undefined)
    .authData as Uint8Array;

  let authDataParsed = authData.slice(0, 37);

  return authDataParsed;
};

export const getSignature = async (publicKeyCredential: any) => {
  const publicKeyCredentialParsed =
    publicKeyCredentialToJSON(publicKeyCredential);

  const parsedSignature = AsnParser.parse(
    base64url.toBuffer(publicKeyCredentialParsed.response.signature),
    ECDSASigValue
  );

  let rBytes = new Uint8Array(parsedSignature.r);
  let sBytes = new Uint8Array(parsedSignature.s);

  if (shouldRemoveLeadingZero(rBytes)) {
    rBytes = rBytes.slice(1);
  }

  if (shouldRemoveLeadingZero(sBytes)) {
    sBytes = sBytes.slice(1);
  }

  const signature = [
    '0x' + Buffer.from(rBytes).toString('hex'),
    '0x' + Buffer.from(sBytes).toString('hex'),
  ];
  return signature;
};

/**
 * Parse the WebAuthn data payload and to create the inputs to verify the secp256r1/p256 signatures
 * in the EllipticCurve.sol contract, see https://github.com/tdrerup/elliptic-curve-solidity
 */
export const authResponseToSigVerificationInput = (
  // Assumes the public key is on the secp256r1/p256 curve
  credentialPublicKey: Buffer,
  authResponse: AuthenticatorAssertionResponseJSON
) => {
  const authDataBuffer = base64url.toBuffer(authResponse.authenticatorData);
  const clientDataHash = toHash(
    base64url.toBuffer(authResponse.clientDataJSON)
  );

  const signatureBase = Buffer.concat([authDataBuffer, clientDataHash]);

  // See https://github.dev/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/helpers/iso/isoCrypto/verifyEC2.ts
  // for extraction of the r and s bytes from the raw signature buffer
  const parsedSignature = AsnParser.parse(
    base64url.toBuffer(authResponse.signature),
    ECDSASigValue
  );
  let rBytes = new Uint8Array(parsedSignature.r);
  let sBytes = new Uint8Array(parsedSignature.s);

  if (shouldRemoveLeadingZero(rBytes)) {
    rBytes = rBytes.slice(1);
  }

  if (shouldRemoveLeadingZero(sBytes)) {
    sBytes = sBytes.slice(1);
  }

  // See convertCOSEtoPKCS.js
  const struct = cbor.decodeAllSync(credentialPublicKey)[0];
  const x = struct.get(COSEKEYS.x);
  const y = struct.get(COSEKEYS.y);

  const pk = ec.keyFromPublic({ x, y });

  // Message data in sha256 hash
  const messageHash = '0x' + toHash(signatureBase).toString('hex');
  // r and s values
  const signature = [
    '0x' + Buffer.from(rBytes).toString('hex'),
    '0x' + Buffer.from(sBytes).toString('hex'),
  ];
  // x and y coordinates
  const publicKey = [
    '0x' + pk.getPublic('hex').slice(2, 66),
    '0x' + pk.getPublic('hex').slice(-64),
  ];

  // Pass the following data to the EllipticCurve.validateSignature smart contract function
  return { messageHash, signature, publicKey };
};
