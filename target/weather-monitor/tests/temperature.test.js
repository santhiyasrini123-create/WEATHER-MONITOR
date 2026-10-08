const test = require('node:test');
const assert = require('node:assert');
const {
    celsiusToFahrenheit,
    fahrenheitToCelsius
} = require('./temperature');

test('Celsius to Fahrenheit: 0°C = 32°F', () => {
    assert.strictEqual(celsiusToFahrenheit(0), 32);
});

test('Celsius to Fahrenheit: 100°C = 212°F', () => {
    assert.strictEqual(celsiusToFahrenheit(100), 212);
});

test('Fahrenheit to Celsius: 32°F = 0°C', () => {
    assert.strictEqual(fahrenheitToCelsius(32), 0);
});

test('Fahrenheit to Celsius: 212°F = 100°C', () => {
    assert.strictEqual(fahrenheitToCelsius(212), 100);
});