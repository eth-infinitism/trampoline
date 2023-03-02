import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import * as utils from '../webauthn/utils';
// import elliptic from 'elliptic';
// import { decode } from '../webauthn/base64url-arraybuffer';
// import { ECDSASigValue } from '@peculiar/asn1-ecc';
// import { AsnParser } from '@peculiar/asn1-schema';
// import base64url from 'base64url';
// import * as Helper from '../webauthn/helpers';
import { CircularProgress } from '@mui/material';
// import crypto from 'crypto';
import {
  createCredential,
  getCredential,
  getPublicKey,
  getSignature,
  toHash,
} from '../webauthn';
import { encode } from '../webauthn/base64url-arraybuffer';
import { toBuffer } from '../webauthn/utils';
import base64url from 'base64url';
import * as Helper from '../webauthn/helpers';

// enum COSEKEYS {
//   kty = 1,
//   alg = 3,
//   crv = -1,
//   x = -2,
//   y = -3,
//   n = -1,
//   e = -2,
// }

// const EC = elliptic.ec;
// const ec = new EC('p256');

// function getAlgoName(num: any) {
//   switch (num) {
//     case -7:
//       return 'ES256';
//     // case -8 ignored to to its rarity
//     case -257:
//       return 'RS256';
//     default:
//       throw new Error(`Unknown algorithm code: ${num}`);
//   }
// }

// function toHash(data: crypto.BinaryLike, algo = 'SHA256') {
//   return crypto.createHash(algo).update(data).digest();
// }

// function shouldRemoveLeadingZero(bytes: Uint8Array): boolean {
//   return bytes[0] === 0x0 && (bytes[1] & (1 << 7)) !== 0;
// }

export const RequestSign = () => {
  const { chromeid, requestId = '', credentialId = '' } = useParams();

  useEffect(() => {
    const requestSignSync = async () => {
      try {
        const publicKeyCredential: any = await getCredential(
          credentialId,
          requestId
        );

        const signature = await getSignature(publicKeyCredential);
        console.log('signature', JSON.stringify(signature));

        console.log('requestId', requestId);
        const base64RequestId = base64url.encode(requestId);
        console.log(
          'base64RequestId',
          Buffer.from(base64RequestId).toString('hex')
        );

        const authDataBuffer = Buffer.from(
          publicKeyCredential.response.authenticatorData
        );
        console.log('authDataBuffer', authDataBuffer.toString('hex'));

        const clientDataJSON = Buffer.from(
          publicKeyCredential.response.clientDataJSON
        );
        console.log('clientDataJSON', clientDataJSON.toString('hex'));

        const clientDataHash = toHash(clientDataJSON);
        console.log('clientDataHash', clientDataHash.toString('hex'));

        const signatureBase = Buffer.concat([authDataBuffer, clientDataHash]);
        console.log('signatureBase', signatureBase.toString('hex'));
        // ---- PERFECT TILL HERE ----

        const messageHash = toHash(signatureBase);
        console.log('messageHash', messageHash.toString('hex'));

        await chrome.runtime.sendMessage(chromeid, {
          signature,
          clientDataJSON: '0x' + clientDataJSON.toString('hex'),
          authDataBuffer: '0x' + authDataBuffer.toString('hex'),
        });
      } catch (e) {
        console.log(e);
        await chrome.runtime.sendMessage(chromeid, 'Denied');
      }
      setTimeout(() => {
        window.close();
      }, 100);
    };

    requestSignSync();
  }, [chromeid, requestId, credentialId]);

  return (
    <CircularProgress
      size={24}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: '-12px',
        marginLeft: '-12px',
      }}
    />
  );
};
