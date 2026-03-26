# MthreeProject

A time-tracking app with a React frontend and Flask backend.

## Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL

## MySQL Setup

```bash
sudo apt install mysql-server
sudo mysql
```

```sql
CREATE DATABASE tasktimer;
CREATE USER 'tasktimer'@'localhost' IDENTIFIED BY 'tasktimer123';
GRANT ALL PRIVILEGES ON tasktimer.* TO 'tasktimer'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
DB_HOST=127.0.0.1
DB_USER=tasktimer
DB_PASSWORD=tasktimer123
DB_NAME=tasktimer
JWT_SECRET_KEY=your_secret_key
```

Run migrations and start:

```bash
alembic upgrade head
python app.py
```

## Frontend

```bash
cd Client/my-app
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Admin Setup

To promote a user to admin or create a new admin account:

```bash
cd backend
source venv/bin/activate
python create_admin.py
```
