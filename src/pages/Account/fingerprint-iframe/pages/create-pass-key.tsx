import { CircularProgress } from '@mui/material';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getAuthenticatorBytes,
  createCredential,
  getPublicKey,
} from '../webauthn';

export const CreatePassKey = () => {
  const { chromeid, name: username = 'test' } = useParams();

  useEffect(() => {
    const createPassKeySync = async () => {
      try {
        const credential: any = await createCredential(username);

        const publicKey = await getPublicKey(
          credential.response.attestationObject
        );

        const authenticatorDataBytes =
          '0x' +
          Buffer.from(
            getAuthenticatorBytes(credential.response.attestationObject)
          ).toString('hex');

        const credentialId = credential.id;

        await chrome.runtime.sendMessage(chromeid, {
          authenticatorDataBytes,
          credentialId,
          q0: publicKey[0],
          q1: publicKey[1],
        });
      } catch (e) {
        console.log(e);
        await chrome.runtime.sendMessage(chromeid, 'Denied');
      }
      setTimeout(() => {
        window.close();
      }, 100);
    };

    createPassKeySync();
  }, [username, chromeid]);

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
