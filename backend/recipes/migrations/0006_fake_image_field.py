from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('recipes', '0005_recipe_category_alter_ingredient_ingredient_name_and_more')]
    operations = [
        migrations.AddField(
            model_name='recipeingredient',
            name='image',
            field=models.ImageField(
                upload_to='recipe_images/', null=True, blank=True),
        ),
    ]
