import os
import json
import hmac
import hashlib
import logging
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)

# Fallback profile settings
DEFAULT_INSTAGRAM_HANDLE = "@suratchagaurinandan"
DEFAULT_INSTAGRAM_PROFILE = "https://www.instagram.com/suratchagaurinandan"

# High-quality fallback items shown when live credentials are not yet configured or Meta API is unreachable
FALLBACK_ITEMS = [
    {
        "id": "fb_reel_1",
        "caption": "🚩 Divine Mangala Aarti Darshan of Surat Cha Gaurinandan! May Lord Ganesha bless you and your family with prosperity and peace. #SuratChaGaurinandan #GaneshMahotsav2026 #LiveDarshan #Bappa",
        "media_type": "VIDEO",
        "media_url": "https://images.unsplash.com/photo-1567591974584-f1832d43232f?auto=format&fit=crop&w=800&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1567591974584-f1832d43232f?auto=format&fit=crop&w=800&q=80",
        "permalink": f"{DEFAULT_INSTAGRAM_PROFILE}/reels",
        "timestamp": "2026-08-27T03:30:00+0000",
        "username": "suratchagaurinandan",
        "is_reel": True,
        "formatted_date": "27 Aug 2026",
    },
    {
        "id": "fb_post_2",
        "caption": "✨ Swarna Shringaar Darshan of Bappa at the Grand Sanctum. Devotees gathering in devotion for the sacred rituals. #GaneshChaturthi #SuratGaneshUtsav #Darshan",
        "media_type": "IMAGE",
        "media_url": "https://images.unsplash.com/photo-1609358905581-e5382c473188?auto=format&fit=crop&w=800&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1609358905581-e5382c473188?auto=format&fit=crop&w=800&q=80",
        "permalink": DEFAULT_INSTAGRAM_PROFILE,
        "timestamp": "2026-08-26T14:30:00+0000",
        "username": "suratchagaurinandan",
        "is_reel": False,
        "formatted_date": "26 Aug 2026",
    },
    {
        "id": "fb_reel_3",
        "caption": "🥁 Dhol Tasha Pathak beats echoing through Surat during the majestic Aagman Sohla! Experience the divine energy. #Aagman2026 #DholTasha #BappaMoraya",
        "media_type": "VIDEO",
        "media_url": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
        "permalink": f"{DEFAULT_INSTAGRAM_PROFILE}/reels",
        "timestamp": "2026-08-25T11:00:00+0000",
        "username": "suratchagaurinandan",
        "is_reel": True,
        "formatted_date": "25 Aug 2026",
    },
    {
        "id": "fb_post_4",
        "caption": "🌸 51,000 Modak Mahaprasad preparation underway by our dedicated Sewak teams. Ganpati Bappa Morya! #Mahaprasad #Sewa #Surat",
        "media_type": "IMAGE",
        "media_url": "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80",
        "permalink": DEFAULT_INSTAGRAM_PROFILE,
        "timestamp": "2026-08-24T09:15:00+0000",
        "username": "suratchagaurinandan",
        "is_reel": False,
        "formatted_date": "24 Aug 2026",
    },
    {
        "id": "fb_reel_5",
        "caption": "🔥 Maha Sandhya Aarti with 1008 deepaks illuminated together in unison. A truly blissful experience for thousands of devotees! #SandhyaAarti #Deepotsav",
        "media_type": "VIDEO",
        "media_url": "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
        "permalink": f"{DEFAULT_INSTAGRAM_PROFILE}/reels",
        "timestamp": "2026-08-23T13:45:00+0000",
        "username": "suratchagaurinandan",
        "is_reel": True,
        "formatted_date": "23 Aug 2026",
    },
    {
        "id": "fb_post_6",
        "caption": "🏛️ Beautiful 3D Temple Pavilion lighting highlights in Surat! Open 24x7 for all devotees. Book your VIP Aarti passes online now. #SuratTemple #GaneshFestival",
        "media_type": "IMAGE",
        "media_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
        "permalink": DEFAULT_INSTAGRAM_PROFILE,
        "timestamp": "2026-08-22T16:00:00+0000",
        "username": "suratchagaurinandan",
        "is_reel": False,
        "formatted_date": "22 Aug 2026",
    },
    {
        "id": "fb_reel_7",
        "caption": "🌺 Flower shower and Vedic chant resonance during Rajbhog Samarambh. Feel the divine presence from wherever you are. #VedicChants #Blessings #SuratChaGaurinandan",
        "media_type": "VIDEO",
        "media_url": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80",
        "permalink": f"{DEFAULT_INSTAGRAM_PROFILE}/reels",
        "timestamp": "2026-08-21T06:30:00+0000",
        "username": "suratchagaurinandan",
        "is_reel": True,
        "formatted_date": "21 Aug 2026",
    },
    {
        "id": "fb_post_8",
        "caption": "🙏 Devotees joining hands in prayer during the grand morning Maha Aarti. #Bhakti #Faith #GaneshaBlessings",
        "media_type": "IMAGE",
        "media_url": "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=800&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=800&q=80",
        "permalink": DEFAULT_INSTAGRAM_PROFILE,
        "timestamp": "2026-08-20T04:00:00+0000",
        "username": "suratchagaurinandan",
        "is_reel": False,
        "formatted_date": "20 Aug 2026",
    }
]


