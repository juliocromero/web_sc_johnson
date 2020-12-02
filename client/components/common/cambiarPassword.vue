<template>
  <v-row justify="start">
    <v-dialog v-model="dialogPassword" width="500">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Cambiar Contraseña</v-card-title
        >
        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12" md="12">
                  <v-text-field
                    v-model="datosPassword.actual_password"
                    label="Contraseña Actual"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    @click:append="show1 = !show1"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="12">
                  <v-text-field
                    v-model="datosPassword.new_password"
                    label="Nueva Contraseña"
                    :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show2 ? 'text' : 'password'"
                    @click:append="show2 = !show2"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="12">
                  <v-text-field
                    v-model="datosPassword.confirm_password"
                    label="Confirmar Nueva Contraseña"
                    :append-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show3 ? 'text' : 'password'"
                    @click:append="show3 = !show3"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-alert
                v-model="AlertCambioPassword"
                dense
                text
                :type="typeAlert"
              >
                {{ mensajeCambioPassword }}
              </v-alert>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="modalPassword"
            >Cancelar</v-btn
          >

          <v-btn color="green darken-1" text @click="cambiarPassword()"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import "material-design-icons-iconfont/dist/material-design-icons.css";
import axios from "~/plugins/axios";
import Cookies from "js-cookie";
import { mapState, mapMutations } from "vuex";

export default {
  data: () => ({
    typeAlert: "",
    AlertCambioPassword: false,
    mensajeCambioPassword: "",
    dialog: false,
    nameRules: [(v) => !!v || "Este campo es requerido"],
    datosPassword: {
      actual_password: "",
      new_password: "",
      confirm_password: ""
    },
    show1: false,
    show2: false,
    show3: false
  }),
  computed: {
    ...mapState(["dialogPassword"]),
  },
  methods: {
    ...mapMutations(["toggleDialogPassword"]),

    modalPassword(){
      this.toggleDialogPassword(false)
      this.datosPassword.actual_password=''
      this.datosPassword.new_password=''
      this.datosPassword.confirm_password=''
    },
    
    async cambiarPassword() {
      let token = Cookies.get("token");
            fetch("http://127.0.0.1:3333/api/v1/change_pass", 
            {
            method: "PUT",
            headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(this.datosPassword),
            })
            .then( response => {
                return response.json()
            })
            .then(data => {
                this.datosPassword.actual_password=""
                this.datosPassword.new_password=""
                this.datosPassword.confirm_password=""

                if(data.menssage === "Constraseña actual Incorrecta")
                {
                    this.typeAlert = "error"
                    this.mensajeCambioPassword = data.menssage
                    this.AlertCambioPassword= true
                }else if(data.menssage === "Las contraseña no coinciden"){
                    this.typeAlert = "error"
                    this.mensajeCambioPassword = data.menssage
                    this.AlertCambioPassword= true
                }else if(data.menssage === "Cambio de contraseña con exito!"){
                    this.typeAlert = "success"
                    this.mensajeCambioPassword = data.menssage
                    this.AlertCambioPassword= true
                }})
            .catch(error => console.error('Error: ',error));


      /*  this.mensajeCambioPassword = "error.menssage"
                this.errorCambioPassword= true */
    },
  },
  watch: {
    AlertCambioPassword : function() {
      if(this.AlertCambioPassword){
        setTimeout(() => {
          this.AlertCambioPassword = false
        }, 2500);
      }
    }
  }
};
</script>

<style>
.v-card-titulo {
  background: #f44336;
}
</style>