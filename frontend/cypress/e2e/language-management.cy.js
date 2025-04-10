/// <reference types="cypress" />

describe('Language Management', () => {
  beforeEach(() => {
    // Visit the app and navigate to the Languages tab
    cy.visit('/');
    cy.findByRole('tab', { name: /languages/i }).click();
    cy.findByText('Language Management').should('be.visible');
  });

  it('should display the language list', () => {
    // Verify the language table headers
    cy.get('table')
      .should('be.visible')
      .within(() => {
        cy.contains('th', 'Code').should('be.visible');
        cy.contains('th', 'Name').should('be.visible');
        cy.contains('th', 'Status').should('be.visible');
        cy.contains('th', 'Actions').should('be.visible');
      });

    // Verify that at least the default language is displayed
    cy.get('table tbody tr').should('have.length.at.least', 1);
    cy.contains('td', 'English').should('be.visible');
    cy.contains('td', 'en').should('be.visible');
    cy.get('table tbody tr:first-child').within(() => {
      cy.contains('Default').should('be.visible');
    });
  });

  it('should add a new language', () => {
    // Click the Add New Language button
    cy.findByRole('button', { name: /add new language/i }).click();

    // Fill in the form
    cy.findByLabelText(/language code/i).type('it');
    cy.findByLabelText(/language name/i).type('Italian');
    
    // Save the language
    cy.findByRole('button', { name: /save/i }).click();

    // Verify the new language appears in the table
    cy.contains('td', 'it').should('be.visible');
    cy.contains('td', 'Italian').should('be.visible');
  });

  it('should edit an existing language', () => {
    // Find the edit button for the language we want to edit
    cy.contains('tr', 'Italian')
      .within(() => {
        cy.get('button').first().click();
      });

    // Clear and update the name
    cy.findByLabelText(/language name/i).clear().type('Italian (Updated)');
    
    // Save the changes
    cy.findByRole('button', { name: /save/i }).click();

    // Verify the updated language appears in the table
    cy.contains('td', 'Italian (Updated)').should('be.visible');
  });

  it('should not allow deletion of the default language', () => {
    // Check that the delete button is disabled for the default language
    cy.contains('tr', 'English')
      .within(() => {
        cy.get('button').eq(1).should('be.disabled');
      });
  });

  it('should delete a non-default language', () => {
    // Get the initial row count
    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length;

      // Find the delete button for the non-default language
      cy.contains('tr', 'Italian')
        .within(() => {
          cy.get('button').eq(1).click();
        });

      // Confirm deletion
      cy.findByRole('button', { name: /delete/i }).click();

      // Verify the language has been removed
      cy.get('table tbody tr').should('have.length', initialCount - 1);
      cy.contains('td', 'Italian').should('not.exist');
    });
  });
}); 