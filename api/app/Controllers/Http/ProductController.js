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
      let { codigo, sp_temperatura, sp_velocidad, crimper, description } = request.all();
      const rules = {
        codigo: 'required',
        sp_temperatura: 'requiered',
        sp_velocidad: 'required',
        crimper: 'required',
        description: 'required'
      }
      let validation = await validate({ codigo, sp_temperatura, sp_velocidad, crimper, description }, rules)
      if (validation.fails()) {
        response.status(403).json({ message: "Datos insuficiente" })
      }
      if (user.rol_id == 1) {
        const product = await Product.create({
          codigo,
          sp_temperatura,
          sp_velocidad,
          crimper,
          description,
          fecha: moment().format('YYYY-MM-DD HH:mm:ss') 
        })
       /*  let table = await Database.connection('historicos').table('product').insert({ id: product.id, codigo: product.codigo, sp_temperatura: product.sp_temperatura, sp_velocidad: product.sp_velocidad, crimper: product.crimper, description: product.description }) */
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
      const data = request.only(["codigo", "sp_temperatura", "sp_velocidad", "crimper", "description"])
      const user = await auth.getUser();
      if (user.rol_id == 1) {
        const product = await Product.find(id);
        product.codigo = data.codigo || product.codigo;
        product.sp_temperatura = data.sp_temperatura || product.sp_temperatura;
        product.sp_velocidad = data.sp_velocidad || product.sp_velocidad;
        product.crimper = data.crimper || product.crimper;
        product.description = data.description || product.description;
        await product.save();
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
