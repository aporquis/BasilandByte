from django.db import models

# Create your models here.
# I am adding extra documentation below the class and def __str__, I have pylint installed and it is very angry with me right now.
# I also figured it would be good for you all to know what is going on.


class Recipe(models.Model):
    """This is a basic model for storing recipe traits such as the title, description, ingredients, instructions, and as well as the time stamp."""
    title = models.CharField(
        max_length=200)  # Here is where we will store our recipe name
    # Here is where we will store our recipe description
    description = models.TextField()
    # Here is where we will store our ingredients list
    ingredients = models.TextField()
    instructions = models.TextField()  # Here is where we will store our instructions
    # This is a time stamp which helps with figuring out of course as you guessed the time the model was created!
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Returns a string that represents the recipe (the title)."""
        return self.title
    