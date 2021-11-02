var cron = require("node-cron");
const Fecha = use("App/Models/Fecha");
const Until = use("App/Models/SunsLastQuery");
const ProductoLote = use("App/Models/ProductoLote");
var moment = require('moment');
const Database = use('Database');
const Product = use("App/Models/Product");


// cron.schedule("*/10 * * * * *", async function (){

//     // BORRANDO registros que se borraron del postgres y no fueron borrados en algun server.
//     try {
//         //Traigo codigos en BD Postgres
//         var codigosPG = await Database.select('cod_pt').from('bp_setpoints');
//         var codigosPGaux = [], codigosSV1aux= [], codigosSV2aux = [];

//         for (let i = 0; i < codigosPG.length; i++) {
//             codigosPGaux.push(codigosPG[i].cod_pt) ;
//         }

        
//         //Verifico y borro códigos del server1 que ya no están en PG
//         try {
//             var codigosSV1 = await Database.connection('Server1')
//                 .select('cod_pt')
//                 .from('bp_setpoints')
//                 .whereNotIn('cod_pt', codigosPGaux);

//             for (let i = 0; i < codigosSV1.length; i++) {
//                 codigosSV1aux.push(codigosSV1[i].cod_pt) ;
//             }
            
//             if (codigosSV1aux.length > 0) {
//                 const affectedRows = await Database
//                 .connection('Server1')
//                 .table('bp_setpoints')
//                 .whereIn('cod_pt', codigosSV1aux)
//                 .delete();
                                                  
//             }
//         } catch (error) {
//             console.log('ERROR BORRANDO SERVER1: ' + error);
//         }

//         //Verifico y borro códigos del server2 que ya no están en PG
//         try {
            
//             var codigosSV2 = await Database
//                 .connection('Server2')
//                 .select('cod_pt')
//                 .from('bp_setpoints')
//                 .whereNotIn('cod_pt', codigosPGaux);

//             for (let i = 0; i < codigosSV2.length; i++) {
//                 codigosSV2aux[i] = codigosSV2[i].cod_pt;
//             }
            
//             if (codigosSV2aux.length > 0) {
//                 const affectedRows = await Database
//                 .connection('Server2')
//                 .table('bp_setpoints')
//                 .whereIn('cod_pt', codigosSV2aux)
//                 .delete();
//             }

//         } catch (error) {
//             console.log('ERROR BORRANDO SERVER2: ' + error);
//         }
//     } catch (error) {
//         console.log('ERROR BORRANDO CODIGOS: ' + error);
//     }

//    // Sincronización de datos.
//     try{
//         //Determina Fecha mas reciente en postgres
//         var fechaMaxUpdatedPg = await Database.from('bp_setpoints').max('updated_at');
//         var fechaMaxCreatedPg = await Database.from('bp_setpoints').max('created_at');
//         var fechaMaxPg;

//         if (fechaMaxUpdatedPg > fechaMaxCreatedPg) {
//             fechaMaxPg = fechaMaxUpdatedPg;
//         }
//         else
//         {
//             fechaMaxPg = fechaMaxCreatedPg;
//         }

//         //Verifico y actualizó server1
//         try {
//             //Determino fecha max SV1
//             var fechaMaxUpdatedSV1 = await Database.connection('Server1').from('bp_setpoints').max('updated_at');
//             var fechaMaxCreatedSV1 = await Database.connection('Server1').from('bp_setpoints').max('created_at');
//             var fechaMaxSV1;

//             if (fechaMaxUpdatedSV1 > fechaMaxCreatedSV1) {
//                 fechaMaxSV1 = fechaMaxUpdatedSV1;
//             }
//             else
//             {
//                 fechaMaxSV1 = fechaMaxCreatedSV1;
//             }
//                 console.log(fechaMaxSV1 , fechaMaxPg)
//             if (fechaMaxPg > fechaMaxSV1) {
//                 var datosAux = await Database
//                     .from('bp_setpoints')
//                     .where('created_at', '>=', fechaMaxSV1)
//                     .orWhere('updated_at', '>=', fechaMaxSV1);

//                 var result = await Database.connection('Server1').from('bp_setpoints').updateOrCreateMany(datosAux);
                
//             }

//         } catch (error) {
//             console.log('ERROR SYNC SV1: ' + error)
//         }

//         //Verifico y actualizó server2
//         try {
//             //Determino fecha max SV2
//             var fechaMaxUpdatedSV2 = await Database.connection('Server2').from('bp_setpoints').max('updated_at');
//             var fechaMaxCreatedSV2 = await Database.connection('Server2').from('bp_setpoints').max('created_at');
//             var fechaMaxSV2;
            
//             if (fechaMaxUpdatedSV2 > fechaMaxCreatedSV2) {
//             fechaMaxSV2 = fechaMaxUpdatedSV2;
//             }
//             else
//             {
//             fechaMaxSV2 = fechaMaxCreatedSV2;
//             }
//             console.log(fechaMaxSV2 , fechaMaxPg)
//             if (fechaMaxPg > fechaMaxSV2) {
//             var datosAux = await Database
//             .from('bp_setpoints')
//             .where('created_at', '>=', fechaMaxSV2)
//             .orWhere('updated_at', '>=', fechaMaxSV2);
            
//             var result = await Database.connection('Server2').from('bp_setpoints').updateOrCreateMany(datosAux);
//             }
            
//             } catch (error) {
//             console.log('ERROR SYNC SV2: ' + error)
//             }
        
//     }catch(error){
//         console.log(error)
//     }
// })

// cron.schedule("*/10 * * * * *", async function (){
//     let now = moment().format('YYYY-MM-DD HH:mm:ss');
//     let lastQuery = await Until.findOrCreate( { id: 1 }, { until_date: now });
//     let lastQueryDate = lastQuery.toJSON().until_date;
//     await Until.query().where('id', 1 ).update({ until_date: now });

//     // updating producto_lote table.
//     try {
//       console.log('lastQueryDate:', lastQueryDate);
//       console.log('now:', now);
//       const res = await Database.connection('Server1')
//       .table('producto_lote')
//       .select('*')
//       //.whereBetween( 'date', [moment(lastQueryDate).utc().format(), moment(now).utc().format()]);
//       console.log('res:', res);

//       if(res.length > 0){
//         const result = res.map((item)=>{
//           try {
//             return {
//               sun_number : item.sun_number,
//               lote: item.lote,
//               batch_id: item.batch_id,
//               fecha_hora:moment(item.date).utc().format()
//             }           
//           } catch (error) {
//             //continue;
//           }
//         });
//         const data = await Promise.all(result);
//         const queryStatus = await ProductoLote.query().insert(data);
//         console.log('data:', data);
//         console.log('queryStatus:', queryStatus);
//         //return response.status(200).json(data);            
//       }

//     } catch (error) {
//         console.log('ERROR CONSULTANDO SUNS: ' + error);
//     }

// });