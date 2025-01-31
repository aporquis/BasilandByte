from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Recipe #this imports the model that we made in models.py


# Create your views here.

@csrf_exempt
@require_http_methods(["POST","GET","PUT","DELETE"]) #I am going to look into this next sprint because I dont think it is correct but it is working for the time being.

def add_recipe(request):
    """Handles adding new recipes to the database."""
    try:
        data = json.loads(request.body)  # Parse JSON request
        recipe = Recipe.objects.create( #create a recipe object to store the new information for the recipe
            title=data.get("title", "Untitled"), #the untitled, and the "" help ensure that if left blank something with substance is inserted in that way it doesnt break. 
            description=data.get("description", ""),
            ingredients=data.get("ingredients", ""),
            instructions=data.get("instructions", "")
        )

        # Return full recipe object to frontend
        return JsonResponse({              #will return to the GUI for the use the following:
            "id": recipe.id,
            "title": recipe.title,
            "description": recipe.description,
            "ingredients": recipe.ingredients,
            "instructions": recipe.instructions,
            "created_at": recipe.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        }, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
                                                                                          #request on the add_recipes part so I ended up just adding this line as a handler.
    

@csrf_exempt
@require_http_methods(["POST", "GET", "PUT", "DELETE"])
def get_recipes(request):
    """Fetch all recipes from the database."""
    if request.method == "GET":
        recipes = Recipe.objects.all() #fetch recipe objects in the database
        data = [ #convert the objects into a dictionary with key and value
            {
                "id": recipe.id,
                "title": recipe.title,
                "description": recipe.description,
                "ingredients": recipe.ingredients,
                "instructions": recipe.instructions,
                "created_at": recipe.created_at,
            }
            for recipe in recipes
        ]
        return JsonResponse(data, safe=False) #these statements that you see in every function return the data as a JSON

    return JsonResponse({"error": "Invalid request method"}, status=405)
    

@csrf_exempt
@require_http_methods(["POST", "GET", "PUT", "DELETE"])
def update_recipe(request, recipe_id):
    """Updates an existing recipe by ID."""
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            recipe = Recipe.objects.get(id=recipe_id)  # Fetch the recipe

            # Update the fields only if provided in the request if it is not then it should be left alone. 
            recipe.title = data.get("title", recipe.title)
            recipe.description = data.get("description", recipe.description)
            recipe.ingredients = data.get("ingredients", recipe.ingredients)
            recipe.instructions = data.get("instructions", recipe.instructions)
            recipe.save()

            return JsonResponse({
                "id": recipe.id,
                "title": recipe.title,
                "description": recipe.description,
                "ingredients": recipe.ingredients,
                "instructions": recipe.instructions
            }, status=200)
        except Recipe.DoesNotExist:
            return JsonResponse({"error": "Recipe not found"}, status=404)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@require_http_methods(["POST", "GET", "PUT", "DELETE"])
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
