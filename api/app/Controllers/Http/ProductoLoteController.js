'use strict'

const { _macros } = require('@adonisjs/framework/src/Response');

const Database = use('Database');
const ProductoLote = use("App/Models/ProductoLote");
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

      let { options } = request.only(['options']);
      options = JSON.parse( options);

      //Si recibe un codigo de lote o sun
      let searched_value =  options.searched_value;
 
      if (searched_value) {
        query
        .where('sun_number', searched_value)
        .orWhere('lote', searched_value);
      }

      //seteo valores por defectos
      let page = options.page || 1;
      let perPage = options.itemsPerPage || 10;

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
  async create ({ request, response, view }) {
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
}

module.exports = ProductoLoteController
