var cron = require("node-cron");
const Fecha = use("App/Models/Fecha");
var moment = require('moment');


cron.schedule("*/10 * * * * *", async function (){


    //console.log('servidor ejecutandose cada 10 seg' , moment().format('HH:mm:ss'))
})
