const express = require('express');
const bodyParser = require('body-parser');
const EventEmitter = require('events');
const Biometrics = require('./service/biometrics');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Event emitter for Server-Sent Events
const events = new EventEmitter();
events.setMaxListeners(0);

// Routes
app.get("/", function(req, res) {
    res.status(200).json({ error: '200', fault: 'Fingerprint API Service', status: 'Healthy. Running.'})
});

app.post('/api/fingers', async (req, res) => {
  const { accountNumber, kioskStationID } = req.body;
  try { 
    const request = await Biometrics.initiate(accountNumber, kioskStationID); 
    // Emit event to kiosk 
    events.emit('initiated', request); 
    res.status(200).json({ message: 'Fingerprint request initiated', request });
  } catch (error) { console.error('Error initiating request:', error); 
    res.status(500).json({ message: 'Error initiating request' }); }
});

app.post('/api/fingers/:id/verify', async (req, res) => {
  const { id, deviceId, fingerprintTemplate } = req.body;
  try { 
    res.status(200).json({ message: 'Processing', request }); 
    const request = await Biometrics.verify(id, deviceId, fingerprintTemplate);
    events.emit('verified', request);
   } catch (error) { 
    console.error('Error updating status:', error); 
    res.status(500).json({ message: 'Error updating status' });
   }
});

app.get('/api/requests/:kioskStationID', async (req, res) => {
  const { kioskStationID } = req.params;
  try { 
    const requests = await Biometrics.getRequests(kioskStationID); 
    res.status(200).json(requests); 
   } catch (error) { 
    console.error('Error fetching requests:', error); 
    res.status(500).json({ message: 'Error fetching requests' }); 
  }
});

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const onInitiated = (request) => {
    res.write(`event: initiate\n`);
    res.write(`data: ${JSON.stringify(request)}\n\n`);
  };

  const onVerified = (request) => {
    res.write(`event: verified\n`);
    res.write(`data: ${JSON.stringify(request)}\n\n`);
  };

  events.on('initiated', onInitiated);
  events.on('verified', onVerified);

  req.on('close', () => {
    events.removeListener('initiated', onInitiated);
    events.removeListener('verified', onVerified);
  });
});

app.listen(port, () => {
  console.log(`Fingerprint Validation Service listening at http://localhost:${port}`);
});
