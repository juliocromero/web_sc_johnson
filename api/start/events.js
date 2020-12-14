var cron = require("node-cron");
const Fecha = use("App/Models/Fecha");
var moment = require('moment');
const Database = use('Database');
const Product = use("App/Models/Product");


cron.schedule("*/10 * * * * *", async function (){

    try {
        //Traigo codigos en BD Postgres
        var codigosPG = await Database.select('cod_pt').from('products');
        var codigosPGaux = [], codigosSV1aux= [], codigosSV2aux = [];
        for (let i = 0; i < codigosPG.length; i++) {
            codigosPGaux.push(codigosPG[i].cod_pt) ;
        }

        
        //Verifico y borro códigos del server1 que ya no están en PG
        try {
            var codigosSV1 = await Database.connection('Server1')
                .select('cod_pt')
                .from('baprueba')
                .whereNotIn('cod_pt', codigosPGaux);

            console.log(codigosSV1)
            for (let i = 0; i < codigosSV1.length; i++) {
                codigosSV1aux.push(codigosSV1[i].cod_pt) ;
            }
            
            if (codigosSV1aux.length > 0) {
                const affectedRows = await Database.connection('Server1')
                                                    .table('baprueba')
                                                    .whereIn('cod_pt', codigosSV1aux)
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
                .whereNotIn('cod_pt', codigosPGaux);

            for (let i = 0; i < codigosSV2.length; i++) {
                codigosSV2aux[i] = codigosSV2[i].cod_pt;
            }
            
            if (codigosSV2aux.length > 0) {
                const affectedRows = await Database.connection('Server2')
                                                    .table('baprueba')
                                                    .whereIn('cod_pt', codigosSV2aux)
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