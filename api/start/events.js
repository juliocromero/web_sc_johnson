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
// const dropOldData = async (connection, lastQuery)=> {
//     try {
//         console.log('Deleting old data...');
//         return await connection
//         .table('producto_lote')
//         .whereBetween( 'date', [ moment(lastQuery).add(-10, 'days').format('YYYY-MM-DD HH:mm:ss'), moment(lastQuery).format('YYYY-MM-DD HH:mm:ss') ])
//         .delete();        
//     } catch (error) {
//         console.log('DELETING OLD DATA ERROR ==>', error)
//     }
// };

const parseData = async (arr)=> {
    try {
        const result = arr.map((item)=>{
            try {
                return {
                    sun_number : item.sun_number,
                    lote: item.lote,
                    batch_id: item.batch_id,
                    fecha_hora:moment(item.date).utc().format()
                }           
            } catch (error) {
            //continue;
            }
        });
        const data = await Promise.all(result);
        return data;        
    } catch (error) {
        console.log('PARSEDATA ERROR ==>', error);
    }
};

// cron.schedule("*/10 * * * * *", async function () {
//     try {
//       let now = moment().format('YYYY-MM-DD HH:mm:ss');
//       let lastQuery = await Until.findOrCreate( { id: 1 }, { until_date: now });
//       let lastQueryDate = moment(lastQuery.toJSON().until_date).format('YYYY-MM-DD HH:mm:ss');
//       await Until.query().where('id', 1 ).update({ until_date: now });
//       const server1 = Database.connection('Server1');
//       const server2 = Database.connection('Server2');

//       console.log('LAST QUERY:', lastQueryDate);
//       console.log('NOW:', now);

//       const res_server_1 = await server1
//       .table('producto_lote')
//       .select('*')
//       .whereBetween( 'date', [ moment(lastQueryDate).format('YYYY-MM-DD HH:mm:ss'), moment(now).format('YYYY-MM-DD HH:mm:ss') ]);
//       //console.log('res_1:', res_server_1);
    
//       const res_server_2 = await server2
//       .table('producto_lote')
//       .select('*')
//       .whereBetween( 'date', [ moment(lastQueryDate).format('YYYY-MM-DD HH:mm:ss'), moment(now).format('YYYY-MM-DD HH:mm:ss') ]);
//       //console.log('res_2:', res_server_2);

//       if(res_server_1.length > 0) {
//         parseData(res_server_1).then( async (dataS1)=>{
//             //console.log('dataS1:', dataS1);
//             const queryS1 = await ProductoLote.query().insert( dataS1 );
//             //console.log('queryStatusS1:', queryS1);
//             //dropOldData(server1, lastQueryDate)              
//         }).catch((error)=>{String(error).includes('duplicate') ? console.log('No es posible agregar datos duplicados') : 'somthing was wrong'});
//       };

//       if(res_server_2.length > 0) {
//         parseData(res_server_2).then( async (dataS2)=> {
//             //console.log('dataS2:', dataS2);
//             const queryS2 = await ProductoLote.query().insert( dataS2 );
//             //console.log('queryStatusS2:', queryS2);
//             //dropOldData(server2, lastQueryDate)              
//         }).catch((error)=>{String(error).includes('duplicate') ? console.log('No es posible agregar datos duplicados') : 'somthing was wrong'});
//       };

//     } catch (error) {
//         console.log('ERROR CONSULTANDO SUNS: ', error);
//     }

// });