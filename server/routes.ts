import express, { Express } from 'express';
import { ethers } from 'ethers';
import { UserOperationStruct } from '@account-abstraction/contracts';

const apirouter = express.Router();

const paymasterRouter = express.Router();

const getStackupPaymasterAndData = async (
  provider: ethers.providers.JsonRpcProvider,
  {
    userOp,
    entryPoint,
  }: {
    userOp: UserOperationStruct;
    entryPoint: string;
  }
): Promise<{
  callGasLimit: string;
  paymasterAndData: string;
  preVerificationGas: string;
  verificationGasLimit: string;
}> => {
  const paymasterRPC = new ethers.providers.JsonRpcProvider(
    process.env.PAYMASTER_SERVICE_URL,
    {
      name: 'Paymaster',
      chainId: (await provider.getNetwork()).chainId,
    }
  );

  const response: {
    callGasLimit: string;
    paymasterAndData: string;
    preVerificationGas: string;
    verificationGasLimit: string;
  } = await paymasterRPC.send('pm_sponsorUserOperation', [
    userOp,
    entryPoint,
    {
      type: 'payg',
    },
  ]);

  return response;
};

const getAlchecmyPaymasterAndData = async (
  provider: ethers.providers.JsonRpcProvider,
  {
    userOp,
    entryPoint,
  }: {
    userOp: UserOperationStruct;
    entryPoint: string;
  }
): Promise<{
  callGasLimit: string;
  paymasterAndData: string;
  preVerificationGas: string;
  verificationGasLimit: string;
}> => {
  const paymasterRPC = new ethers.providers.JsonRpcProvider(
    process.env.PAYMASTER_SERVICE_URL,
    {
      name: 'Paymaster',
      chainId: (await provider.getNetwork()).chainId,
    }
  );

  const response: {
    callGasLimit: string;
    paymasterAndData: string;
    preVerificationGas: string;
    verificationGasLimit: string;
  } = await paymasterRPC.send('alchemy_requestGasAndPaymasterAndData', [
    {
      policyId: process.env.POLICY_ID,
      dummySignature: userOp.signature,
      entryPoint,
      userOperation: userOp,
    },
  ]);

  return response;
};

paymasterRouter.route('/').post(async (req, res) => {
  const {
    method,
    params: [userOp, entryPoint],
  }: { method: string; params: [UserOperationStruct, string] } = req.body;

  if (!method || !userOp || !entryPoint) {
    res.status(400).send('Bad Request');
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.PROVIDER_URL
  );

  switch (req.body.method) {
    case 'local_getPaymasterAndData':
      /**
       * Alchemy's implementation
       */
      //   const {
      //     callGasLimit,
      //     paymasterAndData,
      //     preVerificationGas,
      //     verificationGasLimit,
      //   } = await getAlchecmyPaymasterAndData(provider, {
      //     userOp,
      //     entryPoint,
      //   });

      /**
       * Stackup's implementation
       */
      const {
        callGasLimit,
        paymasterAndData,
        preVerificationGas,
        verificationGasLimit,
      } = await getStackupPaymasterAndData(provider, {
        userOp,
        entryPoint,
      });

      res.send({
        id: req.body.id,
        jsonrpc: '2.0',
        result: {
          callGasLimit,
          paymasterAndData,
          preVerificationGas,
          verificationGasLimit,
        },
      });
      break;
    default:
      res.status(400).send('Bad Request');
      break;
  }
});

const routes = (app: Express) => {
  apirouter.use('/paymaster', paymasterRouter);
  app.use('/api/v1', apirouter);
};

export default routes;
