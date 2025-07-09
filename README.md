**Neighbourhood Tool Management System**

A full-stack Django + React (TypeScript) web-app for neighbors to **lend, borrow, and manage tools** efficiently.

🌐 Live Demo (deploment under process)

🚀 Tech Stack

🖥️ Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Axios

🔧 Backend
- Django
- Django REST Framework
- Custom User Model (email-based login)
- SQLite (dev) or PostgreSQL/MySQL (prod)

Neighbourhood_Tool_Management_System/
├── backend/ # Django Backend
│ ├── apps/ # Users, Tools, Requests apps
│ ├── toolshare/ # Settings and URLs
│ ├── media/ # Uploaded files
│ ├── manage.py
│ └── requirements.txt
├── frontend/ # React Frontend
│ ├── src/
│ ├── public/
│ ├── vite.config.ts
│ └── .env
└── README.md

🛠️ Getting Started

🔹 1. Clone the Repo

git clone https://github.com/your-username/Neighbourhood_Tool_Management_System.git
cd Neighbourhood_Tool_Management_System

Frontend Setup (React + Vite)

cd frontend
npm install
cp .env.example .env
npm run dev

🌐 Frontend .env.example
env
# Base URL of the backend server (local or production)
VITE_API_BASE_URL=http://localhost:8000/api

⚙️ Backend Setup (Django + DRF)
📍 Location: /backend

cd backend
python -m venv env
source env/bin/activate  # or env\Scripts\activate on Windows
pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

python manage.py createsuperuser

python manage.py runserver


 Backend .env.example (Optional for prod)
env
Copy
Edit
# Django secret key
SECRET_KEY=your-secret-key

# Debug mode
DEBUG=True

# Allowed hosts
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (default is SQLite, use for dev)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# Use this if deploying with PostgreSQL or MySQL
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=your-db-name
# DB_USER=your-db-user
# DB_PASSWORD=your-db-password
# DB_HOST=your-db-host
# DB_PORT=5432

🧪 Testing API (Optional)
Once backend is running, test endpoints like:

GET http://localhost:8000/api/tools/
POST http://localhost:8000/api/requests/

