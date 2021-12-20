var cron = require("node-cron");
const Fecha = use("App/Models/Fecha");
const Until = use("App/Models/SunsLastQuery");
var moment = require('moment');
const ProductoLote = use("App/Models/ProductoLote");
const CodesWashingRules = use("App/Models/CodesWashingRules.js");
const GroupWashingRules = use("App/Models/GroupWashingRules.js");
const Database = use('Database');
const Product = use("App/Models/Product");


cron.schedule("*/10 * * * * *", async function (){

    // BORRANDO registros que se borraron del postgres y no fueron borrados en algun server.
    try {
        //Traigo codigos en BD Postgres
        var codigosPG = await Database.select('cod_pt').from('bp_setpoints');
        var codigosPGaux = [], codigosSV1aux= [], codigosSV2aux = [];

        for (let i = 0; i < codigosPG.length; i++) {
            codigosPGaux.push(codigosPG[i].cod_pt) ;
        }

        
        //Verifico y borro códigos del server1 que ya no están en PG
        try {
            var codigosSV1 = await Database.connection('Server1')
                .select('cod_pt')
                .from('bp_setpoints')
                .whereNotIn('cod_pt', codigosPGaux);

            for (let i = 0; i < codigosSV1.length; i++) {
                codigosSV1aux.push(codigosSV1[i].cod_pt) ;
            }
            
            if (codigosSV1aux.length > 0) {
                const affectedRows = await Database
                .connection('Server1')
                .table('bp_setpoints')
                .whereIn('cod_pt', codigosSV1aux)
                .delete();
                                                  
            }
        } catch (error) {
            console.log('ERROR BORRANDO SERVER1: ' + error);
        }

        //Verifico y borro códigos del server2 que ya no están en PG
        try {
            
            var codigosSV2 = await Database
                .connection('Server2')
                .select('cod_pt')
                .from('bp_setpoints')
                .whereNotIn('cod_pt', codigosPGaux);

            for (let i = 0; i < codigosSV2.length; i++) {
                codigosSV2aux[i] = codigosSV2[i].cod_pt;
            }
            
            if (codigosSV2aux.length > 0) {
                const affectedRows = await Database
                .connection('Server2')
                .table('bp_setpoints')
                .whereIn('cod_pt', codigosSV2aux)
                .delete();
            }

        } catch (error) {
            console.log('ERROR BORRANDO SERVER2: ' + error);
        }
    } catch (error) {
        console.log('ERROR BORRANDO CODIGOS: ' + error);
    }

   // Sincronización de datos.
    try{
        //Determina Fecha mas reciente en postgres
        var fechaMaxUpdatedPg = await Database.from('bp_setpoints').max('updated_at');
        var fechaMaxCreatedPg = await Database.from('bp_setpoints').max('created_at');
        var fechaMaxPg;

        if (fechaMaxUpdatedPg > fechaMaxCreatedPg) {
            fechaMaxPg = fechaMaxUpdatedPg;
        }
        else
        {
            fechaMaxPg = fechaMaxCreatedPg;
        }

        //Verifico y actualizó server1
        try {
            //Determino fecha max SV1
            var fechaMaxUpdatedSV1 = await Database.connection('Server1').from('bp_setpoints').max('updated_at');
            var fechaMaxCreatedSV1 = await Database.connection('Server1').from('bp_setpoints').max('created_at');
            var fechaMaxSV1;

            if (fechaMaxUpdatedSV1 > fechaMaxCreatedSV1) {
                fechaMaxSV1 = fechaMaxUpdatedSV1;
            }
            else
            {
                fechaMaxSV1 = fechaMaxCreatedSV1;
            }
                console.log(fechaMaxSV1 , fechaMaxPg)
            if (fechaMaxPg > fechaMaxSV1) {
                var datosAux = await Database
                    .from('bp_setpoints')
                    .where('created_at', '>=', fechaMaxSV1)
                    .orWhere('updated_at', '>=', fechaMaxSV1);

                var result = await Database.connection('Server1').from('bp_setpoints').updateOrCreateMany(datosAux);
                
            }

        } catch (error) {
            console.log('ERROR SYNC SV1: ' + error)
        }

        //Verifico y actualizó server2
        try {
            //Determino fecha max SV2
            var fechaMaxUpdatedSV2 = await Database.connection('Server2').from('bp_setpoints').max('updated_at');
            var fechaMaxCreatedSV2 = await Database.connection('Server2').from('bp_setpoints').max('created_at');
            var fechaMaxSV2;
            
            if (fechaMaxUpdatedSV2 > fechaMaxCreatedSV2) {
            fechaMaxSV2 = fechaMaxUpdatedSV2;
            }
            else
            {
            fechaMaxSV2 = fechaMaxCreatedSV2;
            }
            console.log(fechaMaxSV2 , fechaMaxPg)
            if (fechaMaxPg > fechaMaxSV2) {
            var datosAux = await Database
            .from('bp_setpoints')
            .where('created_at', '>=', fechaMaxSV2)
            .orWhere('updated_at', '>=', fechaMaxSV2);
            
            var result = await Database.connection('Server2').from('bp_setpoints').updateOrCreateMany(datosAux);
            }
            
            } catch (error) {
            console.log('ERROR SYNC SV2: ' + error)
            }
        
    }catch(error){
        console.log(error)
    }
})
const dropOldData = async (connection, lastQuery)=> {
    try {
        console.log('Deleting old data...');
        return await connection
        .table('producto_lote')
        .whereBetween( 'date', [ moment(lastQuery).add(-10, 'days').format('YYYY-MM-DD HH:mm:ss'), moment(lastQuery).format('YYYY-MM-DD HH:mm:ss') ])
        .delete();        
    } catch (error) {
        console.log('DELETING OLD DATA ERROR ==>', error)
    }
};

