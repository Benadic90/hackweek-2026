const { add, multiply } = require('./index');

/**
 * Unit Test Suite for Math Utilities
 * 
 * Tests cover both positive and edge-case scenarios 
 * (negative numbers, zero multiplication) to ensure robust validation.
 */
describe('Math Utilities', () => {
    // --- Addition Tests ---
    test('should add two positive numbers correctly', () => {
        expect(add(2, 3)).toBe(5);
    });

    test('should handle negative number addition', () => {
        expect(add(-1, 1)).toBe(0);
    });

    // --- Multiplication Tests ---
    test('should multiply two positive numbers correctly', () => {
        expect(multiply(2, 4)).toBe(8);
    });

    test('should return zero when multiplying by zero', () => {
        expect(multiply(0, 10)).toBe(0);
    });
});
