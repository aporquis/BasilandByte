# Introduction
Basil & Byte is a comprehensive recipe and meal planner app designed to help users find, share, and plan meals while efficiently managing their grocery lists. This app simplifies meal planning by allowing users to explore recipes, generate grocery lists, and gain nutritional insights tailored to their dietary preferences.

## Features:
### User-Generated Content
* Upload and share their recipes
* Save favorite recipes for easy access

### Meal Planning Tools
* Create personalized meal plans for the week
* Automatically generate grocery lists based on selected recipes

### Nutritional Analytics
* Track nutritional intake based on selected recipes
* Gain insights into trends in dietary preferences and deficiencies over time

### Search Filters
* Search recipes by dietary preferences (vegan, gluten free, keto, etc.)
* Find recipes based on available ingredients to reduce food waste

### Ingredient Substitutions
* Get suggested alternatives for missing ingredients
* Receive recommendations based on dietary restrictions and allergies

# Getting Started
### Cloning and Setting up Django Backend
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
6. Navigate to the backend folder
   ```sh
   cd backend
   ```
7. Open or create an .env file within the backend folder. Enter the following code, changing the IP addresses and the folder path to match your local instance.
   ```sh
    DJANGO_SECRET_KEY=your-secret-key-here
    DEBUG=True
    ALLOWED_HOSTS=127.0.0.1, X.X.X.X
    #change the X.X.X.X to your personal ip but keep the fall back of 127.0.0.1
    RECIPE_IMAGE_PATH= C:/Users/XXXX
    #change this path to your image folder path.

    #CORS Allowed Origins
    CORS_ALLOWED_ORIGINS=http://X.X.X.X:8000,http://localhost:3000
    # change this IP address (X.X.X.X BUT KEEP THE PORT)

    # PostgreSQL Database Credentials
    DB_NAME=capstone_recipe
    DB_USER=capstone_user
    DB_PASSWORD=dbbytes_basil
    DB_HOST=localhost
    DB_PORT=5432
   ```
8. Start the Django server
   ```sh
   python manage.py runserver
   ```
7. Open a browser and check the Django server
   * URL: http://127.0.0.1:8000/admin

### Setting up React Frontend
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
4. Open or create an .env file within the frontend folder. Enter the following code, changing the IP addresses to match your local instance.
   ```sh
    REACT_APP_API_BASE_URL=http://X.X.X.X:8000
   ```
5. Start React
   ```sh
   npm start
   ```
6. Open a browser and check the React application
    * URL: http://localhost:3000/

### Configuring the Mobile Application .env
1. In a new terminal, navigate into the mobile folder
   ```sh
   cd mobile
   ```
2. Open or create an .env file within the mobile folder. Enter the following code, changing the IP addresses to match your local instance.
   ```sh
    API_URL=http://X.X.X.X:8000/api
    RECIPE_IMAGE_PATH=http://X.X.X.X:8000/recipe_images
   ```

### PostgreSQL Setup with Django Framework
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