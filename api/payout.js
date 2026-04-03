import { randomUUID } from "node:crypto";

const SQUARE_BASE_URL =
	process.env.SQUARE_ENV === "production"
		? "https://connect.squareup.com"
		: "https://connect.squareupsandbox.com";

function toAmountInCents(amount) {
	const parsedAmount = Number(amount);

	if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
		return null;
	}

	return Math.round(parsedAmount * 100);
}

async function squareRequest(path, options = {}) {
	const accessToken = process.env.SQUARE_ACCESS_TOKEN;

	if (!accessToken) {
		throw new Error("Missing SQUARE_ACCESS_TOKEN");
	}

	const response = await fetch(`${SQUARE_BASE_URL}${path}`, {
		method: options.method || "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: options.body,
	});

	const payload = await response.json();

	if (!response.ok) {
		const errorMessage = payload?.errors?.[0]?.detail || "Square API request failed";
		throw new Error(errorMessage);
	}

	return payload;
}

async function handlePostPayment(req, res) {
	const body = req.body || {};
	const amountInCents = toAmountInCents(body.amount);
	const sourceId = body.sourceId || body.source_id;
	const receiver = body.receiver || body.reciever || "recipient";
	const currency = String(body.currency || "AUD").toUpperCase();
	const locationId = body.locationId || process.env.SQUARE_LOCATION_ID;

	if (!amountInCents) {
		return res.status(400).json({
			success: false,
			message: "A valid positive amount is required.",
		});
	}

	if (!sourceId) {
		return res.status(400).json({
			success: false,
			message:
				"Square payments require a card sourceId. Square does not create arbitrary payouts from this route.",
		});
	}

	if (!locationId) {
		return res.status(500).json({
			success: false,
			message: "Missing SQUARE_LOCATION_ID.",
		});
	}

	const payment = await squareRequest("/v2/payments", {
		method: "POST",
		body: JSON.stringify({
			idempotency_key: randomUUID(),
			source_id: sourceId,
			amount_money: {
				amount: amountInCents,
				currency,
			},
			location_id: locationId,
			note: body.note || `Payment for ${receiver}`,
		}),
	});

	return res.status(200).json({
		success: true,
		message: "Square payment created.",
		payment,
	});
}

export default async function handler(req, res) {
	if (!process.env.SQUARE_ACCESS_TOKEN) {
		return res.status(500).json({
			success: false,
			message: "Missing SQUARE_ACCESS_TOKEN.",
		});
	}

	if (req.method === "POST") {
		try {
			return await handlePostPayment(req, res);
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: error.message || "Unable to create Square payment.",
			});
		}
	}

	res.setHeader("Allow", ["POST"]);
	return res.status(405).json({
		success: false,
		message: "Method not allowed.",
	});
}
