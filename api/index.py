import os
import uuid

from flask import Flask, jsonify, request
from flask_cors import CORS
from square.client import Client

app = Flask(__name__)
CORS(app)

TIER_PRICING = {
    "starter": 24900,
    "pro": 74900,
    "business": 185000,
}


@app.post("/api/checkout")
def create_checkout_link():
    payload = request.get_json(silent=True) or {}
    tier = str(payload.get("tier", "")).strip().lower()

    if tier not in TIER_PRICING:
        return jsonify({"error": "Unsupported tier. Use starter, pro, or business."}), 400

    access_token = os.getenv("SQUARE_ACCESS_TOKEN")
    location_id = os.getenv("SQUARE_LOCATION_ID")

    if not access_token or not location_id:
        return jsonify({"error": "Square configuration is missing."}), 500

    client = Client(
        access_token=access_token,
        environment=os.getenv("SQUARE_ENVIRONMENT", "production"),
    )

    body = {
        "idempotency_key": str(uuid.uuid4()),
        "checkout_options": {
            "redirect_url": "https://flexicad.com.au/success",
        },
        "order": {
            "location_id": location_id,
            "line_items": [
                {
                    "name": f"FlexiCAD {tier.capitalize()} License",
                    "quantity": "1",
                    "base_price_money": {
                        "amount": TIER_PRICING[tier],
                        "currency": "AUD",
                    },
                }
            ],
        },
    }

    response = client.checkout.create_payment_link(body)

    if response.is_success():
        payment_link = response.body.get("payment_link", {})
        return jsonify({"url": payment_link.get("url")})

    return jsonify({"error": response.errors}), 502


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True)
