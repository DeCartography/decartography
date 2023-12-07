from functools import wraps
from flask import request, jsonify
import jwt
from ratelimit import limits


def rate_limiter(rate_limit, burst_limit):
    @limits(calls=rate_limit, period=burst_limit)
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not request.limited:
                return f(*args, **kwargs)
            else:
                return jsonify(error="Rate limit exceeded"), 429
        return wrapper
    return decorator


def auth_middleware(auth_key):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                return jsonify(error="Missing authorization header"), 401

            parts = auth_header.split(" ")
            if len(parts) != 2 or parts[0] != "Bearer":
                return jsonify(error="Invalid authorization header format"), 401

            token_string = parts[1]
            try:
                token = jwt.decode(token_string, auth_key,algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return jsonify(error="Token has expired"), 401
            except jwt.InvalidTokenError:
                return jsonify(error="Invalid token"), 401

            address = token.get("address")
            if not address:
                return jsonify(error="Invalid token payload"), 401

            return f(address, *args, **kwargs)
        return wrapper
    return decorator
