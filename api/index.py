import os
import uuid
from flask import Flask, jsonify, request
from square.client import Client

app = Flask(__name__)

# Enterprise SaaS Pricing Tiers
PRICES_IN_CENTS = {
    "starter": 24900,
    "pro": 74900,
    "business": 185000,
    "growth": 495000,
    "enterprise": 950000,
}

def get_square_client() -> Client:
    """Initializes the Square client with environment-based credentials."""
    access_token = os.environ.get('SQUARE_ACCESS_TOKEN')
    # Default to production; set SQUARE_ENV to 'sandbox' for testing
    environment = os.environ.get('SQUARE_ENV', 'production')
    
    if not access_token:
        raise RuntimeError("Missing SQUARE_ACCESS_TOKEN in environment variables.")

    return Client(access_token=access_token, environment=environment)

@app.route("/api/checkout", methods=["POST"])
def checkout():
    payload = request.get_json(silent=True) or {}
    tier = str(payload.get("tier", "")).strip().lower()

    if tier not in PRICES_IN_CENTS:
        return jsonify({"error": "Invalid tier selection."}), 400

    location_id = os.getenv("SQUARE_LOCATION_ID")
    currency = os.getenv("SQUARE_CURRENCY", "AUD").upper()

    if not location_id:
        return jsonify({"error": "Missing SQUARE_LOCATION_ID"}), 500

    amount = PRICES_IN_CENTS[tier]

    # Structure the request for the Square Checkout API
    body = {
        "idempotency_key": str(uuid.uuid4()),
        "checkout_options": {
            "redirect_url": "https://flexicad.com.au/success",
        },
        "order": {
            "location_id": location_id,
            "metadata": {
                "source": "FlexiCAD_SaaS_Portal",
                "client_id": "CGM_SAAS"
            },
            "line_items": [
                {
                    "name": f"FlexiCAD {tier.title()} Subscription",
                    "quantity": "1",
                    "base_price_money": {
                        "amount": amount,
                        "currency": currency,
                    },
                }
            ],
        },
    }

    try:
        client = get_square_client()
        result = client.checkout.create_payment_link(body)

        if result.is_error():
            return jsonify({"error": result.errors}), 500

        # Return the generated Square URL to the frontend
        checkout_url = result.body["payment_link"]["url"]
        return jsonify({"url": checkout_url, "tier": tier}), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint for Vercel monitoring."""
    return jsonify({"status": "ok", "service": "FlexiCAD API"}), 200

if __name__ == "__main__":
    # Local development server
    app.run(host="0.0.0.0", port=8000, debug=True)