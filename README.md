# Introduction
Basil & Byte is a comprehensive recipe and meal planner app designed to help users find, share, and plan meals while efficiently managing their grocery lists. This app simplifies meal planning by allowing users to explore recipes, generate grocery lists, and gain nutritional insights tailored to their dietary preferences.

Features:
<b>User-Generated Content</b>
    - Upload and share their recipes
    - Save favorite recipes for easy access
<b>Meal Planning Tools</b>
    - Create personalized meal plans for the week
    - Automatically generate grocery lists based on selected recipes
<b>Nutritional Analytics</b>
    - Track nutritional intake based on selected recipes
    - Gain insights into trends in dietary preferences and deficiencies over time
<b>Search Filters</b>
    - Search recipes by dietary preferences (vegan, gluten free, keto, etc.)
    - Find recipes based on available ingredients to reduce food waste
<b>Ingredient Substitutions</b>
    - Get suggested alternatives for missing ingredients
    - Receive recommendations based on dietary restrictions and allergies

# Getting Started
    <b>Cloning and Setting up Django Backend</b>
1. Clone the repository
   ```sh
   git clone https://dev.azure.com/CS480Spring25/_git/BasilAndByte
   ```
2. Navigate into the project directory
   ```sh
   cd basilandbyte
   ```
3. Create a virtual environment
   ```sh
   python -m venv venv
   ```
4. Activate the virtual environment
    * Windows (Git Bash):
   ```sh
   source venv/Scripts/activate
   ```
    * Windows (PowerShell):
   ```sh
   ./venv/Scripts/activate
   ```
    * Mac/Linux:
   ```sh
   source venv/bin/activate
   ```
5. Install required dependencies
   ```sh
   pip install -r requirements.txt
   ```
6. Navigate to the backend folder and start the Django server
   ```sh
   cd backend
   python manage.py runserver
   ```
7. Open a browser and check the Django server
   * URL: http://127.0.0.1:8000/admin

    <b>Setting up React Frontend</b>
1. Install Node.js (if not already installed)
    * Download from https://nodejs.org/
2. In a new terminal, navigate into the frontend folder
   ```sh
   cd frontend
   ```
3. Install dependencies
   ```sh
   npm install
   ```
3. Start the React Application
   ```sh
   npm start
   ```
4. Open a browser and check the React server
    * URL: http://localhost:3000/

    <b>PostgreSQL Setup with Django Framework</b>
1. Install PostgreSQL (if not already installed)
    * Download from https://www.postgresql.org/download/
        (Ensure you install the necessary librarys and psql command-line tool)
2. Create a Database and User
   ```sh
   psql -U postgres
   CREATE DATABASE capstone_recipe;
   CREATE USER capstone_user WITH PASSWORD 'dbbytes_basil';
   GRANT ALL PRIVILEGES ON DATABASE capstone_recipe TO capstone_user;
   \q
   ```
3. Install PostgreSQL adapter for Python
   ```sh
   pip install psycopg2-binary
   ```
3. Apply migrations
   ```sh
   cd backend
   python manage.py migrate
   ```
4. Restart your Django backend server to view migrations
    * URL: http://127.0.0.1:8000/admin

# Built & Collaborated using
* React https://react.dev/
* Django https://www.djangoproject.com/
* PostgreSQL https://www.postgresql.org/
* Postman https://www.postman.com/
* Miro https://miro.com/
* Azure DevOps https://dev.azure.com