def get_instagram_config():
    """
    Retrieves Instagram credentials and configuration from environment / settings.
    """
    access_token = (
        os.environ.get("INSTAGRAM_ACCESS_TOKEN")
        or getattr(settings, "INSTAGRAM_ACCESS_TOKEN", "")
    ).strip()

    app_secret = (
        os.environ.get("INSTAGRAM_APP_SECRET")
        or getattr(settings, "INSTAGRAM_APP_SECRET", "")
    ).strip()

    app_id = (
        os.environ.get("INSTAGRAM_APP_ID")
        or getattr(settings, "INSTAGRAM_APP_ID", "")
    ).strip()

    user_id = (
        os.environ.get("INSTAGRAM_USER_ID")
        or getattr(settings, "INSTAGRAM_USER_ID", "me")
    ).strip() or "me"

    cache_timeout_raw = (
        os.environ.get("INSTAGRAM_CACHE_TIMEOUT")
        or getattr(settings, "INSTAGRAM_CACHE_TIMEOUT", "300")
    )
    try:
        cache_timeout = int(cache_timeout_raw)
    except (ValueError, TypeError):
        cache_timeout = 300

    return {
        "access_token": access_token,
        "app_secret": app_secret,
        "app_id": app_id,
        "user_id": user_id,
        "cache_timeout": cache_timeout,
        "is_configured": bool(access_token),
    }


