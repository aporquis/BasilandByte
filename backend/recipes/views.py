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