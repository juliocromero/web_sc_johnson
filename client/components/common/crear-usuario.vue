<template>
  <v-row justify="start">
    <v-tooltip bottom>
      <template  v-slot:activator="{ on, attrs }">
        <v-btn
          color="#F44336"
          dark
          v-bind="attrs"
          v-on="on"
          class="px-0"
          @click.stop="dialog = true"
        >
          <img src="@/static/iconos/person_add-white-24dp.svg" alt="new">
        </v-btn>
      </template>
      <span>Nuevo Usuario</span>
    </v-tooltip>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Agregar Nuevo Usuario</v-card-title
        >

        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="usuario.username"
                    :rules="nameRules"
                    label="Nombre"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="usuario.lastname"
                    :rules="nameRules"
                    label="Apellido"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="usuario.email"
                    :rules="nameRules"
                    label="Email"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="usuario.password"
                    :rules="nameRules"
                    label="Password"
                    type="password"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="d-flex">
                  <div class="mr-5 d-flex align-center">Administrador: </div>
                  <v-switch
                    v-model="usuario.rol_id"
                    color="success"
                    inset
                    hide-details
                    left
                    class="my-0 pb-1 d-flex align-center"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="toggleDialog">Cancelar</v-btn>

          <v-btn color="green darken-1" text @click="Create_Usuarios_table()"
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
import { mapMutations } from "vuex";
import infoModal from "@/components/common/infoModal";

export default {
  data: () => ({
    dialog: false,
    nameRules: [(v) => !!v || "Este campo es requerido"],
    usuario: {
      username: "",
      lastname: "",
      email: "",
      password: null,
      rol_id: false,
    },
  }),
  methods: {
    ...mapMutations(["toggleInfoModal"]),
    limpiarCampos(){
      this.usuario.username="";
      this.usuario.lastname="";
      this.usuario.email="";
      this.usuario.password=null;
      this.usuario.rol_id = false;
    },
    toggleDialog(){
      this.dialog = false
      this.usuario.username="";
      this.usuario.lastname="";
      this.usuario.email="";
      this.usuario.password=null;
      this.usuario.rol_id = false;
    },
    async Create_Usuarios_table() {
      this.usuario.rol_id ? this.usuario.rol_id = 1 : this.usuario.rol_id = 2
        try {
        let token = Cookies.get("token");
        await axios.post("register", this.usuario, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.usuario.rol_id == 1 ? this.usuario.rol_id = true : this.usuario.rol_id = false
        this.$emit("reload");
        this.dialog = false;
        this.toggleInfoModal({
          dialog: true,
          msj: `Usuario Agregado`,
          titulo: "Usuarios",
          alertType: "success",
        });
        this.limpiarCampos()
      } catch (error) {
        this.toggleInfoModal({
          dialog: true,
          msj: `Ha ocurrido un error al crear el usuario`,
          titulo: "Usuarios",
          alertType: "error",
        });
      } 
    },
  },
};
</script>

<style>
.v-card-titulo {
  background: #f44336;
}
</style>
<style>
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] { -moz-appearance:textfield; }
</style>