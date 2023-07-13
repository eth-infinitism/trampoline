import { BigNumberish } from "ethers";

export default function getEthereumGlobal() {
  const windowEthereum = window.ethereum;

  if (windowEthereum === undefined) {
    throw new Error('window.ethereum is missing');
  }

  const ethereum = windowEthereum as typeof windowEthereum & {
    request(args: {
      method: 'eth_sendTransaction';
      params: [
        {
          from?: string;
          to: string;
          data: string;
          value?: BigNumberish;
        }
      ];
    }): Promise<string>;
  };

  return ethereum;
}
