'use strict'

const { _macros } = require('@adonisjs/framework/src/Response');

const Database = use('Database');
const ProductoLote = use("App/Models/ProductoLote");
const Until = use("App/Models/SunsLastQuery");
const moment = use('moment');
const _ = require('lodash');
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with productolotes
 */
class ProductoLoteController {
  /**
   * Show a list of all productolotes.
   * GET productolotes
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, auth }) {
    try{
      const user = await auth.getUser();
      let query = ProductoLote.query();

      let { options, searched_value } = request.only(['options', 'searched_value']);

      //Si recibe un codigo de lote o sun 
      if (searched_value) {
        query
        .where('sun_number', searched_value)
        .orWhere('lote', searched_value);
      }

      //seteo valores por defectos
      let page = JSON.parse(options).page || 1;
      let perPage = JSON.parse(options).itemsPerPage || 10;

      let res = await query.orderBy('fecha_hora', 'desc').fetch();
      res = res.toJSON();

      const total = res.reduce((acc,item)=>{
        if(!acc.includes(item.lote)){
          acc.push(item.lote);
        }
        return acc;
      },[]);

      res = _.groupBy(res, 'lote');
      let data = Object.keys(res).map((key) => {return { lote:key, suns:res[key] } });
      data = data.sort((el1, el2)=>{
        return new Date(el1.suns[0].fecha_hora) > new Date(el2.suns[0].fecha_hora) ? -1 : 1;
      });

      response.status(200).json({ message: 'Listado de SUNs', suns: data, total:total.length });

    }catch(error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(401).json({ message: 'Usuario no Valido' })
      }
      response.status(404).json({ message: 'Hubo un error al realizar la operación', error });
    };
  }
  /**
   * Render a form to be used for creating a new productolote.
   * GET productolotes/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async sync ({ request, response }) {
    try { 
      let res = {
        s1:{
          msg:'',
          rowCount:null
        },
        s2:{
          msg:'',
          rowCount:null
        }
      };
      const { dateSync } = request.only(['dateSync']);
      console.log(dateSync);
      let initialDate = moment('2021-01-01 00:00:00').format();
      let now = moment().format("YYYY-MM-DD HH:mm:ss");
      let lastQueryS1 = await Database.table('suns.suns_last_query').select('until_date_s1');
      !lastQueryS1 ? Until.create({until_date_s1:initialDate, until_date_s2:initialDate}) : lastQueryS1;
      let lastQueryS2 = await Database.table('suns.suns_last_query').select('until_date_s2');
      lastQueryS1 = lastQueryS1[0].until_date_s1;
      lastQueryS2 = lastQueryS2[0].until_date_s2;

      const server1 = Database.connection('Server1');
      const server2 = Database.connection('Server2');

      console.log('LAST QUERY lastQueryS1:', moment(lastQueryS1).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));
      console.log('LAST QUERY lastQueryS2:', moment(lastQueryS2).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));

      /****** SYNC SERVER 1 *******/
      const res_server_1 = await server1
      .table('producto_lote')
      .select('*')
      .where( 'date', '>=', moment(dateSync).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));

        console.log('res_server_1',res_server_1);
        const dataS1 = this.parseData(res_server_1);
        
              
        if(res_server_1.length > 0){
          let inserted = await Database.raw(
            `INSERT INTO suns.producto_lote ( sun_number, lote, batch_id, fecha_hora) 
              VALUES ${String(dataS1.slice(0, -1))} 
              ON CONFLICT ON CONSTRAINT unique_sun 
              DO NOTHING;`).then((res)=> res).catch((error)=> console.log('Inserted1:', error));
  
              //console.log('inserted1:', inserted);
              if(inserted){
                console.log('Suns sincronizados S1');
                res.s1.msg = 'Suns sincronizados S1';
                res.s1.rowCount = inserted.rowCount;                 
                }
          //Actualizamos fecha de consulta.
          await Until.query().select('until_date_s1').update({ until_date_s1: String(now) });            
        } else {
          res.s1.msg = 'No hay datos para sincronizar en S1';
          res.s1.data = [];
        };
                   



      /****** SYNC SERVER 2 *******/
      const res_server_2 = await server2
      .table('producto_lote')
      .select('*')
      .where( 'date', '>=', moment(dateSync).add(-20,'minutes').format("YYYY-MM-DD HH:mm:ss"));

        console.log('res_server_2',res_server_2);
        const dataS2 = this.parseData(res_server_2);
        
              
        if(res_server_2.length > 0){
          let inserted = await Database.raw(
            `INSERT INTO suns.producto_lote ( sun_number, lote, batch_id, fecha_hora) 
              VALUES ${String(dataS2.slice(0, -1))} 
              ON CONFLICT ON CONSTRAINT unique_sun 
              DO NOTHING;`).then((res)=> res).catch((error)=> console.log('Inserted2:', error));
  
              //console.log('inserted2:', inserted);
              if(inserted){
                console.log('Suns sincronizados S2');
                res.s2.msg = 'Suns sincronizados S2';
                res.s2.rowCount = inserted.rowCount;                 
                }
          //Actualizamos fecha de consulta.
          await Until.query().select('until_date_s2').update({ until_date_s2: String(now) });            
        } else {
          res.s2.msg = 'No hay datos para sincronizar en S2';
          res.s2.data = [];
        };
      
      response.status(200).json({ message: 'Suns sincronizados', data: res });
    } catch (error) {
        console.log('ERROR SINCRONIZANDO SUNS: ', error);
        response.status(400).json({ message: error });
    }
  }

  /**
   * Create/save a new productolote.
   * POST productolotes
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single productolote.
   * GET productolotes/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing productolote.
   * GET productolotes/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update productolote details.
   * PUT or PATCH productolotes/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a productolote with id.
   * DELETE productolotes/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }

  //METHODS
  parseData = (arr)=> {
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
}

module.exports = ProductoLoteController
