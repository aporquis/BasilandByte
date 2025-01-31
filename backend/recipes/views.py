from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Recipe


# Create your views here.

@csrf_exempt

def add_recipe(request): #if someone is on the front end wanting to add a recipe, they are making a request to the backend. Thats why the method is also POST.
    """A basic function in which allows for the users to add their own recipes to the database that is behind the website."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            recipe = Recipe.objects.create(
                title = data["title"],
                description = data["description"],
                ingredients = data["ingredients"],
                instructions = data ["instructions"],
            )
            return JsonResponse({"message" : "The recipe you added was successful!", "id" : recipe.id}, status =201)
        except Exception as e:
            return JsonResponse({"error":str(e)}, status=400)
        
    return JsonResponse({"error": "GET method not allowed for this endpoint"}, status=405) #I was having errors with it sending none for the GET 
                                                                                          #request on the add_recipes part so I ended up just adding this line as a handler.
    

@csrf_exempt
def get_recipes(request): #if someone is wanting to request something from the website, such as what recipes we have, they are requesting to the backend to GET information.
    """A basic function to help with retreiving the recipes out of a data base to share to the user"""
    if request.method == "GET":
        recipes = Recipe.objects.all()
        data = [
            {
                "id" : recipe.id,
                "title" : recipe.title,
                "description" : recipe.description,
                "ingredients" : recipe.instructions,
                "created_at" : recipe.created_at,
            }
            for recipe in recipes
        ]
        return JsonResponse(data, safe=False)
    

@csrf_exempt
def update_recipe(request, recipe_id):
    """Updates an existing recipe by ID."""
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            recipe = Recipe.objects.get(id=recipe_id)  # Fetch the recipe

            # Update the fields only if provided in the request
            recipe.title = data.get("title", recipe.title)
            recipe.description = data.get("description", recipe.description)
            recipe.ingredients = data.get("ingredients", recipe.ingredients)
            recipe.instructions = data.get("instructions", recipe.instructions)
            recipe.save()

            return JsonResponse({"message": "Recipe updated successfully"}, status=200)
        except Recipe.DoesNotExist:
            return JsonResponse({"error": "Recipe not found"}, status=404)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def delete_recipe(request, recipe_id):
    """Deletes a recipe by ID."""
    if request.method == "DELETE":
        try:
            recipe = Recipe.objects.get(id=recipe_id)
            recipe.delete()
            return JsonResponse({"message": "Recipe deleted successfully"}, status=200)
        except Recipe.DoesNotExist:
            return JsonResponse({"error": "Recipe not found"}, status=404)

    return JsonResponse({"error": "Invalid request method"}, status=405)
