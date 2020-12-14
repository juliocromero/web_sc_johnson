var cron = require("node-cron");
const Fecha = use("App/Models/Fecha");
const Product = use("App/Models/Product");
var moment = require('moment');
const Database = use('Database');


cron.schedule("*/10 * * * * *", async function (){


   
    try{
        let fechaWeb = await Database.from('products').max('updated_at')
        //fechaWeb = fechaWeb.toJSON()
        //console.log(fechaWeb)
        try {
            const server1 = await Database.connection('historicos').from('baprueba').max('updated_at')
        } catch (error) {
            
        }
        
    }catch(error){
        console.log(error)
    }
   
    //console.log(server1)
   // let sync = await Database.table('fecha').insert({ fecha_ser_web : `${fechas.fecha}`})

    //console.log('servidor ejecutandose cada 10 seg' , moment().format('HH:mm:ss'))
})

cron.schedule("*/15 * * * * *", async function (){

  

    //console.log('servidor ejecutandose cada 15 seg' , moment().format('HH:mm:ss'))
})