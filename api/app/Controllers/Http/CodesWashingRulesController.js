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
        res.data = await query.with('group').fetch();
        res.data.data = res.data.toJSON();

        res.data = res.data.data.map((item) => {
          return {
              id_auto: item.id_auto, 
              id:item.id, 
              nombre: item.nombre, 
              grupo: item.group
          }
        });
        return response.status(200).json({ message: 'Listado completo de Códigos de Lavado', data: res });
      }

      //Si recibe un codigo
      if (code) {
        query.where('id', code)
      }

      //Si recibe un grupo
      if (group) {
        query.where('grupo', group)
      }

      let res = await query.with('group').paginate(page, perPage);
      res = res.toJSON();
      res.data = res.data.map((item) => {
        return{
          id_auto: item.id_auto, 
          id:item.id, 
          nombre: item.nombre, 
          grupo: item.group
      }});
      response.status(200).json({ message: 'Listado paginado de Códigos de Lavado', data: res });

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
          let messageS1 ={};
          try{
            await Database.connection('Server1_CIP')
            .table('codigo')
            .insert({
              id:new_code.id,
              nombre:new_code.nombre,
              grupo:new_code.grupo
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
            .table('codigo')
            .insert({
              id:new_code.id,
              nombre:new_code.nombre,
              grupo:new_code.grupo
            });         
            messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 2:', error)
            messageS2 = { status:400, message:'Server 2 no actualizado' };
          };

          return response.status(200).json(
            { 
              message: 'Código creado con éxito', 
              data: inserted_code, 
              server_cip1: messageS1, 
              server2: messageS2 
            });
        } 
        else {
          return response.status(403).json({ message: 'Usuario no válido' })
        }
    } catch (error) {
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
  async update ({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      let codeToUpdated = null;
      let updatedCodigo = null;
      const { current_id, id, nombre, grupo } = request.all();

      if (true/* user.rol_id == 1 */) {
          codeToUpdated = await CodesWashingRules.findBy('id', current_id);

          if(codeToUpdated){
            codeToUpdated.id = id;
            codeToUpdated.nombre = nombre;
            codeToUpdated.grupo = grupo;
            updatedCodigo = await codeToUpdated.save();

          //Sincronizando con Server 1
          let messageS1 ={};
          try{
            await Database.connection('Server1_CIP')
            .table('codigo')
            .where('id', current_id)
            .update({
              id:id,
              nombre:nombre,
              grupo:grupo
            });         
            messageS1 = { status:200, message:'Server 1 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 1:', error)
            messageS1 = { status:400, message:'Server 1 no actualizado' };
          };
          
          // //Sincronizando con Server 2
          let messageS2 ={};
          try{
            await Database.connection('Server2_CIP')
            .table('codigo')
            .where('id', current_id)
            .update({
              id:id,
              nombre:nombre,
              grupo:grupo
            });         
            messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 2:', error)
            messageS2 = { status:400, message:'Server 2 no actualizado' };
          };           

          } else {
            return response.status(400).json({ message: 'Código inválido' });
          }
      } else {
        return response.status(403).json({ message: 'Usuario sin permisos para realizar la operación' });
      }

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
          updated_codes = included_arr.map(async item => {
              return await CodesWashingRules.find(item.id).then( async code => {
                code.grupo = id_group;
                await code.save().then( async ()=>{
                  //Sincronizando con Server 1
                  let messageS1 ={};
                  try{
                    await Database.connection('Server1_CIP')
                    .table('codigo')
                    .select('grupo')
                    .where('id', item.id)
                    .update({
                      grupo:id_group
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
                    .table('codigo')
                    .select('grupo')
                    .where('id', item.id)
                    .update({
                      grupo:id_group
                    });         
                    messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
                  }catch(error){
                    console.log('Sync error on server_cip 2:', error)
                    messageS2 = { status:400, message:'Server 2 no actualizado' };
                  };            
                });           
                return code;
              });
          });     

        //Asignamos Null a los removidos
        removed_codes = removed_arr.map(async item => {
          return await CodesWashingRules.find(item.id).then( async code => {
            code.grupo = null;
            await code.save().then( async ()=>{
              //Sincronizando con Server 1
              let messageS1 ={};
              try{
                await Database.connection('Server1_CIP')
                .table('codigo')
                .select('grupo')
                .where('id', item.id)
                .update({
                  grupo:null
                });         
                messageS1 = { status:200, message:'Server 1 actualizado correctamente' };

                //Sincronizando con Server 2
                let messageS2 ={};
                  await Database.connection('Server2_CIP')
                  .table('codigo')
                  .select('grupo')
                  .where('id', item.id)
                  .update({
                    grupo:null
                  });         
                messageS2 = { status:200, message:'Server 2 actualizado correctamente' };

              }catch(error){
                console.log('Sync error on server_cip 1:', error)
                messageS1 = { status:400, message:'Server 1 no actualizado' };
              };                  
            });      
            return code;
          });
        });

      } else {
        return response.status(403).json({ message: 'Usuario sin permisos para realizar la operación' });
      }

      const updated = await Promise.all(updated_codes);
      const removed = await Promise.all(removed_codes);
      //console.log('updated_:', updated);
      //console.log('removed_:', removed);  
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

        //Sincronizando con Server 1
        let messageS1 ={};
        try{
          await Database.connection('Server1_CIP')
          .table('codigo')
          .where('id', code.id)
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
          .table('codigo')
          .where('id', code.id)
          .delete();         
          messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
        }catch(error){
          console.log('Sync error on server_cip 2:', error)
          messageS2 = { status:400, message:'Server 2 no actualizado' };
        };

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
