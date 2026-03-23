const express = require('express');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointments');
const queueRoutes = require('./routes/queue');
const doctorRoutes = require('./routes/doctors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/doctors', doctorRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
