/// <reference types = "cypress" />

describe('View GDPR Policy', () => {
    it('allows a user to view GDPR Policy', () => {
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

        cy.contains('Basil Byte Polices').click();

        // Confirm that the user is on the Policies page
        cy.url().should('include', '/policies');
        cy.contains('Data Retention Policy for Basil and Byte').should('be.visible');
    });
});