require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socket = require('./socket');
const tracker = require('./adb/tracker');
const devicesRouter = require('./routes/devices');

const app = express();
const server = http.createServer(app);

const io = socket.init(server);

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/devices', devicesRouter);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  tracker.start();
});
