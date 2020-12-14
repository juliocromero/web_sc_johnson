<template>
  <v-row justify="center">
    <v-btn icon @click.stop="dialog = true">
      <img src="@/static/iconos/vpn_key-black-18dp.svg" alt="create">
    </v-btn>
    <v-dialog v-model="dialog" width="400">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text" >
            Reestablecer Contraseña de:
        </v-card-title>
        <v-card-text class="pb-0">
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12" >
                    <v-card flat color="grey lighten-2" class="pl-0 d-flex">
                        <img src="@/static/iconos/person-48dp.svg" alt="create">
                        <v-card-title >{{usuario.email}}</v-card-title> 
                    </v-card>
                </v-col>
                <v-col cols="12">
                    <v-text-field
                        v-model="usuario.new_password"
                        :rules="nameRules"
                        label="Nueva Contraseña:"
                        required
                    ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>

          <v-btn color="red" text @click="dialog = false">Cancelar</v-btn>
          <v-btn
            class="mr-5"
            color="green darken-1"
            text
            @click="actualizar_password()"
            >Reestablecer Contraseña</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import axios from "~/plugins/axios";
import Cookies from "js-cookie";
import { mapMutations } from "vuex";

export default {
  props: {
    editar: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    dialog: false,
    nameRules: [(v) => !!v || "Este campo es requerido"],
    usuario: {
      email: "",
      new_password: "",
    },
  }),
  methods: {
    ...mapMutations(["toggleInfoModal"]),

    async actualizar_password() {
        console.log(this.usuario)
        try {
        this.dialog = false;
        let token = Cookies.get("token");
        await axios.put(`restore_pass`, this.usuario, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.$emit("reload");
        this.toggleInfoModal({
          dialog: true,
          msj: `Usuario: ${this.editar.username} Actualizado correctamente`,
          titulo: "Reestablecer Contraseña",
          alertType: "success",
        });
      } catch (error) {
        this.toggleInfoModal({
          dialog: true,
          msj: `Ha ocurrido un error al reestablecer la contraseña`,
          titulo: "Reestablecer Contraseña",
          alertType: "error",
        });
      } 
    },
    async cargarUsuario() {
      let rellenar = { ...this.editar };
      this.usuario = {email: rellenar.email, new_password:""};
    } ,
  },
  mounted() {
    this.cargarUsuario();
  },
};
</script>

<style>
.v-card-titulo {
  background: #f44336;
}
</style>