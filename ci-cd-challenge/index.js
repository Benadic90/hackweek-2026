/**
 * Math Utility Module
 * 
 * This module provides core arithmetic operations used across the application.
 * Each function is thoroughly tested via Jest to ensure correctness.
 */

/**
 * Adds two numbers and returns the result.
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @returns {number} The sum of a and b.
 */
function add(a, b) {
    return a + b;
}

/**
 * Multiplies two numbers and returns the product.
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @returns {number} The product of a and b.
 */
function multiply(a, b) {
    return a * b;
}

module.exports = { add, multiply };
