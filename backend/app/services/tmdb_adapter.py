"""
CinePredict AI - External TMDb Metadata & Poster Adapter
Provides optional movie poster and synopsis enrichments via The Movie Database API.
Core predictions operate 100% offline and do not require external network or API keys.
"""

import os
from typing import Optional, Dict, Any

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

def get_movie_poster_url(title: str, tmdb_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Retrieves poster image path and summary metadata.
    If TMDB_API_KEY is not configured or network is offline, provides safe fallback placeholder.
    """
    if not TMDB_API_KEY or TMDB_API_KEY == "your_optional_tmdb_api_key_here":
        return {
            "poster_url": None,
            "has_poster": False,
            "source": "LOCAL_FALLBACK",
            "message": "TMDb API key not configured. Using high-contrast SVG cinematic poster card."
        }
        
    try:
        import urllib.request
        import json
        import urllib.parse
        
        encoded_title = urllib.parse.quote(title)
        url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={encoded_title}"
        req = urllib.request.Request(url, headers={"User-Agent": "CinePredict-Platform/1.0"})
        with urllib.request.urlopen(req, timeout=3) as res:
            if res.status == 200:
                data = json.loads(res.read().decode())
                results = data.get("results", [])
                if results and results[0].get("poster_path"):
                    return {
                        "poster_url": f"{TMDB_IMAGE_BASE_URL}{results[0]['poster_path']}",
                        "has_poster": True,
                        "source": "TMDB_API",
                        "overview": results[0].get("overview", "")
                    }
    except Exception as e:
        # Fallback gracefully on any timeout or network restriction
        pass
        
    return {
        "poster_url": None,
        "has_poster": False,
        "source": "LOCAL_FALLBACK",
        "message": "Poster unavailable offline."
    }
