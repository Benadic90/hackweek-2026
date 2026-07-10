const { add, multiply } = require('./index');

describe('Math Utilities', () => {
    test('should add two numbers correctly', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
    });

    test('should multiply two numbers correctly', () => {
        expect(multiply(2, 4)).toBe(8);
        expect(multiply(0, 10)).toBe(0);
    });
});
