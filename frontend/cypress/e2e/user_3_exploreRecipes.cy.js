/// <reference types = "cypress" />

describe('View All & Explore Recipes', () => {
    it('allows a logged in user to see all recipes', () => {
        cy.visit('https://basilandbyte.vercel.app', {
            headers: {
              'Cache-Control': 'no-cache'
            }
          });

        //From the home screen, go to explore recipes page
        cy.contains('Home').click();
        cy.contains('Explore Recipes').click();

        //confirm URL is /recipes
        cy.url().should('include', '/recipes');

        //confirm recipes are viewable & example Dutch Baby Recipes
        cy.contains('All Recipes').should('be.visible');
        cy.contains('Dutch Baby').should('be.visible');

    });
});