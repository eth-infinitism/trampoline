import browser from 'webextension-polyfill';
import { AllowedQueryParamPageType } from '../types/chrome-messages';
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
