"""Utility functions for text processing.

These are minimal stubs used by agents in a production setting.
"""
import re

def clean_html(html: str) -> str:
    """Strip HTML tags and extra whitespace."""
    clean = re.sub(r'<[^>]+>', '', html)
    return re.sub(r'\s+', ' ', clean).strip()

def truncate(text: str, max_len: int = 200) -> str:
    """Truncate text to a maximum length, adding ellipsis if needed."""
    if len(text) <= max_len:
        return text
    return text[: max_len - 3].rstrip() + '...'
