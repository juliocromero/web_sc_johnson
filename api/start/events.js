var cron = require("node-cron");
const Fecha = use("App/Models/Fecha");
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
    


    //console.log('servidor ejecutandose cada 10 seg' , moment().format('HH:mm:ss'))
})
