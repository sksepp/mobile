const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { appointments, doctors, queue } = require('../data/store');

// GET all appointments (optionally filter by patientId)
router.get('/', (req, res) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(appointments.filter(a => a.patientId === patientId));
  }
  res.json(appointments);
});

// GET single appointment
router.get('/:id', (req, res) => {
  const appt = appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  res.json(appt);
});

// POST create appointment
router.post('/', (req, res) => {
  const { patientId, patientName, doctorId, date, time, reason } = req.body;
  if (!patientId || !patientName || !doctorId || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  const appointment = {
    id: uuidv4(),
    patientId,
    patientName,
    doctorId,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date,
    time,
    reason: reason || '',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  appointments.push(appointment);

  // Auto-add to queue if appointment is today
  const today = new Date().toISOString().split('T')[0];
  if (date === today) {
    const queueEntry = {
      id: uuidv4(),
      appointmentId: appointment.id,
      patientId,
      patientName,
      doctorId,
      doctorName: doctor.name,
      position: queue.filter(q => q.doctorId === doctorId && q.status === 'waiting').length + 1,
      status: 'waiting',
      checkInTime: null,
      estimatedWait: null,
    };
    queue.push(queueEntry);
    appointment.queueId = queueEntry.id;
  }

  res.status(201).json(appointment);
});

// PATCH update appointment status
router.patch('/:id', (req, res) => {
  const appt = appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  const { status } = req.body;
  if (status) appt.status = status;
  res.json(appt);
});

// DELETE cancel appointment
router.delete('/:id', (req, res) => {
  const idx = appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Appointment not found' });
  appointments[idx].status = 'cancelled';
  res.json({ message: 'Appointment cancelled', appointment: appointments[idx] });
});

module.exports = router;