def compute_appsecret_proof(access_token: str, app_secret: str) -> str:
    """
    Computes HMAC-SHA256 hash of access_token using app_secret for Meta Graph API security.
    """
    if not access_token or not app_secret:
        return ""
    return hmac.new(
        app_secret.encode("utf-8"),
        access_token.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()


def format_iso_timestamp(ts_str: str) -> str:
    """
    Converts ISO timestamp (e.g. 2026-08-27T10:30:00+0000) to a clean human-readable date.
    """
    if not ts_str:
        return ""
    try:
        clean_ts = ts_str.replace("Z", "+00:00")
        if "+" in clean_ts and len(clean_ts.split("+")[1]) == 4:
            base, offset = clean_ts.rsplit("+", 1)
            clean_ts = f"{base}+{offset[:2]}:{offset[2:]}"
        dt = datetime.fromisoformat(clean_ts)
        return dt.strftime("%d %b %Y")
    except Exception:
        return ts_str[:10] if len(ts_str) >= 10 else ts_str


def parse_instagram_item(raw_item: dict) -> dict:
    """
    Normalizes a single Instagram Graph API item into standard feed schema.
    """
    media_type = raw_item.get("media_type", "IMAGE").upper()
    permalink = raw_item.get("permalink", DEFAULT_INSTAGRAM_PROFILE)
    caption = raw_item.get("caption", "")
    
    # Check if media is a Reel / Video
    is_reel = (
        media_type == "VIDEO"
        or "/reel/" in permalink
        or "reel" in caption.lower()
        or raw_item.get("media_product_type") == "REELS"
    )

    media_url = raw_item.get("media_url") or raw_item.get("thumbnail_url", "")
    thumbnail_url = raw_item.get("thumbnail_url") or media_url

    # Handle children items if Carousel Album
    children = []
    if "children" in raw_item and isinstance(raw_item["children"], dict):
        raw_children = raw_item["children"].get("data", [])
        for ch in raw_children:
            ch_type = ch.get("media_type", "IMAGE").upper()
            ch_url = ch.get("media_url") or ch.get("thumbnail_url", "")
            children.append({
                "id": ch.get("id"),
                "media_type": ch_type,
                "media_url": ch_url,
                "thumbnail_url": ch.get("thumbnail_url") or ch_url,
            })

    timestamp = raw_item.get("timestamp", "")
    formatted_date = format_iso_timestamp(timestamp)

    return {
        "id": raw_item.get("id", str(hash(permalink))),
        "caption": caption,
        "media_type": media_type,
        "media_url": media_url,
        "thumbnail_url": thumbnail_url,
        "permalink": permalink,
        "timestamp": timestamp,
        "formatted_date": formatted_date,
        "username": raw_item.get("username", "suratchagaurinandan"),
        "is_reel": is_reel,
        "like_count": raw_item.get("like_count", None),
        "comments_count": raw_item.get("comments_count", None),
        "children": children,
    }


def fetch_instagram_feed(limit: int = 12, refresh: bool = False) -> dict:
    """
    Fetches live feed from Instagram Graph / Basic Display API.
    - Uses Django cache to minimize rate limits and ensure lightning-fast latency.
    - If INSTAGRAM_ACCESS_TOKEN is missing or invalid, provides clear diagnostic state
      and curated fallback posts so the website UI remains fully functional.
    """
    limit = max(1, min(limit, 50))
    cache_key = f"instagram_live_feed_limit_{limit}"

    # Check cache first unless forced refresh
    if not refresh:
        cached_result = cache.get(cache_key)
        if cached_result:
            return {**cached_result, "cached": True}

    config = get_instagram_config()
    access_token = config["access_token"]
    app_secret = config["app_secret"]
    user_id = config["user_id"]
    cache_timeout = config["cache_timeout"]

    # If unconfigured, return clear diagnostic status + fallback items
    if not access_token:
        logger.info("[Instagram] INSTAGRAM_ACCESS_TOKEN not set in environment. Returning fallback feed.")
        result = {
            "success": True,
            "status": "unconfigured",
            "configured": False,
            "source": "fallback",
            "message": "Instagram Access Token is not set in backend/.env. Please configure INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_APP_SECRET.",
            "data": FALLBACK_ITEMS[:limit],
            "count": len(FALLBACK_ITEMS[:limit]),
            "cached": False,
        }
        # Cache fallback briefly so unconfigured state is fast
        cache.set(cache_key, result, timeout=60)
        return result

    # Build Graph API URL
    fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{id,media_type,media_url,thumbnail_url}"
    query_params = {
        "fields": fields,
        "access_token": access_token,
        "limit": str(limit),
    }

    # If App Secret provided, compute appsecret_proof for enhanced security
    if app_secret:
        query_params["appsecret_proof"] = compute_appsecret_proof(access_token, app_secret)

    url = f"https://graph.instagram.com/{user_id}/media?{urllib.parse.urlencode(query_params)}"

    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "GaneshMahotsav-InstagramFeed/1.0",
                "Accept": "application/json",
            }
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)

        raw_items = data.get("data", [])
        parsed_items = [parse_instagram_item(item) for item in raw_items]

        result = {
            "success": True,
            "status": "live",
            "configured": True,
            "source": "live_instagram_graph_api",
            "message": f"Successfully fetched {len(parsed_items)} live posts from Instagram Graph API.",
            "data": parsed_items,
            "count": len(parsed_items),
            "paging": data.get("paging", {}),
            "cached": False,
        }

        # Cache successful live response
        cache.set(cache_key, result, timeout=cache_timeout)
        logger.info(f"[Instagram] Live feed updated: {len(parsed_items)} posts cached for {cache_timeout}s.")
        return result

    except urllib.error.HTTPError as http_err:
        err_body = ""
        try:
            err_body = http_err.read().decode("utf-8")
            err_json = json.loads(err_body)
            meta_err_msg = err_json.get("error", {}).get("message", str(http_err))
        except Exception:
            meta_err_msg = str(http_err)

        logger.warning(f"[Instagram] Meta Graph API Error ({http_err.code}): {meta_err_msg}")

        result = {
            "success": False,
            "status": "error",
            "configured": True,
            "source": "fallback_on_error",
            "error_code": http_err.code,
            "message": f"Meta Instagram API returned an error: {meta_err_msg}",
            "data": FALLBACK_ITEMS[:limit],
            "count": len(FALLBACK_ITEMS[:limit]),
            "cached": False,
        }
        # Cache briefly to avoid hammering Meta API repeatedly when token is invalid
        cache.set(cache_key, result, timeout=120)
        return result

    except Exception as e:
        logger.error(f"[Instagram] Network error fetching Instagram feed: {str(e)}")
        return {
            "success": False,
            "status": "network_error",
            "configured": True,
            "source": "fallback_on_network_error",
            "message": f"Network exception: {str(e)}",
            "data": FALLBACK_ITEMS[:limit],
            "count": len(FALLBACK_ITEMS[:limit]),
            "cached": False,
        }


