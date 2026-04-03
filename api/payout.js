export default async function handler(req, res) {
	const { amount, reciever } = req.body;

	const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

	res.status(200).json({ success: true, message: "Payout triggered!" });
}
