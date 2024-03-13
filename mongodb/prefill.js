const mongoose = require('mongoose');
const { BSON } = require('mongodb');
const clinic = require('./schemas');

const p = [
  'ab71d2e0-a475-41d9-b68f-d7999d4250f2',
  'e2a4c459-8090-4a48-843b-a8f8fb33a528',
  '8a39e25b-f5e1-4b72-8d25-8b6ac49b9797'
];
const d = [
  '687eb7e8-31eb-4250-b5b2-14e68bf31157',
  '03beef17-8673-40a8-90b2-60101fedaacc'
];

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/clinic');
  mongoose.connection.on('open', () => console.log('connected to mongodb server'));
  await addPatients();
  await addDoctors();
  await addVisitRecords();
  await mongoose.disconnect();
}

async function addPatients(){
  const patient1 = new clinic.Patients({
    patientId: new BSON.UUID(p[0]),
    phone: '+79265788514',
    name: 'Вася'
  });

  const patient2 = new clinic.Patients({
    patientId: new BSON.UUID(p[1]),
    phone: '+79102345678',
    name: 'Коля'
  });

  const patient3 = new clinic.Patients({
    patientId: new BSON.UUID(p[2]),
    phone: '+79051492874',
    name: 'Илья'
  });

  await patient1.save();
  await patient2.save();
  await patient3.save();
}

async function addDoctors() {
  const doctor1 = new clinic.Doctors({
    doctorId: new BSON.UUID(d[0]),
    name: 'Володя',
    spec: 'Терапевт',
    timeSlots: addTimeSlots(10)
  });

  const doctor2 = new clinic.Doctors({
    doctorId: new BSON.UUID(d[1]),
    name: 'Настя',
    spec: 'Офтальмолог',
    timeSlots: addTimeSlots(15)
  });
  await doctor1.save();
  await doctor2.save();
}

async function addVisitRecords() {
  var date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 30, 0, 0);
  const visit1 = new clinic.VisitRecords({
    patientId: new BSON.UUID(p[0]),
    doctorId: new BSON.UUID(d[1]),
    visitDate: date
  });
  date.setHours(9, 15, 0, 0);
  const visit2 = new clinic.VisitRecords({
    patientId: new BSON.UUID(p[1]),
    doctorId: new BSON.UUID(d[0]),
    visitDate: date
  });

  await visit1.save();
  await visit2.save();
}

function addTimeSlots(interval) {
  var slots = [];
  var startDate = new Date();
  for (let i = 1; i <= 3; i++) {
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(8, 0, 0, 0);
    while (startDate.getHours() < 13) {
      slots.push(startDate);
      startDate.setMinutes(startDate.getMinutes() + interval);
    }
  }
  return slots;
}
