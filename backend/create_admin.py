"""
Run this script once to promote an existing user to admin, or create a new admin.
Usage: python create_admin.py
"""
from dotenv import load_dotenv
load_dotenv()

from werkzeug.security import generate_password_hash
from db import get_db_connection


def main():
    email = input("Email of the user to promote (or new admin email): ").strip()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id, username, role FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user:
        if user["role"] == "admin":
            print(f"'{user['username']}' is already an admin.")
        else:
            cursor.execute("UPDATE users SET role = 'admin' WHERE id = %s", (user["id"],))
            conn.commit()
            print(f"'{user['username']}' promoted to admin.")
    else:
        username = input("New admin username: ").strip()
        password = input("New admin password: ").strip()
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, 'admin')",
            (username, email, generate_password_hash(password))
        )
        conn.commit()
        print(f"Admin user '{username}' created.")

    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()
