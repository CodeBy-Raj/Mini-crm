const express = require('express');
const app = express();

app.use(express.json());

const PORT = process.env.CHANNEL_PORT || 3001;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/delivery';

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'communication-channel-simulator' });
});

// Target Send Endpoint
app.post('/send', (req, res) => {
  const { communicationId, message } = req.body;

  if (!communicationId) {
    console.error(`[Channel Service] [${new Date().toISOString()}] Error: Missing communicationId in payload.`);
    return res.status(400).json({ error: 'Missing required communicationId' });
  }

  console.log(`[Channel Service] [${new Date().toISOString()}] Received transmission request for Communication ID: ${communicationId}`);

  // Immediate reply to keep execution non-blocking
  res.status(202).json({
    success: true,
    message: 'Message received. Simulated delivery starting...',
    communicationId,
  });

  // Execute processing asynchronously in background thread
  (async () => {
    try {
      // Wait 2 seconds as required by specification
      console.log(`[Channel Service] [${new Date().toISOString()}] Simulating channel delivery latency for ${communicationId} (2 seconds delay)`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Calculate outcome mapping: 85% success rate, 15% failed
      const roll = Math.random();
      const status = roll < 0.85 ? 'DELIVERED' : 'FAILED';

      console.log(`[Channel Service] [${new Date().toISOString()}] simulated delivery outcome for ${communicationId} is: ${status} (probability marker: ${roll.toFixed(3)})`);

      // Invoke the delivery Webhook
      await callWebhook({ communicationId, status });
    } catch (err) {
      console.error(`[Channel Service] [${new Date().toISOString()}] Fatal exception during async simulation pipeline for ${communicationId}:`, err.message);
    }
  })();
});

// Helper client to deliver Webhook payload with 3-attempt exponential retry support
async function callWebhook(payload, attempts = 1) {
  const maxAttempts = 3;

  try {
    console.log(`[Channel Service] [${new Date().toISOString()}] Webhook Dispatch Attempt ${attempts}/${maxAttempts}: Transmitting status update for ${payload.communicationId} to ${WEBHOOK_URL}`);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP Endpoint replied with error status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Channel Service] [${new Date().toISOString()}] Webhook Deliver SUCCESS: Acknowledged by CRM server for ${payload.communicationId}`);
  } catch (error) {
    console.error(`[Channel Service] [${new Date().toISOString()}] Webhook Deliver FAILED on Attempt ${attempts}/${maxAttempts} for ${payload.communicationId}: ${error.message}`);

    if (attempts < maxAttempts) {
      const waitMs = Math.pow(2, attempts) * 1000;
      console.log(`[Channel Service] [${new Date().toISOString()}] Waiting ${waitMs}ms before Webhook retry Attempt ${attempts + 1}...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return callWebhook(payload, attempts + 1);
    } else {
      console.error(`[Channel Service] [${new Date().toISOString()}] Webhook CRITICAL: Exhausted all ${maxAttempts} automated retries for Communication: ${payload.communicationId}`);
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Channel Service] Simulator initiated: listening on port ${PORT}`);
  console.log(`[Channel Service] Target webhook bound connection: ${WEBHOOK_URL}`);
});
