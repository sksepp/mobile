const express = require('express');
const router = express.Router();
const { doctors } = require('../data/store');

// GET all doctors
router.get('/', (req, res) => {
  const { specialty } = req.query;
  if (specialty) {
    return res.json(doctors.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase())));
  }
  res.json(doctors);
});

// GET single doctor
router.get('/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

module.exports = router;
