var cron = require("node-cron");
const Until = use("App/Models/SunsLastQuery");
var moment = require('moment');
const Database = use('Database');

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

/******* ADQUISICIÓN SUNS *******/
cron.schedule('*/30 * * * *', async function () {
    try { 
      let initialDate = moment('2021-01-01 00:00:00').format();
      let now = moment().format("YYYY-MM-DD HH:mm:ss");
      let lastQueryS1 = await Database.table('suns.suns_last_query').select('until_date_s1');
      !lastQueryS1 ? Until.create({until_date_s1:initialDate, until_date_s2:initialDate}) : lastQueryS1;
      let lastQueryS2 = await Database.table('suns.suns_last_query').select('until_date_s2');
      lastQueryS1 = lastQueryS1[0].until_date_s1;
      lastQueryS2 = lastQueryS2[0].until_date_s2;

      const server1 = Database.connection('Server1');
      const server2 = Database.connection('Server2');

      console.log('SUN LAST QUERY S1:', moment(lastQueryS1).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));
      console.log('SUN LAST QUERY S2:', moment(lastQueryS2).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));

      /****** SYNC SERVER 1 *******/
      const res_server_1 = await server1
      .table('producto_lote')
      .select('*')
      .where( 'date', '>=', moment(lastQueryS1).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));

      const dataS1 = parseData(res_server_1);
              
        if(res_server_1.length > 0){
          await Database.raw(
            `INSERT INTO suns.producto_lote ( sun_number, lote, batch_id, fecha_hora) 
              VALUES ${String(dataS1.slice(0, -1))} 
              ON CONFLICT ON CONSTRAINT unique_sun 
              DO NOTHING;`).then( async (resS1)=> {
                if(resS1){
                  console.log('Suns sincronizados S1: ', resS1.rowCount);        
                }
                //Actualizamos fecha de consulta.
                await Until.query().select('until_date_s1').update({ until_date_s1: String(now) });
              }).catch((error)=> console.log('insertedS1:', error));            
        } else {
          console.log('No hay datos para sincronizar en S1');
        };
                   
      /****** SYNC SERVER 2 *******/
      const res_server_2 = await server2
      .table('producto_lote')
      .select('*')
      .where( 'date', '>=', moment(lastQueryS2).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));

      const dataS2 = parseData(res_server_2);
        
              
        if(res_server_2.length > 0) {
          await Database.raw(
          `INSERT INTO suns.producto_lote ( sun_number, lote, batch_id, fecha_hora) 
            VALUES ${String(dataS2.slice(0, -1))} 
            ON CONFLICT ON CONSTRAINT unique_sun 
            DO NOTHING;`).then( async (resS2)=> {
              if(resS2){
                console.log('Suns sincronizados S2: ', resS2.rowCount); 
                //Actualizamos fecha de consulta.
                await Until.query().select('until_date_s2').update({ until_date_s2: String(now) });         
              }                
            }).catch((error)=> console.log('insertedS2:', error));
            
        } else {
          console.log('No hay datos para sincronizar en S2');
        };

    } catch (error) {
        console.log('ERROR SINCRONIZANDO SUNS: ', error);
    }
});

/***** SYNC CODES SERVER 1 CIP *****/
cron.schedule('*/10 * * * *', async function (){
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
  console.log('Synchronized Codes S1:', synchronizedCodes ? synchronizedCodes : 'No hay datos para sincronizar');
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
    console.log('Synchronized Codes S2:', synchronizedCodes ? synchronizedCodes : 'No hay datos para sincronizar');
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

  //adquirimos los grupos del pg que no estan en S1
  let cip_groups_pg = await Database.select('*')
  .from('cip.groups_washing_rules')
  .whereNotIn('nombre', server1_cip_groups);

  //Insertando grupos en S1
  const synchronizedGroups = await server1_cip
  .insert(cip_groups_pg)
  .into('grupo')
  .returning('nombre');
  console.log('Synchronized Groups S1:', synchronizedGroups ? synchronizedGroups : 'No hay datos para sincronizar');
});

