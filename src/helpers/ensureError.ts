export default function ensureError<E>(e: E): E extends Error ? E : Error {
  if (e instanceof Error) {
    return e as E extends Error ? E : Error;
  }

  return new Error(
    `Wrapped original non-error exception: ${JSON.stringify(e)}`,
  ) as E extends Error ? E : Error;
}
