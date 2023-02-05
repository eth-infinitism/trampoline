import {
  PortResponseEvent,
  WindowResponseEvent,
  AAExtensionConfigPayload,
} from '../types';

export function isNumber(arg: unknown): arg is number {
  return getType(arg) === 'Number';
}

export function getType(arg: unknown): string {
  return Object.prototype.toString.call(arg).slice('[object '.length, -1);
}

export function isMessageEvent(arg: unknown): arg is MessageEvent {
  return arg instanceof MessageEvent;
}

export function isString(arg: unknown): arg is string {
  return getType(arg) === 'String';
}

export function isUndefined(arg: unknown): arg is undefined {
  return typeof arg === 'undefined';
}

export function isObject(
  arg: unknown
): arg is Record<string | number | symbol, unknown> {
  return getType(arg) === 'Object';
}

export function isWindowResponseEvent(
  arg: unknown
): arg is WindowResponseEvent {
  return (
    isMessageEvent(arg) &&
    isString(arg.origin) &&
    !isUndefined(arg.source) &&
    isObject(arg.data) &&
    isString(arg.data.id) &&
    isString(arg.data.target) &&
    !isUndefined(arg.data.result)
  );
}

export function isPortResponseEvent(arg: unknown): arg is PortResponseEvent {
  return isObject(arg) && isString(arg.id) && !isUndefined(arg.result);
}

export function isAAExtensionConfigPayload(
  arg: unknown
): arg is AAExtensionConfigPayload {
  return isObject(arg) && arg.method === 'aa-extension_getConfig';
}