/***** SYNC GROUPS SERVER 2 CIP *****/
cron.schedule('*/10 * * * *', async function (){
  console.log('syncing groups server_CIP_2...');

  //conectamos SERVER 2 sql
  const server2_cip = Database.connection('Server2_CIP');

  //consultamos GRUPOS S2
  let server2_cip_groups = await server2_cip
  .table('grupo')
  .select('nombre');
  //conservamos solo los id para la consulta
  server2_cip_groups = server2_cip_groups.map((group)=>{
    return group.nombre;
  });

  //adquirimos los grupos del pg que no estan en S2
  let cip_groups_pg = await Database.select('*')
  .from('cip.groups_washing_rules')
  .whereNotIn('nombre', server2_cip_groups);

  //Insertando grupos en S2
  const synchronizedGroups = await server2_cip
  .insert(cip_groups_pg)
  .into('grupo')
  .returning('nombre');
  console.log('Synchronized Groups S2:', synchronizedGroups ? synchronizedGroups : 'No hay datos para sincronizar');
});

/***** SYNC RULES SERVER 1 CIP *****/
cron.schedule('*/10 * * * *', async function (){
    console.log('Syncing rules server_CIP_1...');
  
    //conectamos SERVER 1 sql
    const server1_cip = Database.connection('Server1_CIP');
  
    //consultamos RULES S1
    let server1_cip_rules = await server1_cip
    .table('regla')
    .select('*');

    //conservamos solo los id's para la consulta
    let rules_ids = server1_cip_rules.map((rule)=>{
        return [ rule.grupo_id_ant, rule.grupo_id_act ];
    });
    
    //adquirimos los grupos del pg que no estan en S1
    let cip_rules_pg = await Database.select('*')
    .from('cip.washing_rules')
    .whereNotIn(['grupo_id_ant', 'grupo_id_act'], rules_ids)

    //Insertando rules en S1
    const synchronizedRules = await server1_cip
    .insert(cip_rules_pg)
    .into('regla')
    .returning('*');
    console.log('Synchronized Rules S1: ', synchronizedRules ? synchronizedRules : 'No hay datos para sincronizar');           
  });

  /***** SYNC RULES SERVER 2 CIP *****/
cron.schedule('*/10 * * * *', async function (){
  console.log('Syncing rules server_CIP_2...');

  //conectamos SERVER 2 sql
  const server2_cip = Database.connection('Server2_CIP');

  //consultamos RULES S2
  let server2_cip_rules = await server2_cip
  .table('regla')
  .select('*');

  //conservamos solo los id's para la consulta
  let rules_ids = server2_cip_rules.map((rule)=>{
      return [ rule.grupo_id_ant, rule.grupo_id_act ];
  });
  
  //adquirimos los grupos del pg que no estan en S2
  let cip_rules_pg = await Database.select('*')
  .from('cip.washing_rules')
  .whereNotIn(['grupo_id_ant', 'grupo_id_act'], rules_ids)

  //Insertando rules en S2
  const synchronizedRules = await server2_cip
  .insert(cip_rules_pg)
  .into('regla')
  .returning('*');
  console.log('Synchronized Rules S2: ', synchronizedRules ? synchronizedRules : 'No hay datos para sincronizar');           
});

/***** BORRA LOS SUNS CON MAS DE 30 DIAS DE ANTIGUEDAD *****/
cron.schedule('59 23 * * *', async function () { //Todos los días a las 23:59
    console.log('Eliminando data antigua...');
    let lastQueryS1 = await Database.table('suns.suns_last_query').select('until_date_s1');
    let lastQueryS2 = await Database.table('suns.suns_last_query').select('until_date_s2');
    lastQueryS1 = lastQueryS1[0].until_date_s1;
    lastQueryS2 = lastQueryS2[0].until_date_s2;
    const server1 = Database.connection('Server1');
    const server2 = Database.connection('Server2');
    dropOldData(server1, lastQueryS1);
    dropOldData(server2, lastQueryS2); 
});

/*** METHODS */

const dropOldData = async (connection, lastQuery)=> {
    try {
        console.log('Deleting old data...');
        return await connection
        .table('producto_lote')
        .where( 'date','<', moment(lastQuery).add(-30, 'days').format('YYYY-MM-DD HH:mm:ss'))
        .delete();        
    } catch (error) {
        console.log('DELETING OLD DATA ERROR ==>', error)
    }
};

const parseData = (arr)=> {
    let query = '';
    try {
        arr.forEach((item)=>{
          query += `('${item.sun_number}','${item.lote}', '${item.batch_id}', '${moment(item.date).format("YYYY-MM-DD HH:mm:ss")}'),`; 
        });
        return query;        
    } catch (error) {
        console.log('PARSE_DATA_ERROR ==>', error);
    }
};