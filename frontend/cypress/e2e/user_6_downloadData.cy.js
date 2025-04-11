/// <reference types = "cypress" />

describe('Download User Data', () => {
    it('allows a user to download their personal data', () => {
        cy.visit('https://basilandbyte.vercel.app', {
            headers: {
              'Cache-Control': 'no-cache'
            }
          });

        cy.contains('Login').click(); //find and click Login button

        //fill out login form
        cy.get('input').eq(0).type('Test');
        cy.get('input').eq(1).type('ThisIsTE$T');

        cy.get('button[type="submit"]').click(); // click login
        cy.contains('Dashboard').click(); // Go to Dashboard
        cy.reload();

        cy.contains('Download My Data').click();

        // Now confirm that a JSON file was downloaded
        const downloadsFolder = Cypress.config('downloadsFolder');
        cy.wait(1000);

        cy.readFile(`${downloadsFolder}/Test_data.json`).should('exist');
        
    });
});