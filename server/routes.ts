import express, { Express } from 'express';
import { ethers } from 'ethers';

const apirouter = express.Router();

const paymasterRouter = express.Router();

paymasterRouter.route('/').post(async (req, res) => {
  const {
    method,
    params: [userOp, entryPoint],
  } = req.body;

  console.log(method, userOp, entryPoint);

  if (!method || !userOp || !entryPoint) {
    res.status(400).send('Bad Request');
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.PROVIDER_URL
  );

  switch (req.body.method) {
    case 'local_getPaymasterAndData':
      const paymasterRPC = new ethers.providers.JsonRpcProvider(
        process.env.PAYMASTER_SERVICE_URL,
        {
          name: 'Paymaster',
          chainId: (await provider.getNetwork()).chainId,
        }
      );

      const {
        callGasLimit,
        paymasterAndData,
        preVerificationGas,
        verificationGasLimit,
      }: {
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

      res.send({
        callGasLimit,
        paymasterAndData,
        preVerificationGas,
        verificationGasLimit,
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
