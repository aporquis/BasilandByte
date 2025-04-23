from django.conf.urls.static import static
from django.conf import settings
from django.urls import path
from .views import (
    register_user, login_user, get_recipes, add_recipe, update_recipe, delete_recipe,
    get_user_info, export_user_data, save_recipe, get_saved_recipes, unsave_recipe,
    add_recipe_ingredient, add_to_weekly_plan, get_weekly_plan, clear_weekly_plan, clear_day_plan, log_login_event,
    request_account_deletion, get_user_inventory, add_to_inventory, update_inventory_item, delete_inventory_item, suggest_recipes,
    get_ingredients, add_to_shopping_list, get_shopping_list, update_shopping_list_item,
    delete_shopping_list_item, add_missing_ingredients_to_shopping_list, reactivate_account
)

urlpatterns = [
    path("export-user-data/", export_user_data, name="export-user-data"),
    path("register/", register_user, name="register"),
    path("login/", login_user, name="login"),
    path("user-info/", get_user_info, name="user-info"),
    path("", get_recipes, name="get_recipes"),
    path("add/", add_recipe, name="add_recipe"),
    path("update/<int:recipe_id>/", update_recipe, name="update_recipe"),
    path("delete/<int:recipe_id>/", delete_recipe, name="delete_recipe"),
    path("save/", save_recipe, name="save_recipe"),
    path("saved-recipes/", get_saved_recipes, name="get_saved_recipes"),
    path("save/<int:saved_item_id>/", unsave_recipe, name="unsave_recipe"),
    path("add-ingredient/", add_recipe_ingredient, name="add_recipe_ingredient"),
    path("weekly-plan/add/", add_to_weekly_plan, name="add_to_weekly_plan"),
    path("weekly-plan/", get_weekly_plan, name="get_weekly_plan"),
    path("weekly-plan/clear/", clear_weekly_plan, name="clear_weekly_plan"),
    path("weekly-plan/clear/<str:day>/", clear_day_plan, name="clear_day_plan"),
    path('log-login/', log_login_event, name='log-login'),
    path("request-account-deletion/", request_account_deletion, name="request_account_deletion"),
    path('inventory/', get_user_inventory, name='get_user_inventory'),
    path('inventory/add/', add_to_inventory, name='add_to_inventory'),
    path('inventory/update/<int:inventory_id>/',
         update_inventory_item, name='update_inventory_item'),
    path('inventory/delete/<int:inventory_id>/',
         delete_inventory_item, name='delete_inventory_item'),
    path('recipes/suggest/', suggest_recipes, name='suggest_recipes'),
    path('ingredients/', get_ingredients, name='get_ingredients'),
    path('shopping-list/add/', add_to_shopping_list, name='add_to_shopping_list'),
    path('shopping-list/', get_shopping_list, name='get_shopping_list'),
    path('shopping-list/update/<int:item_id>/',
         update_shopping_list_item, name='update_shopping_list_item'),
    path('shopping-list/delete/<int:item_id>/',
         delete_shopping_list_item, name='delete_shopping_list_item'),
    path('shopping-list/add-missing/<int:recipe_id>/', add_missing_ingredients_to_shopping_list,
         name='add_missing_ingredients_to_shopping_list'),
    path('reactivate/', reactivate_account, name="reactivate-account"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
