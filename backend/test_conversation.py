import asyncio
from app.database import Base, engine, SessionLocal
from app.models.conversation import ConversationSession, ConversationMessage
from app.services.llm_service import get_coach_response

# 1. Create tables
print("Creating tables...")
Base.metadata.create_all(bind=engine)

async def test():
    db = SessionLocal()
    # 2. Create session
    print("Creating session...")
    new_session = ConversationSession(topic="job interview")
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    print(f"Created session ID: {new_session.id}")
    
    # 3. Test LLM Response
    print("Sending message...")
    user_message = "Yesterday I go to the market and buyed some vegetables."
    try:
        response = await get_coach_response(
            user_message=user_message,
            conversation_history=[],
            user_level="intermediate",
            topic=new_session.topic
        )
        print("Response received:")
        print(response)
        
        # 4. Store messages
        print("Storing messages...")
        db.add(ConversationMessage(session_id=new_session.id, role="user", content=user_message))
        db.add(ConversationMessage(session_id=new_session.id, role="assistant", content=response.get("response", ""), scores=response.get("score")))
        db.commit()
        print("Stored successfully!")
        
    except Exception as e:
        print(f"Error during LLM call: {e}")
    finally:
        db.close()

asyncio.run(test())
