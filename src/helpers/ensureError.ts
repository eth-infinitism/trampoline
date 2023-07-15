/**
 * By convention, exceptions should always be `Error`s, but it's only a
 * convention, so we don't actually get any type information on exceptions.
 * This functions wraps an exception and just returns it unchanged if it's
 * an `Error`, otherwise it wraps it in an `Error`.
 */
export default function ensureError<E>(e: E): E extends Error ? E : Error {
  if (e instanceof Error) {
    return e as E extends Error ? E : Error;
  }

  return new Error(
    `Wrapped original non-error exception: ${JSON.stringify(e)}`,
  ) as E extends Error ? E : Error;
}
