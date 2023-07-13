export default function omit<Obj extends Record<string | symbol, unknown>, K extends keyof Obj>(obj: Obj, key: K): Omit<Obj, K> {
  const newObj = { ...obj };
  delete newObj[key];

  return newObj;
}
