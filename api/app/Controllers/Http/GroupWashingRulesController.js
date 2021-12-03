'use strict'

const GroupWashingRules = use("App/Models/GroupWashingRules.js");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with groupwashingrules
 */
class GroupWashingRulesController {
  /**
   * Show a list of all groupwashingrules.
   * GET groupwashingrules
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
   async index ({ request, response, auth }) {
    try{
      const user = await auth.getUser();
      let query = GroupWashingRules.query();

      let {
        options,
        id
      } = request.only(['options','id']);

      //seteo valores por defectos
      let page = JSON.parse(options).page || 1;
      let perPage = JSON.parse(options).itemsPerPage || 10;

      //Si piden todo
      if ( JSON.parse(options).all ) {
        let res = {};
        res.data = await GroupWashingRules.all();
        return response.status(200).json({ message: 'Listado de Grupos', data: res });
      }

      //Si recibe un codigo
      if (id) {
        query.where('id', id)
      }

      let res = await query.paginate(page, perPage);
      res = res.toJSON();
      response.status(200).json({ message: 'Listado de Grupos de Lavado', data: res });

    }catch(error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(401).json({ message: 'Usuario no Valido' })
      }
      response.status(404).json({ message: 'Hubo un error al realizar la operación', error });
    };
  }


  /**
   * Render a form to be used for creating a new groupwashingrule.
   * GET groupwashingrules/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new groupwashingrule.
   * POST groupwashingrules
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
   async store({ request, response, auth }) {
    try {
      const user = await auth.getUser()
       let  new_group = request.all();

        if (true/* user.rol_id == 1 */) {
          const created_group = await GroupWashingRules.create(new_group);

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
          console.log('status new group:', created_group);
          return response.status(200).json(
            { 
              message: 'Grupo creado con éxito', 
              data: created_group, 
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
   * Display a single groupwashingrule.
   * GET groupwashingrules/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing groupwashingrule.
   * GET groupwashingrules/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update groupwashingrule details.
   * PUT or PATCH groupwashingrules/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, auth }) {
    try {
      let groupToUpdated = null;
      let updatedGroup = null;
      const user = await auth.getUser();
      const current_group = request.all();
      
      if (true/* user.rol_id == 1 */) {
          groupToUpdated = await GroupWashingRules.findBy('id', current_group.id)
          if(groupToUpdated){
            console.log("Group:", groupToUpdated);
            groupToUpdated.merge({...current_group});
            await groupToUpdated.save();
            updatedGroup = groupToUpdated;
          }else{
            return response.status(400).json({ message: 'El grupo no existe' });
          }
      } else {
        return response.status(403).json({ message: 'Usuario sin permisos para realizar la operación' });
      }

      //const updated = await Promise.all(updated_codes);

      return response.status(200).json(
        { 
          message: 'Código actualizados con exito', 
          updated_group: updatedGroup,
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

  /**
   * Delete a groupwashingrule with id.
   * DELETE groupwashingrules/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = GroupWashingRulesController
