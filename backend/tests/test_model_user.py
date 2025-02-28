from django.test import TestCase
from django.contrib.auth.models import User

class UserModelTest(TestCase):
    def setUp(self):
        """Set up a test user."""
        self.user = User.objects.create_user(
            username="capstone_user",
            email="capstoneuser@example.com",
            password="dbbytes_basil"
        )

    def test_user_create(self):
        """Test if user is created."""
        self.assertEqual(self.user.username,"capstone_user")
        self.assertEqual(self.user.email, "capstoneuser@example.com")
        self.assertTrue(self.user.check_password("dbbytes_basil"))

    def test_user_str(self):
        """Test the returned string with the user model"""
        self.assertEqual(str(self.user), "capstone_user")

    def test_user_authentication(self):
        """Test the user authentication with username and password"""
        user=User.objects.get(username="capstone_user")
        self.assertTrue(user.check_password("dbbytes_basil"))

    def test_duplicate(self):
        """Test that duplicate usernames are not allowed; Django auto increments users"""
        with self.assertRaises(Exception):
            User.objects.create_user(username="capstone_user", email="duplicate@example.com", password="password")
