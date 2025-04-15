from django.contrib import admin
from .models import Recipe, Ingredient, RecipeIngredient, FoodGroup, SavedItem, LoginEvent, UserDeletion, UserInventory

# Register your models here.

admin.site.register(Recipe)
admin.site.register(Ingredient)
admin.site.register(RecipeIngredient)
admin.site.register(FoodGroup)
admin.site.register(SavedItem)
admin.site.register(LoginEvent)
admin.site.register(UserDeletion)
admin.site.register(UserInventory)