const parseData = async (arr)=> {
    try {
        const result = arr.map((item)=>{
            try {
                return item ? { sun_number : item.sun_number,lote: item.lote, batch_id: item.batch_id, fecha_hora:moment(item.date).format('YYYY-MM-DD HH:mm:ss') } : null  ;                   
            } catch (error) {
                console.log('PARSE_DATA_1:', error);
            }
        });
        const data = await Promise.all(result);
        return data;        
    } catch (error) {
        console.log('PARSEDATA_ERROR_2 ==>', error);
    }
};
/******* ADQUISICIÖN SUNS *******/
cron.schedule('*/10 * * * *', async function () {
//cron.schedule("*/10 * * * * *", async function (){
    try { 
      synchronizedDataS1 = null;
      let initialDate = moment('2021-01-01 00:00:00').format();
      let now = moment().format("YYYY-MM-DD HH:mm:ss");
      let lastQueryS1 = await Database.table('suns.suns_last_query').select('until_date_s1');
      !lastQueryS1 ? Until.create({until_date_s1:initialDate, until_date_s2:initialDate}) : lastQueryS1;
      let lastQueryS2 = await Database.table('suns.suns_last_query').select('until_date_s2');
      lastQueryS1 = lastQueryS1[0].until_date_s1;
      lastQueryS2 = lastQueryS2[0].until_date_s2;

      const server1 = Database.connection('Server1');
      const server2 = Database.connection('Server2');

      let pg_sun_numbers_1 = await Database.select('sun_number').from('suns.producto_lote');
      pg_sun_numbers_1 = pg_sun_numbers_1.map((sun)=>{
          return sun.sun_number;
      });

      console.log('LAST QUERY lastQueryS1:', moment(lastQueryS1).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));
      console.log('LAST QUERY lastQueryS2:', moment(lastQueryS2).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));
    //   console.log('pg_sun_numbers_1', pg_sun_numbers_1);

      const res_server_1 = await server1
      .table('producto_lote')
      .select('*')
      .where( 'date', '>=', moment(lastQueryS1).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"))
      .whereNotIn('sun_number', pg_sun_numbers_1);

      console.log('res_server_1', res_server_1);

      /****** SYNC SERVER 1 *******/
        if(res_server_1.length > 0) {
            parseData(res_server_1).then( async (dataS1)=> {
                if(dataS1){
                  try {
                    synchronizedDataS1 = await ProductoLote.createMany(dataS1);
                    console.log('Suns sincronizados S1');
                    await Until.query().select('until_date_s1').update({ until_date_s1: now });
                    //dropOldData(server1, lastQueryS1)                      
                  } catch (error) {
                    String(error).includes('duplicate') ? console.log('No es posible agregar datos duplicados') : `Somthing was wrong:${error}`
                  }
                };
            });
        };

        /****** SYNC SERVER 2 *******/
        let pg_sun_numbers_2 = await Database.select('sun_number').from('suns.producto_lote');
        pg_sun_numbers_2 = pg_sun_numbers_2.map((sun)=>{
          return sun.sun_number;
      });
        const res_server_2 = await server2
        .table('producto_lote')
        .select('*')
        .where( 'date', '>=', moment(lastQueryS2).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"))
        .whereNotIn('sun_number', pg_sun_numbers_1);

        console.log('res_server_2', res_server_2);
        
        if(res_server_2.length > 0) {
          parseData(res_server_2).then( async (dataS2)=> {
              if(dataS2){

                  await ProductoLote.createMany(dataS2)
                  .then( async ()=> {
                      console.log('Suns sincronizados S2');
                      await Until.query().select('until_date_s2').update({ until_date_s2: now });
                      //dropOldData(server2, lastQueryS2)   
                  })
                  .catch ((error) =>{            
                    String(error).includes('duplicate') ? console.log('No es posible agregar datos duplicados') : `Somthing was wrong:${error}`         
                  });                 
              };
          });
        };

    } catch (error) {
        console.log('ERROR CONSULTANDO SUNS: ', error);
    }
});

