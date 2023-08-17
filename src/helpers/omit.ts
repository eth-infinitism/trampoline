/**
 * Removes a key from an object without modifying it.
 * 
 * This can be an improvement over `{ ...obj, key: undefined }` since it
 * actually removes the key and doesn't introduce `undefined` into the type
 * information.
 */
export default function omit<
  Obj extends Record<string | symbol, unknown>,
  K extends keyof Obj
>(obj: Obj, key: K): Omit<Obj, K> {
  const newObj = { ...obj };
  delete newObj[key];

  return newObj;
}
