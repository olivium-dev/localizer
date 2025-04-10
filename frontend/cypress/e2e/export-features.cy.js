/// <reference types="cypress" />

describe('Export Features', () => {
  beforeEach(() => {
    // Visit the app and navigate to export tab
    cy.visit('/');
    cy.findByRole('tab', { name: /export/i }).click({ force: true });
  });

  it('should display the export options', () => {
    // Verify the export tab is active
    cy.findByRole('tab', { name: /export/i })
      .should('be.visible')
      .should('have.attr', 'aria-selected', 'true');

    // Verify the export content is visible
    cy.contains('h5', 'Export Options').should('be.visible');
    cy.contains('h6', 'Mobile App Exports').should('be.visible');
  });

  it('should display the Flutter export option', () => {
    // Verify Flutter export option is visible
    cy.contains('Flutter/Dart').should('be.visible');
    cy.contains('Export localization files ready to be used in a Flutter app').should('be.visible');
    
    // Verify export button is visible
    cy.findByRole('button', { name: /export/i }).should('be.visible');
  });

  it('should display what is included in the export', () => {
    // Verify "What's Included" section is visible
    cy.contains('What\'s Included').should('be.visible');
    
    // Verify the export includes details
    cy.contains('The export includes:').should('be.visible');
    cy.contains('Full Dart implementation of the AppLocalizations class').should('be.visible');
    cy.contains('Individual language files with all translations').should('be.visible');
    cy.contains('l10n.yaml configuration file').should('be.visible');
    cy.contains('README with installation and usage instructions').should('be.visible');
  });

  it('should handle the export button click', () => {
    // Intercept the API request for exporting to Flutter
    cy.intercept('GET', '**/api/export/flutter', {
      statusCode: 200,
      body: Cypress.Buffer.from('mock zip file content'),
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=flutter_localizations.zip'
      }
    }).as('exportToFlutter');

    // Click the export button
    cy.findByRole('button', { name: /export/i }).click({ force: true });

    // Verify the API call was made
    cy.wait('@exportToFlutter');

    // Verify loading state is shown and then cleared
    cy.get('[role="button"]').should('not.have.attr', 'disabled');
    
    // Verify success message is shown
    cy.contains('Successfully exported to Flutter!').should('be.visible');
  });

  it('should handle export errors gracefully', () => {
    // Intercept the API request and simulate an error
    cy.intercept('GET', '**/api/export/flutter', {
      statusCode: 500,
      body: { message: 'Error exporting to Flutter' }
    }).as('exportError');

    // Click the export button
    cy.findByRole('button', { name: /export/i }).click({ force: true });

    // Verify the API call was made
    cy.wait('@exportError');

    // Verify error message is shown
    cy.contains('Failed to export to Flutter').should('be.visible');
  });

  it('should ensure the export tab is responsive', () => {
    // Test on mobile viewport
    cy.viewport('iphone-x');
    
    // Verify the export UI adapts to mobile view
    cy.contains('h5', 'Export Options').should('be.visible');
    cy.contains('Flutter/Dart').should('be.visible');
    cy.findByRole('button', { name: /export/i }).should('be.visible');
  });
}); 