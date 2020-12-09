<template>
  <div class="fondo">
    <div class="form">
      <v-form>
        <v-container>
          <v-img class="login" src="iconos/logo-red.svg" />
          <v-row
            align="center"
            justify="center"
            class="lightbox white--text pa-4 fill-height formulario"
          >
            <v-col cols="12" md="12">
              <v-text-field 
              :rules="[rules]" 
              v-model="username" 
              :counter="50" 
              label="Email"
              append-outer-icon="mdi-email"
              required
              >
              </v-text-field>
            </v-col>

            <v-col cols="12" md="12">
              <v-text-field
                :rules="[rules]"
                v-model="password"
                :counter="20"
                type="password"
                label="Contraseña"
                required
                append-outer-icon="mdi-lock"
                @keyup.enter="ingresar()"
              ></v-text-field>
              <v-alert
                v-model="dialog"
                dense
                outlined
                type="error"
                class="mb-0 mt-6"
              >
                {{alertError}}
              </v-alert>
            </v-col>
          </v-row>
          <div class="mb-5 mt-0 ingresar">
            <v-btn width="100%" small color="red"  dark @click="ingresar()" :disabled="btnIngresar">Ingresar</v-btn>
          </div>
        </v-container>
      </v-form>
    </div>
  </div>
</template>

<script>
import "material-design-icons-iconfont/dist/material-design-icons.css";
import cookie from "cookie";
import Cookies from "js-cookie";
import axios from "../plugins/axios";
import { mapMutations, mapState } from "vuex";
export default {
  layout: "login",
  data() {
    return {
      btnIngresar:false,
      rules: value => !!value || 'Este campo es obligatorio',
      alertError:"",
      dialog:false,
      password: "",
      username: ""
    };
  },
  middleware: 'AUTH',
  methods: {
    ...mapMutations(["SET_AUTH","setUser"]),
    async ingresar() {
        await axios 
          .post("login", { email: this.username, password: this.password })
          .then(res => {
          let token = res.data.datos;
          this.setUser(res.data.data)
          this.SET_AUTH(token)
        }).catch(error =>{
          console.log(error.response)
          this.alertError = error.response.data.feedback.mensaje
          this.dialog = true
        })

    },
    async conexion(){
      await axios
        .get('/')
        .then(res =>{
         return console.log(res.status)
        })
        .catch(error => {
          this.alertError = "No hay conexión con el servidor"
          this.dialog = true
          this.btnIngresar = true
        })
    }
  },
  created(){ 
   this.conexion()
  },
  computed:{...mapState(['user'])}
};
</script>

<style scoped>
.create {
  font-size: 3vh;
  color: white;
}
.ingresar {
  width: 100%;
}

.fondo {
  background: rgb(255, 90, 90);
  background: linear-gradient(
    0deg,
    rgb(255, 44, 44) 50%,
    rgba(255, 255, 255, 1) 50%
  );
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;

  opacity: 0.9;
}
.img {
  position: fixed;
  width: 100%;
  height: 100vh;
}
.form {
  z-index: 100;
}
.login {
  width: 40vh;
  height: 200px;
  margin: 0px auto;
  margin-top: 0px;
  top: 10px;
}
.formulario {
  opacity: 0.9;
}
.container {
  align-content: center;
  text-align: center;
  align-self: center;
  justify-self: center;
  position: relative;
  top: 10vh;
  width: 80vh;
  background: rgb(247, 247, 247);
  -webkit-box-shadow: -2px 4px 30px 0px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: -2px 4px 30px 0px rgba(0, 0, 0, 0.75);
  box-shadow: -2px 4px 30px 0px rgba(0, 0, 0, 0.75);
  opacity: 0.9;
  border-radius: 10px;
  margin-bottom: 10vh;
}
@media (max-width: 700px) {
  .container {
    align-content: center;
    top: 5vh;

    margin-bottom: 5vh;
    width: 80%;
  }
}
</style>
<style>