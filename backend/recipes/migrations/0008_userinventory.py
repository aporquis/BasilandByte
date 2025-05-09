# Generated by Django 4.2.18 on 2025-04-15 02:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('recipes', '0007_remove_ingredient_image_ingredient_image_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserInventory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=2, help_text='Quantity of the ingredient', max_digits=6)),
                ('unit', models.CharField(help_text='Unit of measurement (e.g., grams, cups, pieces)', max_length=50)),
                ('storage_location', models.CharField(choices=[('fridge', 'Fridge'), ('freezer', 'Freezer'), ('pantry', 'Pantry')], default='pantry', max_length=20)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateField(blank=True, help_text='Expiration date (optional)', null=True)),
                ('is_available', models.BooleanField(default=True, help_text='Whether the item is still available for use')),
                ('ingredient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_inventories', to='recipes.ingredient')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inventory_items', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-added_at'],
                'unique_together': {('user', 'ingredient', 'storage_location')},
            },
        ),
    ]
