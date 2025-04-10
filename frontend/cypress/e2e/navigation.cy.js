/// <reference types="cypress" />

describe('Navigation', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('/');
  });

  it('should load the application successfully', () => {
    // Verify the app header is visible
    cy.get('header').should('be.visible');
    cy.contains('Localizer').should('be.visible');

    // Verify the tab navigation is visible
    cy.get('[role="tablist"]').should('be.visible');
  });

  it('should have Localization Keys tab active by default', () => {
    // Verify Keys tab is visible and active
    cy.findByRole('tab', { name: /localization keys/i })
      .should('be.visible')
      .should('have.attr', 'aria-selected', 'true');

    // Verify the keys content is visible
    cy.contains('h5', 'Localization Keys').should('be.visible');
  });

  it('should navigate to Languages tab', () => {
    // Click on Languages tab
    cy.findByRole('tab', { name: /languages/i }).click();

    // Verify Languages tab is active
    cy.findByRole('tab', { name: /languages/i })
      .should('have.attr', 'aria-selected', 'true');

    // Verify the languages content is visible
    cy.contains('h5', 'Language Management').should('be.visible');
  });

  it('should navigate to Export tab', () => {
    // Click on Export tab
    cy.findByRole('tab', { name: /export/i }).click({ force: true });

    // Verify Export tab is active
    cy.findByRole('tab', { name: /export/i })
      .should('have.attr', 'aria-selected', 'true');

    // Verify the export content is visible
    cy.contains('h5', 'Export Options').should('be.visible');
  });

  it('should navigate back to Keys tab', () => {
    // First navigate to Languages tab
    cy.findByRole('tab', { name: /languages/i }).click();
    
    // Then navigate back to Keys tab
    cy.findByRole('tab', { name: /localization keys/i }).click();

    // Verify Keys tab is active again
    cy.findByRole('tab', { name: /localization keys/i })
      .should('have.attr', 'aria-selected', 'true');

    // Verify the keys content is visible
    cy.contains('h5', 'Localization Keys').should('be.visible');
  });

  it('should have responsive layout', () => {
    // Test on mobile viewport
    cy.viewport('iphone-x');
    
    // Verify the app still displays correctly
    cy.get('header').should('be.visible');
    cy.contains('Localizer').should('be.visible');
    cy.get('[role="tablist"]').should('be.visible');
    
    // Verify content is visible
    cy.contains('h5', 'Localization Keys').should('be.visible');
  });
}); 