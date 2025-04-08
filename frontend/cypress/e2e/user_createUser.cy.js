/// <reference types = "cypress" />

describe('Create User', () => {
    it('allows a user to log in', () => {
        cy.visit('https://basilandbyte.vercel.app');

        cy.contains('Login').click(); //find and click Login button

        cy.contains('Create New User').click(); //find and click Login button

        //fill out create new user form
        cy.get('input').eq(0).type('Test');
        cy.get('input').eq(1).type('ThisIsTE$T');
        cy.get('input').eq(2).type('Tester');
        cy.get('input').eq(3).type('User');
        cy.get('input').eq(4).type('testeruser@gmail.com');

        cy.get('button[type="submit"]').click(); // click to register user

        cy.contains ('Login');
    });
});