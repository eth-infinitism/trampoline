import { BigNumberish } from "ethers";

/**
 * Gets the ethereum global in a convenient way.
 * 
 * It does two important things:
 * - Throws an exception if window.ethereum is missing so that we can return a
 *   non-optional `ethereum` value.
 * - Adds extra type information. Our type information for window.ethereum
 *   currently comes from node_modules/@wagmi/connectors/dist/types-86dbb446.d.ts,
 *   which is very incomplete and doesn't seem entirely intentional. This might
 *   be resolved by updating wagmi.
 */
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
