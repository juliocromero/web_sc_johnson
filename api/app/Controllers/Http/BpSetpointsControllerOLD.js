'use strict'
const BpSetpoints = use("App/Models/BpSetpoints");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const Database = use('Database');
const { validate } = use('Validator');
var moment = require('moment');

class BpSetpointsController {

  async index({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      let query = BpSetpoints.query();

      let {
        page,
        perPage,
        cod_pt
      } = request.all()
      //seteo valores por defectos
      page = page || 1
      perPage = perPage || 10

      if (cod_pt) {//Si recibe un codigo de producto
        let res = await query.where('cod_pt', cod_pt).paginate(page, perPage);
        res = res.toJSON();

        let products = res.data.map((item)=>{
          return {
            id:item.id,
            cod_pt: item.cod_pt,
            description: item.description
          }
        })

        let lines = res.data.map((item)=>{
          return {
            cod_pt:item.cod_pt,
            setPoints:[
                {
                line:'L310', 
                temperature: item.l310_sp_temp,
                velocity: item.l310_sp_vel,
                onCrimp: item.l310_oncrimp
              },
              {
                line:'L320', 
                temperature: item.l320_sp_temp,
                velocity: item.l320_sp_vel,
                onCrimp: item.l320_oncrimp
              },
              {
                line:'L330', 
                temperature: item.l330_sp_temp,
                velocity: item.l330_sp_vel,
                onCrimp: item.l330_oncrimp
              },
              {
                line:'L340', 
                temperature: item.l340_sp_temp,
                velocity: item.l340_sp_vel,
                onCrimp: item.l340_oncrimp
              }
            ]
          }
        });
        response.status(200).json({ menssage: 'Listado de Productos', data: {products, lines} });
      } 
      else {//Sino recibe ningun codigo de producto
        let res = await query.paginate(page, perPage);
        res = res.toJSON();

        let products = res.data.map((item)=>{
          return {
            id:item.id,
            cod_pt: item.cod_pt,
            description: item.description
          }
        })

        let lines = res.data.map((item)=>{
          return {
            cod_pt:item.cod_pt,
            setPoints:[
                {
                line:'L310', 
                temperature: item.l310_sp_temp,
                velocity: item.l310_sp_vel,
                onCrimp: item.l310_oncrimp
              },
              {
                line:'L320', 
                temperature: item.l320_sp_temp,
                velocity: item.l320_sp_vel,
                onCrimp: item.l320_oncrimp
              },
              {
                line:'L330', 
                temperature: item.l330_sp_temp,
                velocity: item.l330_sp_vel,
                onCrimp: item.l330_oncrimp
              },
              {
                line:'L340', 
                temperature: item.l340_sp_temp,
                velocity: item.l340_sp_vel,
                onCrimp: item.l340_oncrimp
              }
            ]
          }
        });
        response.status(200).json({ menssage: 'Listado de Productos', data: {products, lines} });
      }
    } 
    catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(401).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }

