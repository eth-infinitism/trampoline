import { hexlify, toUtf8Bytes, toUtf8String } from 'ethers/lib/utils.js';
import browser from 'webextension-polyfill';
import { AllowedQueryParamPageType } from '../types/chrome-messages';
import { SiweMessage } from 'siwe';
import { HexString } from '../types/common';
import {
  EthersTransactionRequest,
  PermissionRequest,
} from '../services/provider-bridge';
import {
  EIP1193Error,
  EIP1193_ERROR_CODES,
} from '../../Content/window-provider/eip-1193';
/**
 * Encode an unknown input as JSON, special-casing bigints and undefined.
 *
 * @param input an object, array, or primitive to encode as JSON
 */
export function encodeJSON(input: unknown): string {
  return JSON.stringify(input, (_, value) => {
    if (typeof value === 'bigint') {
      return { B_I_G_I_N_T: value.toString() };
    }
    return value;
  });
}

/**
 * Decode a JSON string, as encoded by `encodeJSON`, including bigint support.
 * Note that the functions aren't invertible, as `encodeJSON` discards
 * `undefined`.
 *
 * @param input a string output from `encodeJSON`
 */
export function decodeJSON(input: string): unknown {
  return JSON.parse(input, (_, value) =>
    value !== null && typeof value === 'object' && 'B_I_G_I_N_T' in value
      ? BigInt(value.B_I_G_I_N_T)
      : value
  );
}

/**
 * Returns a 0x-prefixed hexadecimal representation of a number or string chainID
 * while also handling cases where an already hexlified chainID is passed in.
 */
export function toHexChainID(chainID: string | number): string {
  if (typeof chainID === 'string' && chainID.startsWith('0x')) {
    return chainID.toLowerCase();
  }
  return `0x${BigInt(chainID).toString(16)}`;
}

export default async function showExtensionPopup(
  url: AllowedQueryParamPageType
): Promise<browser.Windows.Window> {
  const { left = 0, top, width = 1920 } = await browser.windows.getCurrent();
  const popupWidth = 384;
  const popupHeight = 628;
  return browser.windows.create({
    url: `${browser.runtime.getURL('popup.html')}/#${url}`,
    type: 'popup',
    left: left + width - popupWidth,
    top,
    width: popupWidth,
    height: popupHeight,
    focused: true,
  });
}

export type EIP191Data = string;

// spec found https://eips.ethereum.org/EIPS/eip-4361
export interface EIP4361Data {
  /**
   * The message string that was parsed to produce this EIP-4361 data.
   */
  unparsedMessageData: string;
  domain: string;
  address: string;
  version: string;
  chainId: number;
  nonce: string;
  expiration?: string;
  statement?: string;
}

type EIP191SigningData = {
  messageType: 'eip191';
  signingData: EIP191Data;
};

type EIP4361SigningData = {
  messageType: 'eip4361';
  signingData: EIP4361Data;
};

export type MessageSigningData = EIP191SigningData | EIP4361SigningData;

const checkEIP4361: (message: string) => EIP4361Data | undefined = (
  message
) => {
  try {
    const siweMessage = new SiweMessage(message);
    return {
      unparsedMessageData: message,
      domain: siweMessage.domain,
      address: siweMessage.address,
      statement: siweMessage.statement,
      version: siweMessage.version,
      chainId: siweMessage.chainId,
      expiration: siweMessage.expirationTime,
      nonce: siweMessage.nonce,
    };
  } catch (err) {
    // console.error(err)
  }

  return undefined;
};

/**
 * Takes a string and parses the string into a ExpectedSigningData Type
 *
 * EIP4361 standard can be found https://eips.ethereum.org/EIPS/eip-4361
 */
export function parseSigningData(signingData: string): MessageSigningData {
  let normalizedData = signingData;

  // Attempt to normalize hex signing data to a UTF-8 string message. If the
  // signing data is <= 32 bytes long, assume it's a hash or other short data
  // that need not be normalized to a regular UTF-8 string.
  if (signingData.startsWith('0x') && signingData.length > 66) {
    let possibleMessageString: string | undefined;
    try {
      possibleMessageString = toUtf8String(signingData);
      // Below, if the signing data is not a valid UTF-8 string, we move on
      // with an undefined possibleMessageString.
      // eslint-disable-next-line no-empty
    } catch (err) {}

    // If the hex was parsable as UTF-8 and re-converting to bytes in a hex
    // string produces the identical output, accept it as a valid string and
    // set the interpreted data to the UTF-8 string.
    if (
      possibleMessageString !== undefined &&
      hexlify(toUtf8Bytes(possibleMessageString)) === signingData.toLowerCase()
    ) {
      normalizedData = possibleMessageString;
    }
  }

  const data = checkEIP4361(normalizedData);
  if (data) {
    return {
      messageType: 'eip4361',
      signingData: data,
    };
  }

  return {
    messageType: 'eip191',
    signingData: normalizedData,
  };
}

function normalizeHexAddress(address: any) {
  var addressString =
    typeof address === 'object' && !('toLowerCase' in address)
      ? address.toString('hex')
      : address;
  var noPrefix = addressString.replace(/^0x/, '');
  var even = noPrefix.length % 2 === 0 ? noPrefix : '0' + noPrefix;
  return '0x' + Buffer.from(even, 'hex').toString('hex');
}

export function sameEVMAddress(
  address1: string | Buffer | undefined | null,
  address2: string | Buffer | undefined | null
): boolean {
  if (
    typeof address1 === 'undefined' ||
    typeof address2 === 'undefined' ||
    address1 === null ||
    address2 === null
  ) {
    return false;
  }
  return normalizeHexAddress(address1) === normalizeHexAddress(address2);
}

export function checkPermissionSign(
  walletAddress: HexString,
  enablingPermission: PermissionRequest
): void {
  if (
    enablingPermission.state !== 'allow' ||
    !sameEVMAddress(walletAddress, enablingPermission.accountAddress)
  ) {
    throw new EIP1193Error(EIP1193_ERROR_CODES.unauthorized);
  }
}

export function checkPermissionSignTransaction(
  transactionRequest: EthersTransactionRequest,
  enablingPermission: PermissionRequest
): void {
  if (typeof transactionRequest.chainId !== 'undefined') {
    if (
      toHexChainID(transactionRequest.chainId) !==
      toHexChainID(enablingPermission.chainID)
    ) {
      throw new EIP1193Error(EIP1193_ERROR_CODES.unauthorized);
    }
  }
  if (
    enablingPermission.state !== 'allow' ||
    !sameEVMAddress(transactionRequest.from, enablingPermission.accountAddress)
  ) {
    throw new EIP1193Error(EIP1193_ERROR_CODES.unauthorized);
  }
}
