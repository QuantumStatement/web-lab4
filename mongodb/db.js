const mongoose = require('mongoose');
const { BSON } = require('mongodb');
const clinic = require('./schemas');

// functions
module.exports.dbConnect = async function dbConnect() {
  var isConn = false;
  await mongoose.connect('mongodb://localhost:27017/clinic');
  if (mongoose.connection.readyState == 1) {
    console.log('connected to database')
    isConn = true;
  } else {
    console.error;
  }
  return isConn;
}

module.exports.addRecord = async function addRecord(patient_id, doctor_id, visit_date) {
  var answer = {
    success: false,
    text: '',
    doctorName: '',
    doctorSpec: ''
  };
  const patientUuid = new BSON.UUID(patient_id);
  const doctorUuid = new BSON.UUID(doctor_id);
  const patient = await clinic.Patients.findOne({patientId: patientUuid});
  if (patient == undefined) {
    answer.text = 'Пациент не найден';
    return answer;
  }
  const doctor = await clinic.Doctors.findOne({doctorId: doctorUuid})
  if (doctor == undefined) {
    answer.text = 'Врач не найден';
    return answer;
  }
  var isSlotFound = false;
  for (const time of doctor.timeSlots) {
    if (+time == +visit_date) {
      isSlotFound = true;
      break;
    }
  }
  if (!isSlotFound) {
    answer.text = 'У врача такой временной слот отсутствует';
    return answer;
  }
  const visit = await clinic.VisitRecords.findOne({doctorId: doctorUuid, visitDate: visit_date});
  console.log(visit);
  if (visit != undefined) {
    answer.text = 'Указанный временной слот врача уже занят';
    return answer;
  }
  const newVisit = new clinic.VisitRecords({
    patientId: patientUuid,
    doctorId: doctorUuid,
    visitDate: visit_date
  });
  await newVisit.save();
  answer.doctorName = doctor.name;
  answer.doctorSpec = doctor.spec;
  answer.success = true;
  return answer;
}
