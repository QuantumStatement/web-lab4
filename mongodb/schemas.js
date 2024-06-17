const mongoose = require('mongoose');

// patient schema
const patientSchema = mongoose.Schema({
  patientId: mongoose.Schema.Types.UUID,
  phone: String,
  name: String
});

// doctor schema
const doctorSchema = mongoose.Schema({
  doctorId: mongoose.Schema.Types.UUID,
  name: String,
  spec: String,
  timeSlots: [Date]
});

// visiting record schema
const visitRecordSchema = mongoose.Schema({
  patientId: mongoose.Schema.Types.UUID,
  doctorId: mongoose.Schema.Types.UUID,
  visitDate: Date
});

module.exports.Patients = mongoose.model('patients', patientSchema);
module.exports.Doctors = mongoose.model('doctors', doctorSchema);
module.exports.VisitRecords = mongoose.model('visitrecords', visitRecordSchema);