  async store({ request, response, auth }) {
    try {
      const user = await auth.getUser()
       let  {           
        cod_pt,
        description,
        l310_sp_temp,
        l310_sp_vel,
        l310_oncrimp,
        l320_sp_temp,
        l320_sp_vel,
        l320_oncrimp,
        l330_sp_temp,
        l330_sp_vel,
        l330_oncrimp,
        l340_sp_temp,
        l340_sp_vel,
        l340_oncrimp 
      } = request.all();

/*       function validarLineas(){
        let res = false;
        this.lineas.forEach(item => {
          if(item.temperatura >=40 && item.temperatura<=70 ) {
            if(item.velocidad > 0 &&  item.velocidad <=100){
              res = true
            }
          }
        });
        return res
      }

      if (validation.fails()) {
        response.status(403).json({ message: "Datos insuficiente" })
      } */
      if (user.rol_id == 1) {
        const product = await BpSetpoints.create({
          cod_pt,
          description,
          l310_sp_temp,
          l310_sp_vel,
          l310_oncrimp,
          l320_sp_temp,
          l320_sp_vel,
          l320_oncrimp,
          l330_sp_temp,
          l330_sp_vel,
          l330_oncrimp,
          l340_sp_temp,
          l340_sp_vel,
          l340_oncrimp
        })
        console.log(product)

/*         try{
          let server1 = await Database.connection('Server1').table('baprueba').insert({ cod_pt: product.cod_pt, sp_temp: product.sp_temp, sp_vel: product.sp_vel, oncrimp: product.oncrimp, description: product.description , created_at: product.created_at , updated_at: product.updated_at})

        }catch(error){
          console.log(error)
          return response.status(400).json({menssage: 'EL producto no pudo se agregado al server 1, comunicarse con el administrador!'})
        }
        try {
          let server2 = await Database.connection('Server2').table('baprueba').insert({ cod_pt: product.cod_pt, sp_temp: product.sp_temp, sp_vel: product.sp_vel, oncrimp: product.oncrimp, description: product.description , created_at: product.created_at , updated_at: product.updated_at}) 
        } catch (error) {
          return response.status(400).json({menssage: 'EL producto no pudo se agregado al server 2, comunicarse con el administrador!'})
        } */
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
/*   async show({ params, request, response, view }) {
  } */

  async update({ params: { id }, request, response, auth }) {
    try {
      const data = request.only([
        "cod_pt",
        "description",
        "l310_sp_temp",
        "l310_sp_vel",
        "l310_oncrimp",
        "l320_sp_temp",
        "l320_sp_vel",
        "l320_oncrimp",
        "l330_sp_temp",
        "l330_sp_vel",
        "l330_oncrimp",
        "l340_sp_temp",
        "l340_sp_vel",
        "l340_oncrimp" 
      ]);

      const user = await auth.getUser();

      if (user.rol_id == 1) {
        const product = await BpSetpoints.find(id);
        product.cod_pt = data.cod_pt || product.cod_pt;
        product.description = data.description   || product.description;
        product.l310_sp_temp = data.l310_sp_temp || product.l310_sp_temp;
        product.l310_sp_vel = data.l310_sp_vel   || product.l310_sp_vel;
        product.l310_oncrimp = data.l310_oncrimp || product.l310_oncrimp;
        product.l320_sp_temp = data.l320_sp_temp || product.l320_sp_temp;
        product.l320_sp_vel = data.l320_sp_vel   || product.l320_sp_vel;
        product.l320_oncrimp = data.l320_oncrimp || product.l320_oncrimp;
        product.l330_sp_temp = data.l330_sp_temp || product.l330_sp_temp;
        product.l330_sp_vel = data.l330_sp_vel   || product.l330_sp_vel;
        product.l330_oncrimp = data.l330_oncrimp || product.l330_oncrimp;
        product.l340_sp_temp = data.l340_sp_temp || product.l340_sp_temp;
        product.l340_sp_vel = data.l340_sp_vel   || product.l340_sp_vel;
        product.l340_oncrimp = data.l340_oncrimp || product.l340_oncrimp;
        await product.save();

/*         try {
          let server1 = await Database.connection('Server1').table('baprueba').update({ cod_pt: product.cod_pt, sp_temp: product.sp_temp, sp_vel: product.sp_vel, oncrimp: product.oncrimp, description: product.description , created_at: product.created_at , updated_at: product.updated_at}).where('cod_pt' , product.cod_pt) 
        } catch (error) {
          return response.status(400).json({menssage: 'El producto editado no se pudo actualizar o no fue encontrado en el server 1'})
        }
        try {
          let server2 = await Database.connection('Server2').table('baprueba').update({ cod_pt: product.cod_pt, sp_temp: product.sp_temp, sp_vel: product.sp_vel, oncrimp: product.oncrimp, description: product.description , created_at: product.created_at , updated_at: product.updated_at}).where('cod_pt' , product.cod_pt)
        } catch (error) {
          return response.status(400).json({menssage: 'El producto editado no se pudo actualizar o no fue encontrado en el server 2'})
        } */
        return response.status(200).json({ menssage: 'Producto actualizado con exito', data: product })
      } else {
        return response.status(401).json({ menssage: 'Usuario sin permisos para realizar la operación' })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no válido' })
      }
      response.status(400).json({
        menssage: "Hubo un error al intentar actualizar el producto",
        id
      })
    }
  }

  async destroy({ params: { id }, request, response, auth }) {
    try {
      const user = await auth.getUser();
      console.log('id:', id)
      if (user.rol_id == 1) {
        const product = await BpSetpoints.findOrFail(id);
        await product.delete();
        
/*         try {
          let server1 = await Database.connection('Server1').table('baprueba').where('cod_pt' , product.cod_pt).delete();
        } catch (error) {
          console.log(error)
          return response.status(400).json({menssage: 'El producto Eliminado no se puedo editar o no fue encontrado en el server 1'})
        }
        try {
          let server2 = await Database.connection('Server2').table('baprueba').where('cod_pt' , product.cod_pt).delete();
        } catch (error) {
          return response.status(400).json({menssage: 'El producto Eliminado no se puedo editar o no fue encontrado en el server 2'})
        } */
        response.status(200).json({ menssage: 'Producto eliminado con exito!' });
        return;
      } else {
        return response.status(403).json({ menssage: "Usuario sin permisos Suficientes" })
      }
    } catch (error) {
      console.log(error)
      return response.status(404).json({
        menssage: "producto a eliminar no encontrado",
        cod_pt
      })
    }
  }
}

module.exports = BpSetpointsController
