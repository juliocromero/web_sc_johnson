var cron = require("node-cron");
const Fecha = use("App/Models/Fecha");
var moment = require('moment');
const Database = use('Database');
const Product = use("App/Models/Product");
const ProductSV1 = use("App/Models/SV1/ProductSV1");


cron.schedule("*/10 * * * * *", async function (){

    // BORRANDO registros que se borraron del postgres y no fueron borrados en algun server.
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
    
    console.log(await ProductSV1.all());

   // Sincronización de datos.
    try{
        //Determina Fecha mas reciente en postgres
        var fechaMaxUpdatedPg = await Database.from('products').max('updated_at');
        var fechaMaxCreatedPg = await Database.from('products').max('created_at');
        var fechaMaxPg;

        if (fechaMaxUpdatedPg > fechaMaxCreatedPg) {
            fechaMaxPg = fechaMaxUpdatedPg;
        }
        else
        {
            fechaMaxPg = fechaMaxCreatedPg;
        }

        //Verifico y actualizo server1
        try {
            //Determino fecha max SV1
            var fechaMaxUpdatedSV1 = await Database.connection('Server1').from('baprueba').max('updated_at');
            var fechaMaxCreatedSV1 = await Database.connection('Server1').from('baprueba').max('created_at');
            var fechaMaxSV1;

            if (fechaMaxUpdatedSV1 > fechaMaxCreatedSV1) {
                fechaMaxSV1 = fechaMaxUpdatedSV1;
            }
            else
            {
                fechaMaxSV1 = fechaMaxCreatedSV1;
            }

            if (fechaMaxPg > fechaMaxSV1) {
                /*var datosAux = await Database.from('products')
                                            .where('created_at', '>=', fechaMaxSV1)
                                            .orWhere('updated_at', '>=', fechaMaxSV1);

                var result = await Database.connection('Server1').from('baprueba')
                */
            }

        } catch (error) {
            console.log('ERROR SYNC SV1: ' + error)
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