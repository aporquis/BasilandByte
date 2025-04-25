/// <reference types = "cypress" />

describe('Plan a Recipe', () => {
    it('allows a user to save a Recipe to their Weekly Planner', () => {
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

        cy.contains('View Saved Recipes').click();

        cy.contains('Your Saved Recipes').should('be.visible');
        cy.contains('Pancakes').should('be.visible');

        cy.get('select').eq(0).select('Wednesday');
        cy.get('select').eq(1).select('Breakfast');

        cy.contains('Add to Plan').click();

        cy.contains('Dashboard').click(); // Go to Dashboard
        cy.contains('Weekly Planner').click(); // Go to Weekly Planner

        cy.contains('Wednesday').should('be.visible');
        cy.contains('Breakfast').should('be.visible');
        cy.contains('Pancakes').should('be.visible');
    });
});