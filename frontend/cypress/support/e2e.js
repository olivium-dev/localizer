// Import commands.js
import './commands';

// Set up exception handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false prevents Cypress from failing the test
  return false;
}); 