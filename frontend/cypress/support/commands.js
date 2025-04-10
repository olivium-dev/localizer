// Custom commands for Cypress tests
import '@testing-library/cypress/add-commands';

// Command to reset the database state before tests
Cypress.Commands.add('resetDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/test/reset`,
    failOnStatusCode: false
  });
});

// Command to create a test language
Cypress.Commands.add('createLanguage', (language) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/languages`,
    body: language
  });
});

// Command to create a test localization key
Cypress.Commands.add('createKey', (key) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/keys`,
    body: key
  });
});

// Command to login (if auth is added later)
Cypress.Commands.add('login', (email, password) => {
  // Reserved for future authentication implementation
  cy.log('Login command placeholder - Authentication not implemented yet');
}); 