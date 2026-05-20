const express = require('express');
const cors = require('cors');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 5000;
const VERSION = process.env.VERSION || 'blue';

app.use(cors());

// Prometheus Metrics Setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed by devops-proj',
  labelNames: ['method', 'handler', 'status']
});
register.registerMetric(httpRequestsTotal);

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds for devops-proj',
  labelNames: ['method', 'handler', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});
register.registerMetric(httpRequestDuration);

// Metrics Middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    const status = res.statusCode.toString();
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal.inc({ method: req.method, handler: route, status: status });
    httpRequestDuration.observe({ method: req.method, handler: route, status: status }, durationInSeconds);
  });
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  return res.status(500).json({ status: 'error', version: VERSION });
});

app.get('/api/version', (req, res) => {
  return res.json({ version: VERSION });
});

// Metrics endpoint for Prometheus scraper
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`devops-proj backend running on port ${PORT} with version ${VERSION}`);
});
