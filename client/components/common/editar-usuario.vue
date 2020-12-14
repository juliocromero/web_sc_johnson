<template>
  <v-row justify="center">
    <v-btn icon @click.stop="dialog = true">
      <img src="@/static/iconos/baseline_create_black_18dp.png" alt="create">
    </v-btn>
    <v-dialog v-model="dialog" max-width="50%">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Editar Usuario</v-card-title
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
                <v-col cols="12" md="6" class="d-flex">
                  <div class="mr-5 d-flex align-center">Administrador: </div>
                  <v-switch
                    v-model="usuario.rol_id"
                    color="success"
                    inset
                    hide-details
                    left
                    class="my-0 pb-1 d-flex align-center"
                    :value="usuario.rol_id == 'administrador' ? false : true"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="dialog = false">Cancelar</v-btn>

          <v-btn
            color="green darken-1"
            text
            @click="actualizar_usuario()"
            >Aceptar</v-btn
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
      username: "",
      lastname: "",
      email: "",
      password: null,
      rol_id: false,
    },
  }),
  methods: {
    ...mapMutations(["toggleInfoModal"]),

    async actualizar_usuario() {
      try {
        this.dialog = false;
        let token = Cookies.get("token");
        this.usuario.rol_id == true ? this.usuario.rol_id = 1 : this.usuario.rol_id = 2;
        /* console.log('before:', this.usuario) */
        await axios.put(`user/${this.editar.id}`, this.usuario, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.$emit("reload");
        this.usuario.rol_id == 1 ? this.usuario.rol_id = true : this.usuario.rol_id = false;
        /* console.log('After:', this.usuario) */
        this.toggleInfoModal({
          dialog: true,
          msj: `Usuario: ${this.editar.username} Actualizado correctamente`,
          titulo: "Actualizar Usuario",
          alertType: "success",
        });
      } catch (error) {
        this.toggleInfoModal({
          dialog: true,
          msj: `Ha ocurrido un error al actualizar el usuario`,
          titulo: "Actualizar Usuario",
          alertType: "error",
        });
      }
    },
    async cargarUsuario() {
      let rellenar = { ...this.editar };
      this.usuario = rellenar;
    },
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