from urllib.parse import urlparse, parse_qs


def extract_youtube_id(url: str):
    parsed = urlparse(url)

    # Standard youtube.com/watch?v=...
    if parsed.hostname in ("www.youtube.com", "youtube.com", "m.youtube.com"):
        if parsed.path == "/watch":
            return parse_qs(parsed.query).get("v", [None])[0]

        # youtube.com/embed/...
        if parsed.path.startswith("/embed/"):
            return parsed.path.split("/")[2]

        # youtube.com/shorts/...
        if parsed.path.startswith("/shorts/"):
            return parsed.path.split("/")[2]

    # youtu.be/...
    if parsed.hostname == "youtu.be":
        return parsed.path.lstrip("/")

    return None
