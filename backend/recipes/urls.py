from django.conf.urls.static import static
from django.conf import settings
from django.urls import path
from .views import (
    register_user,
    login_user,
    get_recipes,
    add_recipe,
    update_recipe,
    delete_recipe,
    get_user_info,
    export_user_data
)

urlpatterns = [
    #User data dump url and api feed (links to the dashboard download button)
    path("export-user-data/", export_user_data, name="export-user-data"),

    # User Authentication URLs
    path("register/", register_user, name="register"),
    path("login/", login_user, name="login"),

    # User Information URL (this api links to the dashboard )
    path("user-info/", get_user_info, name="user-info"),

    # Recipe API URLs for adding deletion updating etc
    path("", get_recipes, name="get_recipes"),
    path("add/", add_recipe, name="add_recipe"),
    path("update/<int:recipe_id>/", update_recipe, name="update_recipe"),
    path("delete/<int:recipe_id>/", delete_recipe, name="delete_recipe"),
]

# Allow serving images in development so users can see uploaded recipe images
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
