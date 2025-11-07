import { sum,exca } from "./sum.js";

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
  test('adds 1 + 2 to equal 3', () => {
    expect(exca(5)).toBe(11);
  });
});