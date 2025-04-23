from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from recipes.models import UserDeletion

class Command(BaseCommand):
    help = "Permanently delete users who requested deletion over 6 months ago."

    def handle(self, *args, **kwargs):
        # Time for deletion in Production
        # threshold_date = timezone.now() - timedelta(days=180)

        #Time for deletion in Preview to test
        threshold_date = timezone.now() - timedelta(minutes=5)

        deletions = UserDeletion.objects.filter(delete_request_time__lte=threshold_date)

        if not deletions.exists():
            self.stdout.write("No Accounts to Delete.")
            return

        for deletion in deletions:
            user = deletion.user
            username = user.username
            self.stdout.write(f"Deleting user: {username}")
            user.delete()

        self.stdout.write(self.style.SUCCESS(f"Deleted {deletions.count()} user(s)."))