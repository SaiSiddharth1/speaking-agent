"""
In-memory conversation history manager.

Stores per-session conversation histories so each API call can include
the full context window when calling the LLM. Messages are trimmed to
the last MAX_HISTORY entries to prevent token overflow.

Phase 3 will replace this with MySQL persistence via ConversationMessage model.
"""

from typing import Dict, List

# In-memory store: { session_id: [{"role": "user"|"assistant", "content": "..."}] }
conversation_store: Dict[str, List[dict]] = {}

# Maximum number of messages to keep per session (prevents token overflow)
MAX_HISTORY = 20


def get_history(session_id: str) -> List[dict]:
    """
    Returns the conversation history for a given session.
    If the session doesn't exist yet, returns an empty list.
    """
    return conversation_store.get(session_id, [])


def add_message(session_id: str, role: str, content: str) -> None:
    """
    Appends a message to the session's conversation history.
    Auto-trims to the last MAX_HISTORY messages to prevent token overflow.
    
    Args:
        session_id: Unique session identifier (UUID string from frontend).
        role: Either "user" or "assistant".
        content: The message text.
    """
    if session_id not in conversation_store:
        conversation_store[session_id] = []

    conversation_store[session_id].append({
        "role": role,
        "content": content
    })

    # Trim to last MAX_HISTORY messages to prevent token overflow
    if len(conversation_store[session_id]) > MAX_HISTORY:
        conversation_store[session_id] = conversation_store[session_id][-MAX_HISTORY:]


def clear_history(session_id: str) -> None:
    """
    Resets the conversation history for a given session.
    """
    if session_id in conversation_store:
        del conversation_store[session_id]


def get_all_sessions() -> List[str]:
    """
    Returns a list of all active session IDs.
    Useful for debugging / admin purposes.
    """
    return list(conversation_store.keys())
