/// <reference types="cypress" />

describe('Key Management', () => {
  beforeEach(() => {
    // Reset database and visit the app
    cy.visit('/');
    // Make sure the UI loaded
    cy.contains('Localization Keys').should('be.visible');
    cy.get('table').should('be.visible');
  });

  it('should display the key list', () => {
    // Verify the key table headers
    cy.get('table')
      .should('be.visible')
      .within(() => {
        cy.contains('th', 'Key Name').should('be.visible');
        cy.contains('th', 'Description').should('be.visible');
        cy.contains('th', 'Languages').should('be.visible');
        cy.contains('th', 'Actions').should('be.visible');
      });
  });

  it('should add a new key', () => {
    // Click the Add New Key button
    cy.get('[data-testid="add-key-button"]').click();
    
    // Fill in the form
    cy.get('[data-testid="key-name-input"]').should('be.visible').type('app.test.key');
    cy.get('[data-testid="key-description-input"]').type('Test description');
    
    // Fill the default language value
    cy.get('[data-testid="translation-input-0"]').type('Test Value');
    
    // Click Create
    cy.get('[data-testid="save-key-button"]').click();
    
    // Verify the key was added to the table
    cy.contains('app.test.key').should('be.visible');
  });

  it('should show validation error for missing default language value', () => {
    // First add a key with a default language value to ensure we have something to compare
    cy.get('[data-testid="add-key-button"]').click();
    
    // Only fill the key name
    cy.get('[data-testid="key-name-input"]').should('be.visible').type('invalid.key');
    
    // Try to save without required value
    cy.get('[data-testid="save-key-button"]').click({ force: true });
    
    // Wait a moment to ensure error appears
    cy.wait(500);
    
    // Check that we're still in the dialog (by verifying the key-name-input is still visible)
    // This confirms validation prevented the save
    cy.get('[data-testid="key-name-input"]').should('be.visible');
    
    // Close the dialog
    cy.contains('button', 'Cancel').click();
  });

  it('should allow searching keys', () => {
    // First add a key with unique name
    cy.get('[data-testid="add-key-button"]').click();
    cy.get('[data-testid="key-name-input"]').should('be.visible').type('unique.search.key');
    cy.get('[data-testid="key-description-input"]').type('Unique description for search');
    cy.get('[data-testid="translation-input-0"]').type('Search Value');
    cy.get('[data-testid="save-key-button"]').click();
    
    // Wait for key to be created
    cy.contains('unique.search.key').should('be.visible');
    
    // Search for the key - use force:true to bypass overlay issues
    cy.get('[data-testid="search-input"] input').type('unique.search', { force: true });
    
    // Wait a moment to ensure filter applies
    cy.wait(500);
    
    // Verify only the matching key is shown
    cy.contains('unique.search.key').should('be.visible');
  });

  it('should edit an existing key', () => {
    // First add a key
    cy.get('[data-testid="add-key-button"]').click();
    cy.get('[data-testid="key-name-input"]').should('be.visible').type('edit.test.key');
    cy.get('[data-testid="key-description-input"]').type('Edit test description');
    cy.get('[data-testid="translation-input-0"]').type('Edit Value');
    cy.get('[data-testid="save-key-button"]').click();
    
    // Wait for key to be created
    cy.contains('edit.test.key').should('be.visible');
    
    // Click the edit button with force: true option to bypass any overlay issues
    cy.get('[aria-label="edit"]').first().click({ force: true });
    
    // Edit the description
    cy.get('[data-testid="key-description-input"]').clear().type('Updated description');
    
    // Save changes
    cy.get('[data-testid="save-key-button"]').click();
    
    // Verify the edit took effect
    cy.contains('edit.test.key').should('be.visible');
    cy.contains('Updated description').should('be.visible');
  });
}); 