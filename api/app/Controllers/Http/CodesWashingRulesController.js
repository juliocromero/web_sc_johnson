'use strict'

const Database = use('Database');
const CodesWashingRules = use("App/Models/CodesWashingRules.js");
const moment = use('moment');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with washingrules
 */
class CodesWashingRulesController {
  /**
   * Show a list of all washingrules.
   * GET washingrules
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
   async index ({ request, response, auth }) {
    try{
      const user = await auth.getUser();
      let query = CodesWashingRules.query();

      let {
        options,
        code,
        group
      } = request.all();

      //seteo valores por defectos
      let page = JSON.parse(options).page || 1;
      let perPage = JSON.parse(options).itemsPerPage || 10;
      

      //Si piden todo
      if (JSON.parse(options).all) {
        let res = {};
        res = CodesWashingRules.all();
        return response.status(200).json({ message: 'Listado de Códigos de Lavado', data: res });
      }

      //Si recibe un codigo
      if (code) {
        query.where('id', code)
      }

      //Si recibe un grupo
      if (group) {
        query.where('grupo', group)
      }

      let res = await query.paginate(page, perPage);
      res = res.toJSON();
      response.status(200).json({ message: 'Listado de Códigos de Lavado', data: res });

    }catch(error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(401).json({ message: 'Usuario no Valido' })
      }
      response.status(404).json({ message: 'Hubo un error al realizar la operación', error });
    };
  }

  /**
   * Render a form to be used for creating a new washingrule.
   * GET washingrules/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new washingrule.
   * POST washingrules
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async store({ request, response, auth }) {
    try {
      const user = await auth.getUser()
       let  new_code = request.all();

      let codigoExistente = await CodesWashingRules.findBy('id', new_code.id)

      if (codigoExistente) {
        return response.status(400).json({ message: "El código ya existe." })
      }

        if (true/* user.rol_id == 1 */) {
          const inserted_code = await CodesWashingRules.create(new_code);

          //Sincronizando con Server 1
          // let messageS1 ={};
          // try{
          //   await Database.connection('Server1')
          //   .table('bp_setpoints')
          //   .insert({ 
          //     cod_pt :product.cod_pt,
          //     description  : product.description,
          //     l310_sp_temp : product.l310_sp_temp,
          //     l310_sp_vel  : product.l310_sp_vel,
          //     l310_oncrimp : product.l310_oncrimp ? 1 : 0,
          //     l320_sp_temp : product.l320_sp_temp,
          //     l320_sp_vel  : product.l320_sp_vel,
          //     l320_oncrimp : product.l320_oncrimp ? 1 : 0,
          //     l330_sp_temp : product.l330_sp_temp,
          //     l330_sp_vel  : product.l330_sp_vel,
          //     l330_oncrimp : product.l330_oncrimp ? 1 : 0,
          //     l340_sp_temp : product.l340_sp_temp,
          //     l340_sp_vel  : product.l340_sp_vel,
          //     l340_oncrimp : product.l340_oncrimp ? 1 : 0,
          //     created_at: product.created_at, 
          //     updated_at: product.updated_at,
          //   });         
          //   messageS1 = { status:200, message:'Server 1 actualizado correctamente' };
          // }catch(error){
          //   console.log('Sync error on server 1:', error)
          //   messageS1 = { status:400, message:'Server 1 no actualizado' };
          // };

          //Sincronizando con Server 2
          // let messageS2 ={};
          // try {
          //   await Database.connection('Server2')
          //   .table('bp_setpoints')
          //   .insert({ 
          //     cod_pt :product.cod_pt,
          //     description  : product.description,
          //     l310_sp_temp : product.l310_sp_temp,
          //     l310_sp_vel  : product.l310_sp_vel,
          //     l310_oncrimp : product.l310_oncrimp ? 1 : 0,
          //     l320_sp_temp : product.l320_sp_temp,
          //     l320_sp_vel  : product.l320_sp_vel,
          //     l320_oncrimp : product.l320_oncrimp ? 1 : 0,
          //     l330_sp_temp : product.l330_sp_temp,
          //     l330_sp_vel  : product.l330_sp_vel,
          //     l330_oncrimp : product.l330_oncrimp ? 1 : 0,
          //     l340_sp_temp : product.l340_sp_temp,
          //     l340_sp_vel  : product.l340_sp_vel,
          //     l340_oncrimp : product.l340_oncrimp ? 1 : 0,
          //     created_at: product.created_at, 
          //     updated_at: product.updated_at,
          //   });
          //   messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
          // } 
          // catch (error) {
          //   console.log('Sync error on server 2:', error)
          //   messageS2 = { status:400, message:'Server 2 no actualizado' };
          // }

          return response.status(200).json(
            { 
              message: 'Código creado con éxito', 
              data: inserted_code, 
              //server1: messageS1, 
              //server2: messageS2 
            });
        } 
        else {
          return response.status(403).json({ message: 'Usuario no válido' })
        }
    }catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(403).json({ message: 'Usuario no válido' });
      }
      response.status(404).json({ message: 'Hubo un error al realizar la operación', error });
    }
  }

  /**
   * Display a single washingrule.
   * GET washingrules/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing washingrule.
   * GET washingrules/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update washingrule details.
   * PUT or PATCH washingrules/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id } , request, response, auth }) {
    try {
      const user = await auth.getUser();
      let codeToUpdated = null;
      let updatedCodigo = null;
      const current_code = request.all();
      let id = current_code.id_auto;
      console.log("current_code:",id);
      if (true/* user.rol_id == 1 */) {
          codeToUpdated = await CodesWashingRules.findBy('id_auto', id);
          console.log("codeToUpdated:", codeToUpdated);
          if(codeToUpdated){
            codeToUpdated.fill(current_code);
            updatedCodigo = await codeToUpdated.save().then().catch((error)=>console.log('UDATE', error));
          }else{
            return response.status(400).json({ message: 'Código inválido' });
          }
      } else {
        return response.status(403).json({ message: 'Usuario sin permisos para realizar la operación' });
      }
      //const updated = await Promise.all(updated_codes);

      return response.status(200).json(
        { 
          message: 'Código actualizado con exito', 
          updated_code: updatedCodigo,
        }
      );

    } catch (error) {
      console.log('Updating error:', error);
      if (error.name == 'InvalidJwtToken') {
        return response.status(403).json({ message: 'Usuario no válido' });
      }
      response.status(400).json({
        message: "Hubo un error al intentar actualizar el grupo",
        id
      });
    }
  }

  async multipleUpdate({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      let updated_codes = [];
      let removed_codes = [];
      let {
        included_arr,
        removed_arr,
        id_group
      } = request.all();
      
      if (true/* user.rol_id == 1 */) {
        //Reasignamos los incluidos
        if(included_arr) {
          updated_codes = included_arr.map(async item => {
              return await CodesWashingRules.find(item.id).then( async code => {
                code.grupo = id_group;
                await code.save();
                return code;
              });
          });     
        }

        //Asignamos Null a los removidos
      if(removed_arr){
        removed_codes = removed_arr.map(async item => {
          return await CodesWashingRules.find(item.id).then( async code => {
            code.grupo = null;
            await code.save();
            return code;
          });
        });
      }
      } else {
        return response.status(403).json({ message: 'Usuario sin permisos para realizar la operación' });
      }

      const updated = await Promise.all(updated_codes);
      const removed = await Promise.all(removed_codes);
      console.log('updated_:', updated);
      console.log('removed_:', removed);  
      return response.status(200).json(
        { 
          message: 'Códigos actualizados con exito', 
          updated: updated,
          removed: null
        }
      );

    } catch (error) {
      console.log('Updating error:', error);
      if (error.name == 'InvalidJwtToken') {
        return response.status(403).json({ message: 'Usuario no válido' });
      }
      response.status(400).json({
        message: "Hubo un error al intentar actualizar el producto",
        id
      });
    }
  }
  /**
   * Delete a washingrule with id.
   * DELETE washingrules/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response, auth }) {
    const id = params.id
    console.log('id delete:', id)
    const user = await auth.getUser();

    if (true /* user.rol_id == 1 */) {
      try {
        const code = await CodesWashingRules.findOrFail(id);
        await code.delete();
        return response.status(200).json({ menssage: 'Código borrado con exito!' });
      } catch (error) {
        return response.status(404).json({
          message: "Código no existe",
          id
        });
      }
    } else {
      response.status(403).json({ message: "Usuario sin permisos suficientes" });
      return;
    }
  }
}

module.exports = CodesWashingRulesController
