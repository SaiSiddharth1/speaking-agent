from database.connection import Base, engine
from database.models import User, Session, Message, Score

# Create all tables
Base.metadata.create_all(bind=engine)
print("✅ Database schema created successfully!")