/***** SYNC CODES SERVER 1 CIP *****/
cron.schedule('*/2 * * * *', async function (){
  console.log('syncing codes server_CIP_1...');

  //conectamos SERVER 1 sql
  const server1_cip = Database.connection('Server1_CIP');

  //consultamos CÓDIGOS S1
  let server1_cip_codes = await server1_cip
  .table('codigo')
  .select('*');
  //conservamos solo los id para la consulta
  server1_cip_codes = server1_cip_codes.map((code)=>{
      return code.id;
  });

  //adquirimos los codigos del pg que no estan en S1
  let cip_codes_pg = await Database.select('id','nombre','grupo')
  .from('cip.codes_washing_rules')
  .whereNotIn('id', server1_cip_codes);

  //Insertando codigos en S1
  const synchronizedCodes = await server1_cip
  .insert(cip_codes_pg)
  .into('codigo')
  .returning('id');
  console.log('synchronizedCodes', synchronizedCodes);
});

/***** SYNC CODES SERVER 2 CIP *****/
cron.schedule('*/10 * * * *', async function (){
    console.log('syncing codes server_CIP_2...');
  
    //conectamos SERVER 2 sql
    const server2_cip = Database.connection('Server2_CIP');
  
    //consultamos CÓDIGOS S2
    let server2_cip_codes = await server2_cip
    .table('codigo')
    .select('*');
    //conservamos solo los id para la consulta
    server2_cip_codes = server2_cip_codes.map((code)=>{
        return code.id;
    });
  
    //adquirimos los codigos del pg que no estan en S2
    let cip_codes_pg = await Database.select('id','nombre','grupo')
    .from('cip.codes_washing_rules')
    .whereNotIn('id', server2_cip_codes);
  
    //Insertando codigos en S2
    const synchronizedCodes = await server2_cip
    .insert(cip_codes_pg)
    .into('codigo')
    .returning('id');
    console.log('synchronizedCodes', synchronizedCodes);
  });

/***** SYNC GROUPS SERVER 1 CIP *****/
cron.schedule('*/10 * * * *', async function (){
  console.log('syncing groups server_CIP_1...');

  //conectamos SERVER 1 sql
  const server1_cip = Database.connection('Server1_CIP');

  //consultamos GRUPOS S1
  let server1_cip_groups = await server1_cip
  .table('grupo')
  .select('nombre');
  //conservamos solo los id para la consulta
  server1_cip_groups = server1_cip_groups.map((group)=>{
    return group.nombre;
  });
  //console.log('server1_cip_groups', server1_cip_groups);

  //adquirimos los grupos del pg que no estan en S1
  let cip_groups_pg = await Database.select('*')
  .from('cip.groups_washing_rules')
  .whereNotIn('nombre', server1_cip_groups);

  //console.log('cip_groups_pg:', cip_groups_pg);

  //Insertando grupos en S1
  const synchronizedGroups = await server1_cip
  .insert(cip_groups_pg)
  .into('grupo')
  .returning('nombre');
  console.log('synchronizedGroups', synchronizedGroups);
});

/***** SYNC RULES SERVER 1 CIP *****/
cron.schedule('*/10 * * * *', async function (){
    console.log('syncing rules server_CIP_1...');
  
    //conectamos SERVER 1 sql
    const server1_cip = Database.connection('Server1_CIP');
  
    //consultamos RULES S1
    let server1_cip_rules = await server1_cip
    .table('regla')
    .select('*');
    //console.log('server1_cip_rules', server1_cip_rules);

    //conservamos solo los id's para la consulta
    let rules_ids = server1_cip_rules.map((rule)=>{
        return [ rule.grupo_id_ant, rule.grupo_id_act ];
    });
    //console.log('rules_ids', rules_ids);
    
    //adquirimos los grupos del pg que no estan en S1
    let cip_rules_pg = await Database.select('*')
    .from('cip.washing_rules')
    .whereNotIn(['grupo_id_ant', 'grupo_id_act'], rules_ids)

    //Insertando rules en S1
    const synchronizedRules = await server1_cip
    .insert(cip_rules_pg)
    .into('regla')
    .returning('*');
    console.log('synchronized_Rules', synchronizedRules);           

  });