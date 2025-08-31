from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session
import os
from dotenv import load_dotenv
import pathlib

load_dotenv()

# Create database folder if it doesn't exist
database_folder = pathlib.Path("database")
database_folder.mkdir(exist_ok=True)

# Database will be created in database/saas_chatbot.db
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{database_folder}/saas_chatbot.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Use scoped_session for thread-safe session management
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    """Initialize the database by creating tables"""
    # Import models here to avoid circular imports
    from models import Business, User, Lead, Chat, Product, TokenTransaction
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created")
    
    # Create default business if none exists
    db = db_session()
    try:
        if not db.query(Business).first():
            default_business = Business(
                name="Default Business",
                config="{}"
            )
            db.add(default_business)
            db.commit()
            print("Created default business")
    except Exception as e:
        print(f"Error creating default business: {e}")
        db.rollback()
    finally:
        db.close()

def get_db():
    """Provide a transactional scope around a series of operations."""
    db = db_session()
    try:
        yield db
    finally:
        db.close()
