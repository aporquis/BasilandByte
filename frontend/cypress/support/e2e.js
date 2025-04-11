/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on('uncaught:exception', (err, runnable) => {
    // prevents Cypress from failing the test when your app has frontend errors
    return false;
  });