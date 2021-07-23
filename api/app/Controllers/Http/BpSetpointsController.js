'use strict'
const BpSetpoints = use("App/Models/BpSetpoints");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const Database = use('Database');
const { validate } = use('Validator');
var moment = require('moment');

class BpSetpointsController {
//test
  async index({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      let query = BpSetpoints.query();

      let {
        options,
        cod_pt
      } = request.all()
      options = JSON.parse(options);

      //seteo valores por defectos
      var sortBy = options.sortBy;
      var sortDesc = options.sortDesc;
      var page = options.page || 1;
      var perPage = options.itemsPerPage || 10;

      //Si recibe un codigo de producto
      if (cod_pt) {
        query.where('cod_pt', cod_pt)
      }

      if (sortBy.length == 0) {
        sortBy.push('cod_pt')
      }
 
      sortBy.forEach((it, i) => {
        query.orderBy(it, sortDesc[i] || false ? 'DESC' : 'ASC')
      });

      let res = await query.paginate(page, perPage);
      res = res.toJSON();

      let productsPromesas = res.data.map((item)=>{
        return {
          id:item.id,
          cod_pt: item.cod_pt,
          description: item.description
        }
      })

      let products = await Promise.all(productsPromesas)

      let linesPromesas = res.data.map((item)=>{
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

      let lines = await Promise.all(linesPromesas)

      response.status(200).json({ message: 'Listado de Productos', data: {products, lines, total: res.total} });
      
    } 
    catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(401).json({ message: 'Usuario no Valido' })
      }
      response.status(404).json({ message: 'Hubo un error al realizar la operación', error });
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

      if (!this.isLinesDataOk(l310_sp_temp,l310_sp_vel) &&
          !this.isLinesDataOk(l320_sp_temp,l320_sp_vel) &&
          !this.isLinesDataOk(l330_sp_temp,l330_sp_vel) &&
          !this.isLinesDataOk(l340_sp_temp,l340_sp_vel)
      ){
        return response.status(400).json({ message: "Datos insuficientes" })
      }

      let codigoExistente = await BpSetpoints.findBy('cod_pt', cod_pt)

      if (codigoExistente) {
        return response.status(400).json({ message: "El código ya existe." })
      }
      else{
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

          // //Sincronizando con Server 1
          // try{
          //   let server1 = await Database.connection('Server1')
          //   .table('bp_setpoints')
          //   .insert({ 
          //     cod_pt :product.cod_pt,
          //     description  : product.description,
          //     l310_sp_temp : product.l310_sp_temp,
          //     l310_sp_vel  : product.l310_sp_vel,
          //     l310_oncrimp : product.l310_oncrimp,
          //     l320_sp_temp : product.l320_sp_temp,
          //     l320_sp_vel  : product.l320_sp_vel,
          //     l320_oncrimp : product.l320_oncrimp,
          //     l330_sp_temp : product.l330_sp_temp,
          //     l330_sp_vel  : product.l330_sp_vel,
          //     l330_oncrimp : product.l330_oncrimp,
          //     l340_sp_temp : product.l340_sp_temp,
          //     l340_sp_vel  : product.l340_sp_vel,
          //     l340_oncrimp : product.l340_oncrimp,
          //     created_at: product.created_at, 
          //     updated_at: product.updated_at,
          //   });         
          // }catch(error){
          //   console.log('Sync error on server 1:', error)
          //   return response.status(400).json({message: 'EL producto no pudo se agregado al server 1, comuníquese con el administrador.'});
          // };

          // //Sincronizando con Server 2
          // try {
          //   let server2 = await Database.connection('Server2')
          //   .table('bp_setpoints')
          //   .insert({ 
          //     cod_pt :product.cod_pt,
          //     description  : product.description,
          //     l310_sp_temp : product.l310_sp_temp,
          //     l310_sp_vel  : product.l310_sp_vel,
          //     l310_oncrimp : product.l310_oncrimp,
          //     l320_sp_temp : product.l320_sp_temp,
          //     l320_sp_vel  : product.l320_sp_vel,
          //     l320_oncrimp : product.l320_oncrimp,
          //     l330_sp_temp : product.l330_sp_temp,
          //     l330_sp_vel  : product.l330_sp_vel,
          //     l330_oncrimp : product.l330_oncrimp,
          //     l340_sp_temp : product.l340_sp_temp,
          //     l340_sp_vel  : product.l340_sp_vel,
          //     l340_oncrimp : product.l340_oncrimp,
          //     created_at: product.created_at, 
          //     updated_at: product.updated_at,
          //   });
          // } catch (error) {
          //   console.log('Sync error on server 2:', error)
          //   return response.status(400).json({message: 'EL producto no pudo se agregado al server 2, comuníquese con el administrador.'})
          // }
          return response.status(200).json({ message: 'Producto creado con exito', data: product })
        } 
        else {
          return response.status(403).json({ message: 'Usuario no válido' })
        }
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
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */

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

      //Validamos que al menos una línea tenga los datos correctos
      if (!this.isLinesDataOk(data.l310_sp_temp, data.l310_sp_vel, data.l310_oncrimp) &&
          !this.isLinesDataOk(data.l320_sp_temp, data.l320_sp_vel, data.l320_oncrimp) &&
          !this.isLinesDataOk(data.l330_sp_temp, data.l330_sp_vel, data.l330_oncrimp) &&
          !this.isLinesDataOk(data.l340_sp_temp, data.l340_sp_vel, data.l340_oncrimp)
      ){
        return response.status(400).json({ message: "Datos insuficientes" });
      }

      let codigoExistente = await BpSetpoints.findBy('cod_pt', data.cod_pt);

      if (false) {
        return response.status(400).json({ message: "El código ya existe." });
      }
      else{
        // console.log('pasa aqui')
        if (user.rol_id == 1) {
          const product = await BpSetpoints.findOrFail(id);
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
  
          // //Sincronizando con Server 1
          // try {
          //   let server1 = await Database.connection('Server1')
          //   .table('bp_setpoints')
          //   .update({ 
          //     cod_pt :product.cod_pt,
          //     description  : product.description,
          //     l310_sp_temp : product.l310_sp_temp,
          //     l310_sp_vel  : product.l310_sp_vel,
          //     l310_oncrimp : product.l310_oncrimp,
          //     l320_sp_temp : product.l320_sp_temp,
          //     l320_sp_vel  : product.l320_sp_vel,
          //     l320_oncrimp : product.l320_oncrimp,
          //     l330_sp_temp : product.l330_sp_temp,
          //     l330_sp_vel  : product.l330_sp_vel,
          //     l330_oncrimp : product.l330_oncrimp,
          //     l340_sp_temp : product.l340_sp_temp,
          //     l340_sp_vel  : product.l340_sp_vel,
          //     l340_oncrimp : product.l340_oncrimp,
          //     created_at: product.created_at, 
          //     updated_at: product.updated_at,
          //   }).where('cod_pt', product.cod_pt);
          // } catch (error) {
          //   console.log('Sync error on server 1:', error)
          //   return response.status(400).json({message: 'El producto editado no se pudo actualizar o no fue encontrado en el server 1'});
          // }

          // //Sincronizando con Server 2
          // try {
          //   let server2 = await Database.connection('Server2')
          //   .table('bp_setpoints')
          //   .update({ 
          //     cod_pt :product.cod_pt,
          //     description  : product.description,
          //     l310_sp_temp : product.l310_sp_temp,
          //     l310_sp_vel  : product.l310_sp_vel,
          //     l310_oncrimp : product.l310_oncrimp,
          //     l320_sp_temp : product.l320_sp_temp,
          //     l320_sp_vel  : product.l320_sp_vel,
          //     l320_oncrimp : product.l320_oncrimp,
          //     l330_sp_temp : product.l330_sp_temp,
          //     l330_sp_vel  : product.l330_sp_vel,
          //     l330_oncrimp : product.l330_oncrimp,
          //     l340_sp_temp : product.l340_sp_temp,
          //     l340_sp_vel  : product.l340_sp_vel,
          //     l340_oncrimp : product.l340_oncrimp,
          //     created_at: product.created_at, 
          //     updated_at: product.updated_at,
          //   }).where('cod_pt' , product.cod_pt);
          // } catch (error) {
          //   console.log('Sync error on server 2:', error);
          //   return response.status(400).json({message: 'El producto editado no se pudo actualizar o no fue encontrado en el server 2'});
          // }
          return response.status(200).json({ message: 'Producto actualizado con exito', data: product });
          } else {
          return response.status(403).json({ message: 'Usuario sin permisos para realizar la operación' });
        }
      };
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

  async destroy({ params: { id }, request, response, auth }) {
    try {
      const user = await auth.getUser();
      console.log('id:', id)
      if (user.rol_id == 1) {
        const product = await BpSetpoints.findOrFail(id);
        await product.delete();
        
        // //Sincronizando con Server 1
        // try {
        //   let server1 = await Database.connection('Server1')
        //   .table('bp_setpoints')
        //   .where('cod_pt', product.cod_pt)
        //   .delete();
        // } catch (error) {
        //     console.log('Deleting error on Server 1:', error);
        //     return response.status(400).json({message: 'No fue posible eliminar el producto en el server 1, comuníquese con el administrador.'})
        // }
        // //Sincronizando con Server 2
        // try {
        //   let server2 = await Database.connection('Server2')
        //   .table('bp_setpoints')
        //   .where('cod_pt', product.cod_pt)
        //   .delete();
        // } catch (error) {
        //   console.log('Deleting error on Server 2:', error);
        //   return response.status(400).json({message: 'No fue posible eliminar el producto en el server 2, comuníquese con el administrador.'})
        // }
        response.status(200).json({ message: '¡Producto eliminado con éxito!' });
        return;
      } 
      else {
        return response.status(403).json({ message: "Usuario no válido" })
      }
    } catch (error) {
      console.log(error)
      return response.status(404).json({
        message: "El producto indicado no existe.",
        cod_pt
      })
    }
  }

//METHODS
 async isLinesDataOk(temp, vel, onCrimp){
    if(temp != "" && vel != "" && onCrimp != null){
      return true
    }else{
      false
    }
  };

}

module.exports = BpSetpointsController
