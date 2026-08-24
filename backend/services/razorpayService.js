const Razorpay = require('razorpay');

// Razorpay only accepts an integer number of paise. `rupees * 100` on a value
// like 1178.82 yields 117881.99999999999 in floating point, which the API
// rejects outright — so every amount goes through here.
const toPaise = (amountInRupees) => Math.round(parseFloat(amountInRupees) * 100);

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const generatePaymentLink = async (amountInRupees, referenceId, description, callbackUrl = null) => {
  if (!razorpay) {
    console.log(`[MOCK RAZORPAY] Generated payment link for ₹${amountInRupees} (Ref: ${referenceId})`);
    return {
      id: `plink_mock_${Date.now()}`,
      short_url: callbackUrl ? `${callbackUrl}?mock_payment=success` : `https://rzp.io/i/mock_${Date.now()}`
    };
  }

  try {
    const payload = {
      amount: toPaise(amountInRupees), // in paise
      currency: "INR",
      reference_id: referenceId,
      description: description,
      customer: {
        name: "LuxeStore Customer",
        email: "customer@luxestore.com",
        contact: "9999999999"
      },
      notify: { sms: false, email: false },
      reminder_enable: true,
    };
    
    if (callbackUrl) {
      payload.callback_url = callbackUrl;
      payload.callback_method = "get";
    }

    const paymentLink = await razorpay.paymentLink.create(payload);
    return paymentLink;
  } catch (error) {
    console.error("Razorpay Error:", error);
    throw error;
  }
};

const createOrder = async (amountInRupees, receiptId) => {
  if (!razorpay) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: toPaise(amountInRupees),
      currency: "INR",
      receipt: receiptId
    };
  }
  try {
    const options = {
      amount: toPaise(amountInRupees),
      currency: "INR",
      receipt: receiptId,
    };
    return await razorpay.orders.create(options);
  } catch (error) {
    console.error("Razorpay Error:", error);
    throw error;
  }
};

module.exports = {
  generatePaymentLink,
  createOrder,
};
