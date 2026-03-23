// In-memory store (replace with a real DB in production)
const doctors = [
  { id: 'd1', name: 'Dr. Sarah Johnson', specialty: 'General Physician', available: true },
  { id: 'd2', name: 'Dr. Michael Lee', specialty: 'Cardiologist', available: true },
  { id: 'd3', name: 'Dr. Amina Patel', specialty: 'Pediatrician', available: true },
  { id: 'd4', name: 'Dr. Carlos Rivera', specialty: 'Orthopedic', available: false },
];

const appointments = [];
const queue = [];

module.exports = { doctors, appointments, queue };
