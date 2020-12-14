var cron = require("node-cron");
const Fecha = use("App/Models/Fecha");
const Product = use("App/Models/Product");
var moment = require('moment');
const Database = use('Database');
const Product = use("App/Models/Product");


cron.schedule("*/10 * * * * *", async function (){

    try {
        //Traigo codigos en BD Postgres
        var codigosPG = await Database.select('cod_pt').from('baprueba');

        //Verifico y borro códigos del server1 que ya no están en PG
        try {
            var codigosSV1 = await Database.connection('Server1')
                .select('cod_pt')
                .from('baprueba')
                .whereNotIn('cod_pt', codigosPG);

            if (codigosSV1.length > 0) {
                const affectedRows = await Database.connection('Server1')
                                                    .table('baprueba')
                                                    .whereIn('cod_pt', codigosSV1)
                                                    .delete();
            }
        } catch (error) {
            console.log('ERROR BORRANDO SERVER1: ' + error);
        }

        //Verifico y borro códigos del server2 que ya no están en PG
        try {
            var codigosSV2 = await Database.connection('Server2')
                .select('cod_pt')
                .from('baprueba')
                .whereNotIn('cod_pt', codigosPG);

            if (codigosSV2.length > 0) {
                const affectedRows = await Database.connection('Server2')
                                                    .table('baprueba')
                                                    .whereIn('cod_pt', codigosSV2)
                                                    .delete();
            }
        } catch (error) {
            console.log('ERROR BORRANDO SERVER2: ' + error);
        }
    } catch (error) {
        console.log('ERROR BORRANDO CODIGOS: ' + error);
    }
    


   
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