def refresh_long_lived_token() -> dict:
    """
    Refreshes long-lived Instagram User Access Token (which has a 60-day lifetime).
    Calls GET https://graph.instagram.com/refresh_access_token
    """
    config = get_instagram_config()
    access_token = config["access_token"]

    if not access_token:
        return {
            "success": False,
            "message": "Cannot refresh token: INSTAGRAM_ACCESS_TOKEN is not set.",
        }

    params = {
        "grant_type": "ig_refresh_token",
        "access_token": access_token,
    }
    url = f"https://graph.instagram.com/refresh_access_token?{urllib.parse.urlencode(params)}"

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "GaneshMahotsav-InstagramFeed/1.0"}
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))

        new_token = data.get("access_token")
        expires_in = data.get("expires_in")  # seconds remaining (usually ~5184000 = 60 days)

        logger.info(f"[Instagram] Token successfully refreshed. Expires in: {expires_in} seconds.")
        return {
            "success": True,
            "message": "Instagram access token refreshed successfully.",
            "access_token": new_token,
            "expires_in": expires_in,
            "token_type": data.get("token_type", "bearer"),
        }
    except urllib.error.HTTPError as http_err:
        err_body = http_err.read().decode("utf-8", errors="ignore")
        logger.error(f"[Instagram] Token refresh HTTP error ({http_err.code}): {err_body}")
        return {
            "success": False,
            "status_code": http_err.code,
            "message": f"Meta token refresh failed: {err_body}",
        }
    except Exception as e:
        logger.error(f"[Instagram] Token refresh exception: {str(e)}")
        return {
            "success": False,
            "message": str(e),
        }


def get_instagram_status_info() -> dict:
    """
    Returns system health & configuration status for Instagram integration.
    """
    config = get_instagram_config()
    token = config["access_token"]
    masked_token = f"{token[:6]}...{token[-4:]}" if len(token) > 10 else ("Configured" if token else "Not Set")

    app_secret = config["app_secret"]
    masked_secret = f"{app_secret[:3]}...{app_secret[-3:]}" if len(app_secret) > 6 else ("Configured" if app_secret else "Not Set")

    return {
        "configured": config["is_configured"],
        "has_access_token": bool(token),
        "masked_access_token": masked_token,
        "has_app_secret": bool(app_secret),
        "masked_app_secret": masked_secret,
        "has_app_id": bool(config["app_id"]),
        "user_id": config["user_id"],
        "cache_timeout_seconds": config["cache_timeout"],
        "profile_url": DEFAULT_INSTAGRAM_PROFILE,
        "handle": DEFAULT_INSTAGRAM_HANDLE,
    }
