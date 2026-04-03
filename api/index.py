import os
import uuid

from flask import Flask, jsonify, request
<<<<<<< HEAD
from square.client import Client

app = Flask(__name__)

PRICES_IN_CENTS = {
    "starter": 24900,
    "pro": 74900,
    "business": 185000,
    "growth": 495000,
    "enterprise": 950000,
}


def get_square_client() -> Client:
    access_token = os.getenv("SQUARE_ACCESS_TOKEN")
    environment = os.getenv("SQUARE_ENV", "sandbox")

    if not access_token:
        raise RuntimeError("Missing SQUARE_ACCESS_TOKEN")

    return Client(access_token=access_token, environment=environment)


@app.route("/api/checkout", methods=["POST"])
def checkout():
    payload = request.get_json(silent=True) or {}
    tier = str(payload.get("tier", "")).strip().lower()

    if tier not in PRICES_IN_CENTS:
        return jsonify({"error": "Invalid tier."}), 400

    location_id = os.getenv("SQUARE_LOCATION_ID")
    currency = os.getenv("SQUARE_CURRENCY", "AUD").upper()

    if not location_id:
        return jsonify({"error": "Missing SQUARE_LOCATION_ID"}), 500

    amount = PRICES_IN_CENTS[tier]

    body = {
        "idempotency_key": str(uuid.uuid4()),
        "order": {
            "location_id": location_id,
            "metadata": {
                "source": "FlexiCAD_SaaS_Portal",
            },
            "line_items": [
                {
                    "name": f"FlexiCAD {tier.title()} Subscription",
                    "quantity": "1",
                    "base_price_money": {
                        "amount": amount,
                        "currency": currency,
=======
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
>>>>>>> 9aae294f04c788227d112e5f90ea00ec0b7b2ef9
                    },
                }
            ],
        },
<<<<<<< HEAD
        "checkout_options": {
            "redirect_url": "https://flexicad.com.au/success",
        },
    }

    try:
        client = get_square_client()
        result = client.checkout.create_payment_link(body)

        if result.is_error():
            return jsonify({"error": result.errors}), 500

        checkout_url = result.body["payment_link"]["url"]
        return jsonify({"url": checkout_url, "tier": tier}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
=======
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
>>>>>>> 9aae294f04c788227d112e5f90ea00ec0b7b2ef9
