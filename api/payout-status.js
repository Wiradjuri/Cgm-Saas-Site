const SQUARE_BASE_URL =
	process.env.SQUARE_ENV === "production"
		? "https://connect.squareup.com"
		: "https://connect.squareupsandbox.com";

async function squareRequest(path) {
	const accessToken = process.env.SQUARE_ACCESS_TOKEN;

	if (!accessToken) {
		throw new Error("Missing SQUARE_ACCESS_TOKEN");
	}

	const response = await fetch(`${SQUARE_BASE_URL}${path}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
	});

	const payload = await response.json();

	if (!response.ok) {
		const errorMessage = payload?.errors?.[0]?.detail || "Square API request failed";
		throw new Error(errorMessage);
	}

	return payload;
}

export default async function handler(req, res) {
	if (req.method !== "GET") {
		res.setHeader("Allow", ["GET"]);
		return res.status(405).json({
			success: false,
			message: "Method not allowed.",
		});
	}

	try {
		if (!process.env.SQUARE_ACCESS_TOKEN) {
			return res.status(500).json({
				success: false,
				message: "Missing SQUARE_ACCESS_TOKEN.",
			});
		}

		const payoutId = req.query?.payoutId || req.query?.id;
		const locationId = req.query?.locationId || process.env.SQUARE_LOCATION_ID;

		if (payoutId) {
			const payout = await squareRequest(`/v2/payouts/${encodeURIComponent(payoutId)}`);
			return res.status(200).json({ success: true, payout });
		}

		if (!locationId) {
			return res.status(400).json({
				success: false,
				message: "Provide a payoutId or a locationId.",
			});
		}

		const payouts = await squareRequest(`/v2/payouts?location_id=${encodeURIComponent(locationId)}`);
		return res.status(200).json({ success: true, payouts });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || "Unable to load Square payouts.",
		});
	}
}
