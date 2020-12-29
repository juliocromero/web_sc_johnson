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
          <img src="@/static/iconos/baseline_add_white_24dp.png" alt="plus">
        </v-btn>
      </template>
      <span>Agregar Producto</span>
    </v-tooltip>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Crear producto</v-card-title
        >

        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="producto.cod_pt"
                    type="number"
                    :rules="nameRules"
                    label="Código"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="producto.sp_temp"
                    :rules="nameRules"
                    label="Temperatura"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="producto.sp_vel"
                    :rules="nameRules"
                    label="Velocidad de Cinta"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="d-flex">
                  <div class="mr-5 d-flex align-center">Válvula Crimper: </div>
                  <v-switch
                    v-model="producto.oncrimp"
                    color="success"
                    inset
                    hide-details
                    left
                    class="my-0 pb-1 d-flex align-center"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="12">
                  <v-textarea
                    v-model="producto.description"
                    :rules="nameRules"
                    label="Descripción"
                    required
                    rows="3"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="toggleDialog">Cancelar</v-btn>

          <v-btn color="green darken-1" text @click="Create_Products_table()"
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

export default {
  data: () => ({
    dialog: false,
    nameRules: [(v) => !!v || "Este campo es requerido"],
    producto: {
      cod_pt: null,
      sp_temp: "",
      sp_vel: "",
      oncrimp:true,
      description: "",
    },
  }),
  methods: {
    ...mapMutations(["toggleInfoModal"]),
    toggleDialog(){
      this.dialog = false
      this.producto.cod_pt=null;
      this.producto.sp_temp="";
      this.producto.sp_vel="";
      this.producto.oncrimp=true;
      this.producto.description="";
    },
    async Create_Products_table() {
      try {
        this.dialog = false;
        let token = Cookies.get("token");
        await axios.post("product", this.producto, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.$emit("reload");
        this.toggleInfoModal({
          dialog: true,
          msj: `Producto agregado correctamente`,
          titulo: "Agregar Producto",
          alertType: "success",
        });
        this.producto.cod_pt=null;
        this.producto.sp_temp="";
        this.producto.sp_vel="";
        this.producto.oncrimp=true;
        this.producto.description="";
      } catch (error) {
        this.toggleInfoModal({
          dialog: true,
          msj: `Ha ocurrido un error al crear el producto`,
          titulo: "Agregar Producto",
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