import Razorpay from "razorpay";

let client: Razorpay | null = null;

// Lazily constructed so importing this module never fails at build time
// (e.g. during Next.js's page-data collection) if the env vars happen to
// be unset in that environment. The error only surfaces when a payment
// is actually attempted, with a clear message pointing at the cause.
export function getRazorpay(): Razorpay {
  if (!client) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error(
        "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Add them in your environment (and in Vercel's Project Settings → Environment Variables) before accepting payments."
      );
    }
    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return client;
}
