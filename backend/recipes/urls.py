from django.urls import path
from . import views

urlpatterns = [
    path('recipes/', views.get_recipes, name='get_recipes'),
    path('recipes/add/', views.add_recipe, name='add_recipe'),
    path('recipes/update/<int:recipe_id>/',
         views.update_recipe, name='update_recipe'),
    path('recipes/delete/<int:recipe_id>/',
         views.delete_recipe, name='delete_recipe'),
]
