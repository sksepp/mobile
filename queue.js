const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { queue, doctors } = require('../data/store');

const MINUTES_PER_PATIENT = 15;

function recalcPositions(doctorId) {
  const waiting = queue.filter(q => q.doctorId === doctorId && q.status === 'waiting');
  waiting.forEach((entry, idx) => {
    entry.position = idx + 1;
    entry.estimatedWait = idx * MINUTES_PER_PATIENT;
  });
}

// GET queue for a doctor
router.get('/doctor/:doctorId', (req, res) => {
  const entries = queue.filter(q => q.doctorId === req.params.doctorId && q.status === 'waiting');
  res.json(entries.sort((a, b) => a.position - b.position));
});

// GET queue position for a patient
router.get('/patient/:patientId', (req, res) => {
  const entry = queue.find(q => q.patientId === req.params.patientId && q.status === 'waiting');
  if (!entry) return res.status(404).json({ error: 'Not in queue' });
  res.json(entry);
});

// POST walk-in / manual queue entry
router.post('/', (req, res) => {
  const { patientId, patientName, doctorId } = req.body;
  if (!patientId || !patientName || !doctorId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  const waitingCount = queue.filter(q => q.doctorId === doctorId && q.status === 'waiting').length;
  const entry = {
    id: uuidv4(),
    appointmentId: null,
    patientId,
    patientName,
    doctorId,
    doctorName: doctor.name,
    position: waitingCount + 1,
    status: 'waiting',
    checkInTime: new Date().toISOString(),
    estimatedWait: waitingCount * MINUTES_PER_PATIENT,
  };
  queue.push(entry);
  res.status(201).json(entry);
});

// PATCH check-in
router.patch('/:id/checkin', (req, res) => {
  const entry = queue.find(q => q.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Queue entry not found' });
  entry.checkInTime = new Date().toISOString();
  entry.status = 'checked-in';
  res.json(entry);
});

// PATCH mark as called / in-progress
router.patch('/:id/call', (req, res) => {
  const entry = queue.find(q => q.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Queue entry not found' });
  entry.status = 'in-progress';
  recalcPositions(entry.doctorId);
  res.json(entry);
});

// PATCH mark as done
router.patch('/:id/done', (req, res) => {
  const entry = queue.find(q => q.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Queue entry not found' });
  entry.status = 'done';
  recalcPositions(entry.doctorId);
  res.json(entry);
});

// GET full queue summary per doctor
router.get('/summary', (req, res) => {
  const summary = doctors.map(doc => ({
    doctorId: doc.id,
    doctorName: doc.name,
    specialty: doc.specialty,
    waiting: queue.filter(q => q.doctorId === doc.id && q.status === 'waiting').length,
    inProgress: queue.filter(q => q.doctorId === doc.id && q.status === 'in-progress').length,
  }));
  res.json(summary);
});

module.exports = router;
