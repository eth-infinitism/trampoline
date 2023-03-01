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
import { getCredential, getSignature } from '../webauthn';
import { encode } from '../webauthn/base64url-arraybuffer';
import { toBuffer } from '../webauthn/utils';
import base64url from 'base64url';

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

        const clientDataJSON =
          '0x' +
          Buffer.from(publicKeyCredential.response.clientDataJSON).toString(
            'hex'
          );

        console.log(
          requestId,
          'requestId',
          base64url.encode(requestId),
          Buffer.from(base64url.encode(requestId)).toString('hex')
        );

        console.log('clientDataJSON', clientDataJSON);

        await chrome.runtime.sendMessage(chromeid, {
          signature,
          clientDataJSON,
        });
      } catch (e) {
        console.log(e);
        await chrome.runtime.sendMessage(chromeid, 'Denied');
      }
      setTimeout(() => {
        // window.close();
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
