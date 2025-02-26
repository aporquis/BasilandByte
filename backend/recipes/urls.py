from django.conf.urls.static import static
from django.conf import settings
from django.urls import path
from .views import (
    register_user,
    login_user,
    get_recipes,
    add_recipe,
    update_recipe,
    delete_recipe
)

urlpatterns = [
    # User Authentication URLs
    path("register/", register_user, name="register"),
    path("login/", login_user, name="login"),

    # Recipe API URLs
    path("", get_recipes, name="get_recipes"),
    path("add/", add_recipe, name="add_recipe"),
    path("update/<int:recipe_id>/", update_recipe, name="update_recipe"),
    path("delete/<int:recipe_id>/", delete_recipe, name="delete_recipe"),
]

# Allow serving images in development so users can see uploaded recipe images
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
