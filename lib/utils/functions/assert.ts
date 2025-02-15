export function assert<T>(
  value: T,
  assertMessage = 'Assertion failed!'
): asserts value is NonNullable<T> {
  if (value == null) {
    throw new TypeError(assertMessage);
  }
}
