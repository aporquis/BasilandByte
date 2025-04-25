/// <reference types = "cypress" />

describe('Save a Recipe', () => {
    it('allows a user to save a Recipe to their account', () => {
        cy.visit('https://basilandbyte.vercel.app', {
            headers: {
              'Cache-Control': 'no-cache'
            }
          });

        cy.contains('Login').click(); //find and click Login button
        cy.get('input').eq(0).type('Test');
        cy.get('input').eq(1).type('ThisIsTE$T');
        cy.get('button[type="submit"]').click(); // click login
        cy.contains('Dashboard').click(); // Go to Dashboard
        cy.reload();

        cy.contains('Explore Recipes').click();
        cy.get('input[type="text"]').first().type('fluffy pancakes');
        cy.contains('Save').click();

        cy.contains('Dashboard').click(); // Go to Dashboard
        cy.contains('View Saved Recipes').click();

        cy.contains('Your Saved Recipes').should('be.visible');
        cy.contains('Pancakes').should('be.visible');
    });
});