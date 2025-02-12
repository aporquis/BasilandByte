from django.conf.urls.static import static
from django.conf import settings
from django.urls import path
from recipes import views  # Import views from recipes app

urlpatterns = [
    path("", views.get_recipes, name="get_recipes"),
    path("add/", views.add_recipe, name="add_recipe"),
    path("update/<int:recipe_id>/", views.update_recipe, name="update_recipe"),
    path("delete/<int:recipe_id>/", views.delete_recipe, name="delete_recipe"),
]

# Allow serving images in development and for the database and website that way users are able to see what is in the database and what the recipes look like. 

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
