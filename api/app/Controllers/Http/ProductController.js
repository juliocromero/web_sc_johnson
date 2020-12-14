'use strict'
const Product = use("App/Models/Product");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const Database = use('Database');
const { validate } = use('Validator');
var moment = require('moment');

class ProductController {

  async index({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      var query = Product.query();
      var {
        page,
        perPage,
        codigo
      } = request.all()
      //seteo valores por defectos
      page = page || 1
      perPage = perPage || 10
      codigo = codigo || null

      if (codigo) {
        const products = await query.where('codigo', codigo).paginate(page, perPage);
        response.status(200).json({ menssage: 'Listado de Productos', data: products })
      } else {
        const products = await query.paginate(page, perPage);
        response.status(200).json({ menssage: 'Listado de Productos', data: products })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }


  async store({ request, response, auth }) {
    try {
      const user = await auth.getUser()
      let { cod_pt, sp_temp, sp_vel,  description } = request.all();
      const rules = {
        cod_pt: 'required',
        sp_temp: 'requiered',
        sp_vel: 'required',
        description: 'required'
      }
      let validation = await validate({ cod_pt, sp_temp, sp_vel, description }, rules)
      if (validation.fails()) {
        response.status(403).json({ message: "Datos insuficiente" })
      }
      if (user.rol_id == 1) {
        const product = await Product.create({
          cod_pt,
          sp_temp,
          sp_vel,
          oncrimp:1,
          description, 
        })
        console.log(product)
        try{
          let server1 = await Database.connection('historicos').table('baprueba').insert({ cod_pt: product.cod_pt, sp_temp: product.sp_temp, sp_vel: product.sp_vel, oncrimp: product.oncrimp, description: product.description , created_at: product.created_at , updated_at: product.updated_at})

        }catch(error){
          console.log(error)
          return response.status(400).json({menssage: 'EL producto no pudo se agregado al server 1, comunicarse con el administrador!'})
        }
        try {
          let server2 = await Database.connection('Server2').table('baprueba').insert({ cod_pt: product.cod_pt, sp_temp: product.sp_temp, sp_vel: product.sp_vel, oncrimp: product.oncrimp, description: product.description , created_at: product.created_at , updated_at: product.updated_at}) 
        } catch (error) {
          return response.status(400).json({menssage: 'EL producto no pudo se agregado al server 2, comunicarse con el administrador!'})
        }
        return response.status(200).json({ message: 'Producto creado con exito', data: product })
      } else {
        return response.status(400).json({ menssage: 'Usuario sin permiso Suficiente' })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {
  }

  async update({ params: { id }, request, response, auth }) {
    try {
      const data = request.only(["cod_pt", "sp_temp", "sp_vel", "oncrimp", "description"])
      const user = await auth.getUser();
      if (user.rol_id == 1) {
        const product = await Product.find(id);
        product.cod_pt = data.cod_pt || product.cod_pt;
        product.sp_temp = data.sp_temp || product.sp_temp;
        product.sp_vel = data.sp_vel || product.sp_vel;
        product.oncrimp = data.oncrimp || product.oncrimp;
        product.description = data.description || product.description;
        await product.save();
        try {
          let server1 = await Database.connection('Server1').table('baprueba').update({ cod_pt: product.cod_pt, sp_temp: product.sp_temp, sp_vel: product.sp_vel, oncrimp: product.oncrimp, description: product.description , created_at: product.created_at , updated_at: product.updated_at}).where('cod_pt' , product.cod_pt) 
          console.log(server1) 
        } catch (error) {
          return response.status(400).json({menssage: 'El producto editado no se puedo editar o no fue encontrado en el server 1'})
        }
        try {
          let server2 = await Database.connection('Server2').table('baprueba').update({ cod_pt: product.cod_pt, sp_temp: product.sp_temp, sp_vel: product.sp_vel, oncrimp: product.oncrimp, description: product.description , created_at: product.created_at , updated_at: product.updated_at}).where('cod_pt' , product.cod_pt)
        } catch (error) {
          return response.status(400).json({menssage: 'El producto editado no se puedo editar o no fue encontrado en el server 2'})
        }
        return response.status(200).json({ menssage: 'Producto modificado con exito', data: product })
      } else {
        return response.status(400).json({ menssage: 'Usuario sin permisos para realizar la operación' })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(400).json({
        menssage: "Hubo un error al modificar el Vale",
        id
      })
    }
  }

  async destroy({ params: { id }, request, response, auth }) {
    try {
      const user = await auth.getUser();
      if (user.rol_id == 1) {
        const product = await Product.findOrFail(id);
        await product.delete();
        response.status(200).json({ menssage: 'Producto eliminado con exito!' });
        return;
      } else {
        return response.status(403).json({ menssage: "Usuario sin permisos Suficientes" })
      }
    } catch (error) {
      console.log(error)
      return response.status(404).json({
        menssage: "producto a eliminar no encontrado",
        id
      })
    }
  }
}

module.exports = ProductController
