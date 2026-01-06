import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server started on http://${process.env.SERVER_IP || 'localhost'}:${PORT}`);
  console.log(`💳 Payment API: POST http://${process.env.SERVER_IP || 'localhost'}:${PORT}/api/payments/create`);
  console.log(`🔔 Webhook: POST http://${process.env.SERVER_IP || 'localhost'}:${PORT}/api/webhooks/finik`);
});

