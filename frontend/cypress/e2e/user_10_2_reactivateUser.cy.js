/// <reference types = "cypress" />

describe('Reactivate User', () => {
    it('allows a user who deleted their account to reactivate it.', () => {
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
        cy.contains('Your account is deactivated. Please reactivate it.').should('be.visible');

        cy.contains('Reactivate Account').click();

        cy.contains('Logging in...').should('be.visible');
        cy.contains('All Recipes').should('be.visible');
    });
});