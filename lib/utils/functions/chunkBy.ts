export function chunkBy(
  array: Array<unknown>,
  amount: number,
): Array<Array<unknown>> {
  const batched: Array<Array<unknown>> = [];
  for (let i = 0; i < array.length; i += amount) {
    batched.push(array.slice(i, i + amount));
  }
  return batched;
}
