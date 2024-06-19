const logger = require('koa-logger');
const views = require('@ladjs/koa-views');
const path = require('path');
const Koa = require('koa');
const router = require('@koa/router')();
const static = require('koa-static');
const { koaBody } = require('koa-body');
const db = require('./mongodb/db');

const title = 'Запись на прием к врачу';
const render = views(path.join(__dirname, '/views'), { extension: 'pug' });
const app = new Koa();

var isConnected = false;

app.use(async(ctx, next) => {
  try {
    await next();
    if (!isConnected) {
      ctx.throw(503);
    }
    const status = ctx.status || 404;
    if (status == 404) {
        ctx.throw(404);
    }
  } catch (err) {
    var text = '';
    ctx.status = err.status || 500;
    if (ctx.status === 404) {
      text = 'Not found';
    }
    else {
      text = 'Server error';
    }
    await ctx.render('error.pug', { errorCode : ctx.status, errorText : text });
  }
});

app.use(logger());
app.use(render);
app.use(koaBody());
app.use(static(path.join(__dirname, '/css')));

// routing
router.get('/', index).
  get('/index.html', index).
  get('/appointment.html', appointment).
  post('/appointment-end.html', appointment_end);
app.use(router.routes());

// page rendering
async function index(ctx) {
  return await ctx.render('index.pug', { title : title });
};

async function appointment(ctx) {
  return await ctx.render('appointment.pug', { title : title });
};

async function appointment_end(ctx) {
  const body = ctx.request.body;
  const result = await db.addRecord(body.patient, body.doctor, parseDate(body.date, body.time));
  return await ctx.render('appointment-end.pug', { title: title, data: result, date: body.date, time: body.time });
};

function parseDate(date, time) {
  var day = date.substring(0, 2);
  var month = date.substring(3, 5);
  var year = date.substring(6, 10);
  var fullDate = year + '-' + month + '-' + day + 'T' + time + ':00.000+03:00';
  return new Date(fullDate);
}

async function notification(minutes) {
  interval = minutes * 60 * 1000;
  isConnected = await db.dbConnect();
  if (!isConnected) {
    console.log('No database connection');
    process.exit(-1);
  }
  console.log('connected to database');
  (async function p() {
    if (isConnected) {
      const now = new Date();
      let start = new Date(now);
      start.setHours(start.getHours() + 2);
      let end = new Date(start);
      start.setMinutes(start.getMinutes() - minutes);
      for (const record of await db.findTimedRecords(start, end)) {
        console.log('%s | Привет, %s! Вам через 2 часа к %s в %s:%s!', 
          now, record.patientName, record.doctorSpec, record.time.getHours(), record.time.getMinutes());
      }
      start.setHours(start.getHours() + 22);
      end.setHours(end.getHours() + 22);
      for (const record of await db.findTimedRecords(start, end)) {
        console.log('%s | Привет, %s! Напоминаем, что вы записаны к %s завтра в %s:%s!', 
          now, record.patientName, record.doctorSpec, record.time.getHours(), record.time.getMinutes());
      }
    }
    setTimeout(p, interval);
  })();
}

// listen
app.listen(3000);
console.log('listening on port 3000');
notification(1);
