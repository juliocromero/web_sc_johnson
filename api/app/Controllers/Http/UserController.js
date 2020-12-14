'use strict'
const User = use("App/Models/User");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const Hash = use('Hash');
const { validate } = use('Validator');
class UserController {

  async index({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      var query = User.query();
      var {
        page,
        perPage,
      } = request.all()
      //seteo valores por defectos
      page = page || 1
      perPage = perPage || 10

      let users = await User.query().with('rol').paginate(page, perPage);
      users = users.toJSON()
      var arrUsers = users.data.map(item => {
        return {
          "id": item.id,
          "username": item.username,
          "lastname": item.lastname,
          "email": item.email,
          "rol_id": item.rol.tipo
        }
      })
      let resp = await Promise.all(arrUsers)
      users.data = resp
      response.status(200).json({ menssage: 'Listado de Usuarios', data: users })
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
      let { username, lastname, password, email, rol_id } = request.all();

      const rules = {
        username: 'required',
        lastname: 'required',
        password: 'required',
        email: 'required',
        rol_id: 'required'

      }
      let validation = await validate({ username, lastname, password, email, rol_id }, rules)
      if (validation.fails()) {
        response.status(403).json({ message: "Datos insuficiente" })
      }
      if (user.rol_id == 1) {
        const users = await User.create({
          username,
          lastname,
          password,
          email,
          rol_id
        })
        return response.status(200).json({ message: 'Usuario creado con exito' })
      } else {
        return response.status(400).json({ message: 'Usuario sin permisos suficiente' })
      }

    } catch (error) {
      console.log(error)
      return response.status(400).json({ menssage: 'Hubo un error al intentar realizar la operación' })

    }
  }
  async login({ request, response, auth }) {
    try {
      const { email, password } = request.all();
      let validationUser = await User.findBy('email', email);
      validationUser = validationUser.toJSON();
      console.log(validationUser)
     if(validationUser != null){
       delete validationUser.password
     }
     // let resp = await Promise.all(arrUser)
      const token = await auth.attempt(email, password)
      const resCustom = new Response(true, 'Logueado con exito', token.token)
      resCustom.data = validationUser
      response.status(200).json(resCustom);
    } catch (error) {
      console.log(error.message)
      var resCustom = ''
      if (error.message.includes('Cannot verify user password')) {
        resCustom = new Response(false, 'Contraseña incorrecta');
      } else if (error.message.includes('Cannot find user')) {
        resCustom = new Response(false, 'Usuario no encontrado');
      } else {
        resCustom = new Response(false, 'Hubo un error al procesar la solicitud');
      }
      return response.status(401).json(resCustom);
    }
  }
  async loginToken({ auth, response }) {
    try {
      const user = await auth.getUser();
      if (user) {
        let data = { email: user.email, password: user.password }
        return response.status(200).json(data)
      }
    } catch (error) {
      console.log(error)
      response.status(400).json({ menssage: 'Hubo un error al realizar la operación' })
    }

  }
  async update({ auth, request, response }) {
    try {
      const user = await auth.getUser();
      const { actual_password, new_password, confirm_password } = request.all();
      const validationpassw = await Hash.verify(actual_password, user.password);
      if (validationpassw == false) {
        return response.status(400).json({ menssage: 'Constraseña actual Incorrecta' })
      }
      if (new_password != confirm_password) {
        return response.status(400).json({ menssage: 'Las contraseña no coinciden' })
      }
      user.password = new_password
      await user.save()
      return response.status(200).json({ menssage: 'Cambio de contraseña con exito!' })
    } catch (error) {
      console.log(error)
      return response.status(400).json({ menssage: 'Hubo un error al intentar cambiar la contraseña!' })
    }
  }

  //restablezco la contrasaseña solo pasandole el mail y la nueva contraseña 
  async restore({ auth, request, response }) {
    try {
      const user = await auth.getUser();
      const { email, new_password } = request.all();
      var userEmail = await User.findByOrFail('email', email)
      if (user.rol_id == 1) {
        userEmail.password = new_password
        userEmail.save()
        return response.status(200).json({ menssage: `Constraseña restablecida con exito al mail ${email}` })
      } else {
        return response.status(400).json({ menssage: 'Usuario sin permiso suficiente para realizar la operación' })
      }

    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      if (error.name == 'ModelNotFoundException') {
        return response.status(400).json({ menssage: 'El Mail ingresado no existe!' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al intentar reestablecer la contraseña' })
    }
  }

  async edit({ params: { id }, request, response, auth }) {
    try {
      const user = await auth.getUser();
      const users = await User.find(id);
      const data = request.only(["username", "lastname", "password", "email", "rol_id"]);

      if (user.rol_id == 1) {

        users.username = data.username || users.email;
        users.lastname = data.lastname || users.lastname;
        users.password = data.password || users.password;
        users.email = data.email || users.email;
        users.rol_id = data.rol_id || users.rol_id;

        await users.save();
        response.status(200).json({ menssage: 'Usuario modificado con exito', users });
      } else {
        return response.status(400).json({ menssage: 'Usuario sin permiso suficiente para realizar la operación' })
      }

    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(400).json({ menssage: 'Hubo un error al realizar la operación' })
    }

  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response, auth }) {
    const id = params.id

    const user = await auth.getUser();
    if (user.rol_id == 1) {
      try {
        const user = await User.findOrFail(id);
        await user.delete();
        response.status(200).json({ menssage: 'usuario borrado con exito!' });
        return;
      } catch (error) {
        response.status(404).json({
          message: "Usuario a eliminar no encontrado",
          id
        });
        return;
      }
    } else {
      response.status(403).json({ message: "Usuario sin permisos suficientes" });
      return;
    }
  }
}

module.exports = UserController
