/// <reference types = "cypress" />

describe('Delete User', () => {
    it('allows a user to delete their account', () => {
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

        cy.contains('Delete my Account').click(); // click delete my account

        //in window popup, confirm deletion
        cy.on('window:confirm', (text) => {
            expect(text).to.contains('Are you sure? Your account will be deactivated immediately');
            return true; // Click OK
          });

        //redirects to login
        cy.url().should('include', '/login');
    });
});