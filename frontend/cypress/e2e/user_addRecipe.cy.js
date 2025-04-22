/// <reference types = "cypress" />

describe('Create a New Recipe', () => {
    it('allows a user to create a new recipe from the dashboard menu', () => {
        cy.clearCookies();
        cy.clearLocalStorage();

        cy.visit('https://basilandbyte.vercel.app/', {
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
        cy.contains('Add a Recipe').click(); // Go to Dashboard

        //enter recipe details
        cy.get('input').eq(0).type('Pancakes');
        cy.get('input').eq(1).type('These are fluffy pancakes that will brighten any weekend morning.');

        cy.get('input').eq(2).type("Flour")
        cy.get('input').eq(3).type("1")
        cy.get('select').eq(0).select('Cups');

        cy.contains('Add Another').click();
        cy.get('input').eq(4).type("Sugar")
        cy.get('input').eq(5).type("2")
        cy.get('select').eq(1).select('Tablespoons');

        cy.contains('Add Another').click();
        cy.get('input').eq(6).type("Baking Powder")
        cy.get('input').eq(7).type("1")
        cy.get('select').eq(2).select('Tablespoons');

        cy.contains('Add Another').click();
        cy.get('input').eq(8).type("Salt")
        cy.get('input').eq(9).type("0.5")
        cy.get('select').eq(3).select('Teaspoons');

        cy.contains('Add Another').click();
        cy.get('input').eq(10).type("Milk")
        cy.get('input').eq(11).type("1")
        cy.get('select').eq(4).select('Cups');

        cy.contains('Add Another').click();
        cy.get('input').eq(12).type("Vegetable Oil")
        cy.get('input').eq(13).type("2")
        cy.get('select').eq(5).select('Tablespoons');

        cy.contains('Add Another').click();
        cy.get('input').eq(14).type("Egg")
        cy.get('input').eq(15).type("1")
        cy.get('select').eq(6).select('Teaspoons');


        cy.contains('Add Another').click();
        cy.get('input').eq(16).type("Vanilla Extract")
        cy.get('input').eq(17).type("1")
        cy.get('select').eq(7).select('Teaspoons');

        cy.get('input').eq(18).type('Mix the dry ingredients in a large bowl. Mix wet ingredients in another bowl. Combine wet and dry ingredients and stir gently. Mix until just combined! Over-mixing will give you tough pancakes. Drop 1/4 cup of batter on a lightly greased skillet over medium heat. Flip after the bottom is golden brown and the top is bubbly. Cook until the next side is golden brown. Serve wih berries and maple syrup.');

        cy.get('button[type="submit"]').click();

        cy.contains('All Recipes').should('be.visible');
        cy.contains('Pancakes').should('be.visible');

        //Search for pancakes
        cy.get('input[placeholder="Search recipes..."]').type('fluffy pancakes');
    });
});