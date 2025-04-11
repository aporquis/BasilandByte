/// <reference types = "cypress" />

describe('User Login', () => {
    it('allows a user to log in', () => {
        cy.visit('https://basilandbyte.vercel.app');

        cy.contains('Login').click(); //find and click Login button

        //fill out login form
        cy.get('input').eq(0).type('Test');
        cy.get('input').eq(1).type('ThisIsTE$T');

        cy.get('button[type="submit"]').click(); // click login

        cy.contains ('All Recipes');
    });
});