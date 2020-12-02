<template>
  <v-row justify="center">
    <v-btn icon @click.stop="dialog = true">
      <img src="@/static/iconos/baseline_create_black_18dp.png" alt="create">
    </v-btn>

    <v-dialog v-model="dialog" max-width="50%">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Editar Producto</v-card-title
        >
        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="producto.codigo"
                    type="number"
                    :rules="nameRules"
                    label="Código"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="producto.sp_temperatura"
                    :rules="nameRules"
                    label="Temperatura"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="producto.sp_velocidad"
                    :rules="nameRules"
                    label="Velocidad de Cinta"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="d-flex">
                  <div class="mr-5 d-flex align-center">Crimper: </div>
                  <v-switch
                    v-model="producto.crimper"
                    color="success"
                    inset
                    hide-details
                    left
                    class="my-0 pb-1 d-flex align-center"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="12">
                  <v-text-field
                    v-model="producto.description"
                    :rules="nameRules"
                    label="Descripción"
                    required
                  ></v-text-field>
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
            @click="Actualizar_Products_table()"
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
    producto: {
      codigo: null,
      sp_temperatura: "",
      sp_velocidad: "",
      crimper:true,
      description: "",
    },
  }),
  methods: {
    ...mapMutations(["toggleInfoModal"]),

    async Actualizar_Products_table() {
      try {
        this.dialog = false;
        let token = Cookies.get("token");
        this.producto.crimper==false ? this.producto.crimper="false" : this.producto.crimper;
        console.log(this.producto)
        await axios.put(`product/${this.editar.id}`, this.producto, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.producto.crimper=="false" ? this.producto.crimper=false : this.producto.crimper;
        this.$emit("reload");
        this.toggleInfoModal({
          dialog: true,
          msj: `Producto: ${this.editar.codigo} Actualizado correctamente`,
          titulo: "Actualizar Producto",
          alertType: "success",
        });
        this.$emit("reload");
      } catch (error) {
        this.toggleInfoModal({
          dialog: true,
          msj: `Ha ocurrido un error al actualizar tu producto`,
          titulo: "Actualizar Producto",
          alertType: "error",
        });
      }
    },
    async rellenarProducto() {
      let rellenar = { ...this.editar };
      this.producto = rellenar;
    },
  },
  mounted() {
    this.rellenarProducto();
  },
};
</script>

<style>
.v-card-titulo {
  background: #f44336;
}
</style>