import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User, Base

# Construct an absolute path to the project root
# __file__ is backend/add_tokens.py, so we go up two directories
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Construct an absolute path to the database file
db_path = os.path.join(project_root, "backend", "database", "saas_chatbot.db")
DATABASE_URL = f"sqlite:///{db_path}"

# Ensure the models are loaded (if they are in a different structure)
# This might not be necessary if imports are correct
sys.path.append(os.path.join(project_root, "backend"))


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.bind = engine

def add_tokens(email: str, amount: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.tokens += amount
            db.commit()
            print(f"Successfully added {amount} tokens to {email}. New balance: {user.tokens}")
        else:
            print(f"User with email {email} not found.")
    finally:
        db.close()

if __name__ == "__main__":
    # Make sure to use the correct email address
    add_tokens("ahmad4954069@gmail.com", 1000)
