'use strict'

const GroupWashingRules = use("App/Models/GroupWashingRules.js");
const Database = use('Database');
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
        id,
        options,
        group_name
      } = request.only(['options','group_name','id']);

      //seteo valores por defectos
      let page = JSON.parse(options).page || 1;
      let perPage = JSON.parse(options).itemsPerPage || 10;

      //Si piden todo para los desplegables en codigo
      if ( JSON.parse(options).all ) {
        console.log('Consultado todo');
        let res = {};
        res.data = await GroupWashingRules.all();
        return response.status(200).json({ message: 'Listado de Grupos', data: res });
      }

      //Si recibe un nombre
      if (group_name) {
        query.where('nombre', group_name)
      }

      //Si recibe un id
      if (id) {
        console.log('Consultado solo 1');
        let res = {};
        res.data = await GroupWashingRules.find(id);
        return response.status(200).json({ message: 'Grupo', data: res });
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
          let messageS1 = {};
          try{
            await Database.connection('Server1_CIP')
            .table('grupo')
            .insert({
              id:created_group.id,
              nombre:created_group.nombre,
              familia:created_group.familia,
              t_maxlmp:created_group.t_maxlmp
            });         
            messageS1 = { status:200, message:'Server 1 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 1:', error)
            messageS1 = { status:400, message:'Server 1 no actualizado' };
          };
          //Sincronizando con Server 2
          let messageS2 = {};
          try{
            await Database.connection('Server2_CIP')
            .table('grupo')
            .insert({
              id:created_group.id,
              nombre:created_group.nombre,
              familia:created_group.familia,
              t_maxlmp:created_group.t_maxlmp
            });         
            messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 2:', error)
            messageS2 = { status:400, message:'Server 2 no actualizado' };
          };
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
            groupToUpdated.merge({...current_group});
            await groupToUpdated.save();
            updatedGroup = groupToUpdated;

          //Sincronizando con Server 1
            let messageS1 ={};
            try{
              await Database.connection('Server1_CIP')
              .table('grupo')
              .where('id', current_group.id)
              .update({
                nombre:current_group.nombre,
                familia:current_group.familia,
                t_maxlmp:current_group.t_maxlmp
              });         
              messageS1 = { status:200, message:'Server 1 actualizado correctamente' };
            }catch(error){
              console.log('Sync error on server_cip 1:', error)
              messageS1 = { status:400, message:'Server 1 no actualizado' };
            };
          
          //Sincronizando con Server 2
          let messageS2 ={};
          try{
            await Database.connection('Server2_CIP')
            .table('grupo')
            .where('id', current_group.id)
            .update({
              nombre:current_group.nombre,
              familia:current_group.familia,
              t_maxlmp:current_group.t_maxlmp
            });         
            messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 2:', error)
            messageS2 = { status:400, message:'Server 2 no actualizado' };
          };

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
  async destroy ({ params: { id }, request, response, auth }) {
    const user = await auth.getUser();
    if (true /* user.rol_id == 1 */) {
      try {
        const group = await GroupWashingRules.find(id);
        if(!group){
          return response.status(404).json({
            message: "Grupo no existe",
            id
          });
        }
        await group.delete();
          //Sincronizando con Server 1
          let messageS1 ={};
          try{
            await Database.connection('Server1_CIP')
            .table('grupo')
            .where('id', id)
            .delete();         
            messageS1 = { status:200, message:'Server 1 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 1:', error)
            messageS1 = { status:400, message:'Server 1 no actualizado' };
          };
          //Sincronizando con Server 2
          let messageS2 ={};
          try{
            await Database.connection('Server2_CIP')
            .table('grupo')
            .where('id', id)
            .delete();         
            messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 2:', error)
            messageS2 = { status:400, message:'Server 2 no actualizado' };
          };
        return response.status(200).json({ menssage: 'Grupo borrado con exito!' });
      } catch (error) {
        console.log('DELETE GROUP ERROR:', error);
        if (error.message.includes('"groups_washing_rules" violates foreign')) {
          return response.status(403).json({ message: 'Por favor elimine primero las reglas asociadas a este grupo' });
        }
        return response.status(404).json({
          message: "Ha ocurrido un error al eliminar el grupo",
          id
        });
      }
    } else {
      response.status(403).json({ message: "Usuario sin permisos suficientes" });
      return;
    }    
  }
}

module.exports = GroupWashingRulesController
