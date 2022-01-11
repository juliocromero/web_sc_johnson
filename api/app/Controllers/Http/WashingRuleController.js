'use strict'
const WashingRule = use("App/Models/WashingRule");
const Database = use('Database');
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with washingrule
 */
class WashingRuleController {
  /**
   * Show a list of all washingrule.
   * GET washingrule
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, auth }) {
    try{
      const user = await auth.getUser();
      let query = WashingRule.query();

      let { options } = request.only(['options']);

      //Si recibe ambos id's
      if(JSON.parse(options).searched_value){
        let searched_value =  JSON.parse(options).searched_value;

        if ( searched_value.pre_group_id && searched_value.cur_group_id ) {
          query
          .where('grupo_id_act', searched_value.cur_group_id)
          .where('grupo_id_ant', searched_value.pre_group_id);
        };
        //Si recibe grupo anterior
        if (searched_value.pre_group_id && !searched_value.cur_group_id) {
          query
          .where('grupo_id_ant', searched_value.pre_group_id);
        };
  
        //Si recibe grupo actual
        if (!searched_value.pre_group_id && searched_value.cur_group_id) {
          query
          .where('grupo_id_act', searched_value.cur_group_id);
        };
      }

      //seteo valores por defectos
      let page = JSON.parse(options).page || 1;
      let perPage = JSON.parse(options).itemsPerPage || 10;

      let res = await query
      .with('cur_group')
      .with('pre_group')
      .paginate(page, perPage);
      res = res.toJSON();

      const data = res.data.map((item)=>{
        return {
          cur_group_id : item.cur_group.id,
          cur_group_name : item.cur_group.nombre,
          pre_group_id : item.pre_group.id,
          pre_group_name : item.pre_group.nombre,
          clean: item.limpiar
        }
      });

      response.status(200).json({ message: 'Listado de Reglas', rules: data, total:res.total});

    }catch(error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(401).json({ message: 'Usuario no Valido' })
      }
      response.status(404).json({ message: 'Hubo un error al realizar la operación index washing rules', error });
    };
  }

  /**
   * Render a form to be used for creating a new washingrule.
   * GET washingrule/create
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
   * POST washingrule
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, request, response }) {
    try {
      const user = await auth.getUser();
      let  new_rule = request.all();

      let isRule = await Database
      .table('cip.washing_rules')
      .select('*')
      .where({grupo_id_ant:new_rule.pre_group_id, grupo_id_act: new_rule.cur_group_id });

      if (isRule.length > 0) {
        return response.status(400).json({ message: "La regla ya existe." })
      }

        if (true/* user.rol_id == 1 */) {
          const inserted_rule = await Database
          .table('cip.washing_rules')
          .insert({
            grupo_id_act: new_rule.cur_group_id,
            grupo_id_ant: new_rule.pre_group_id,
            limpiar: new_rule.clean
          });      

          //Sincronizando con Server 1
          let messageS1 ={};
          try{
            await Database.connection('Server1_CIP')
            .table('regla')
            .insert({
              grupo_id_act: new_rule.cur_group_id,
              grupo_id_ant: new_rule.pre_group_id,
              limpiar: new_rule.clean
            });         
            messageS1 = { status:200, message:'Server 1 actualizado correctamente' };
          }catch(error){
            String(error).includes('duplicate') ? console.log('No es posible agregar datos duplicados') : `Somthing was wrong:${error}`
            messageS1 = { status:400, message:'Server 1 no actualizado' };
          };

          //Sincronizando con Server 2
          let messageS2 ={};
          try{
            await Database.connection('Server2_CIP')
            .table('regla')
            .insert({
              grupo_id_act: new_rule.cur_group_id,
              grupo_id_ant: new_rule.pre_group_id,
              limpiar: new_rule.clean
            });         
            messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
          }catch(error){
            String(error).includes('duplicate') ? console.log('No es posible agregar datos duplicados') : `Somthing was wrong:${error}`
            messageS2 = { status:400, message:'Server 2 no actualizado' };
          };

          return response.status(200).json(
            { 
              message: 'Nueva regla creada', 
              data: inserted_rule, 
              //server_cip1: messageS1, 
              //server2: messageS2 
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
   * GET washingrule/:id
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
   * GET washingrule/:id/edit
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
   * PUT or PATCH washingrule/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ auth, request, response }) {
    try {
      let updatedRule = null;
      let ruleToUpdated = null;
      const user = await auth.getUser();
      let { current_rule, new_rule } = request.all();
      console.log("current_rule:",new_rule.grupo_id_act, new_rule.grupo_id_ant, new_rule.limpiar);

      if (true/* user.rol_id == 1 */) {
        updatedRule = await Database
          .table('cip.washing_rules')
          .where({grupo_id_ant:current_rule.grupo_id_ant, grupo_id_act: current_rule.grupo_id_act })
          .update({
            grupo_id_act: new_rule.grupo_id_act,
            grupo_id_ant: new_rule.grupo_id_ant,
            limpiar: new_rule.limpiar
        });   

          // ruleToUpdated = await WashingRule.findBy({ grupo_id_act: current_rule.grupo_id_act, grupo_id_ant: current_rule.grupo_id_ant });
          // console.log('updatedRule', ruleToUpdated.toJSON())
          // if(ruleToUpdated){
          //   //ruleToUpdated.fill({...new_rule});
          //   ruleToUpdated.grupo_id_act = new_rule.grupo_id_act;
          //   ruleToUpdated.grupo_id_ant = new_rule.grupo_id_ant;
          //   ruleToUpdated.limpiar = new_rule.limpiar;
          //   updatedRule = await ruleToUpdated.save();
          //   console.log('updatedRule', updatedRule)

          //Sincronizando con Server 1
          let messageS1 ={};
          try{
            await Database.connection('Server1_CIP')
            .table('regla')
            .where({grupo_id_ant:current_rule.grupo_id_ant, grupo_id_act: current_rule.grupo_id_act })
            .update({
              grupo_id_act: new_rule.grupo_id_act,
              grupo_id_ant: new_rule.grupo_id_ant,
              limpiar: new_rule.limpiar
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
            .table('regla')
            .where({grupo_id_ant:current_rule.grupo_id_ant, grupo_id_act: current_rule.grupo_id_act })
            .update({
              grupo_id_act: new_rule.grupo_id_act,
              grupo_id_ant: new_rule.grupo_id_ant,
              limpiar: new_rule.limpiar
            });         
            messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 2:', error)
            messageS2 = { status:400, message:'Server 2 no actualizado' };
          };           

      } else {
        return response.status(403).json({ message: 'Usuario sin permisos para realizar la operación' });
      }

      return response.status(200).json(
        { 
          message: 'Regla actualizada con exito', 
          updated_rule: updatedRule,
        }
      );

    } catch (error) {
      console.log('Updating error:', error);
      if (error.name == 'InvalidJwtToken') {
        return response.status(403).json({ message: 'Usuario no válido' });
      }
      response.status(400).json({
        message: "Hubo un error al intentar actualizar la regla",
        error: error
      });
    }
  }

  /**
   * Delete a washingrule with id.
   * DELETE washingrule/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { pre_group_id, cur_group_id },auth, request, response }) {

    console.log('id delete:', pre_group_id, cur_group_id);
    let deletedRule = null;
    const user = await auth.getUser();

    if (true /* user.rol_id == 1 */) {
      try {
        deletedRule = await Database
          .table('cip.washing_rules')
          .where({grupo_id_ant: pre_group_id, grupo_id_act: cur_group_id })
          .delete();   
        if(deletedRule){
          //Sincronizando con Server 1
          let messageS1 ={};
          try{
            await Database.connection('Server1_CIP')
            .table('regla')
            .where({grupo_id_ant: pre_group_id, grupo_id_act: cur_group_id })
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
            .table('regla')
            .where({grupo_id_ant: pre_group_id, grupo_id_act: cur_group_id })
            .delete();           
            messageS2 = { status:200, message:'Server 2 actualizado correctamente' };
          }catch(error){
            console.log('Sync error on server_cip 2:', error)
            messageS2 = { status:400, message:'Server 2 no actualizado' };
          };

          return response.status(200).json({ menssage: 'Regla borrada con exito!' });
        } else {
          return response.status(400).json({ menssage: 'La regla indicada no existe' });
        }

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

module.exports = WashingRuleController
