var cron = require("node-cron");
const Fecha = use("App/Models/Fecha");
var moment = require('moment');
const Database = use('Database');
const Product = use("App/Models/Product");


cron.schedule("*/10 * * * * *", async function (){

    try {
        //Traigo codigos en BD Postgres
        var codigosPG = await Database.select('cod_pt').from('baprueba');
        var codigosPGaux, codigosSV1aux, codigosSV2aux = [];

        for (let i = 0; i < codigosPG.length; i++) {
            codigosPGaux[i] = codigosPG[i].cod_pt;
        }


        //Verifico y borro códigos del server1 que ya no están en PG
        try {
            var codigosSV1 = await Database.connection('Server1')
                .select('cod_pt')
                .from('baprueba')
                .whereNotIn('cod_pt', codigosPGaux);


            for (let i = 0; i < codigosSV1.length; i++) {
                codigosSV1aux[i] = codigosSV1aux[i].cod_pt;
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
                .whereNotIn('cod_pt', codigosPG);

            for (let i = 0; i < codigosSV2.length; i++) {
                codigosSV2aux[i] = codigosSV2aux[i].cod_pt;
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
    


    //console.log('servidor ejecutandose cada 10 seg' , moment().format('HH:mm:ss'))
})
