const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Manual dotenv loading
const envPath = path.join(__dirname, 'server', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
      process.env[parts[0].trim()] = parts[1].trim();
    }
  });
}

const testWebhook = async () => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  
  if (!secret) {
      console.error('❌ Error: RAZORPAY_WEBHOOK_SECRET or RAZORPAY_KEY_SECRET not found in .env');
      return;
  }

  const url = 'http://localhost:5001/api/payments/webhooks/razorpay';

  const payload = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_' + Date.now(),
          amount: 49900,
          currency: 'INR',
          order_id: 'order_test_' + Date.now(),
          notes: {
            userId: '60d5ecb8b392d60015f86439',
            plan: 'pro'
          }
        }
      }
    }
  };

  const body = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'x-razorpay-signature': signature,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Webhook test successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Webhook test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testWebhook();
