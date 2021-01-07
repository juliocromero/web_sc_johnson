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
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="producto.cod_pt"
                    type="number"
                    :rules="[rules.required]"
                    label="Código"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="producto.sp_temp"
                    :rules="[rules.minTemp, rules.maxTemp,rules.required]"
                    label="Temperatura"
                    type="number"
                    required
                    maxlength="4"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="producto.sp_vel"
                    :rules="[rules.minVel, rules.maxVel, rules.required]"
                    label="Velocidad de Cinta"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="d-flex">
                  <div class="mr-5 d-flex align-center">Crimper: </div>
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
                  <v-text-field
                    v-model="producto.description"
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

          <v-btn color="red" text @click="toggleDialog">Cancelar</v-btn>

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
    valid: true,
    dialog: false,
    producto: {
      cod_pt: null,
      sp_temp: "",
      sp_vel: "",
      oncrimp:true,
      description: "",
    },
    rules: {
            required: value => !!value || 'Requerido.',
            minTemp: value => value >= 40 || 'Valor mínimo 40',
            maxTemp: value => value <= 70 || 'Valor máximo 70',
            minVel: value => value >= 0 || 'Valor mínimo 0',
            maxVel: value => value <= 100 || 'Valor máximo 100',
          }
  }),
  methods: {
    ...mapMutations(["toggleInfoModal"]),
    toggleDialog(){
      this.dialog = false;
      this.producto = { ...this.editar };
    },
    async Actualizar_Products_table() {
      try {
        this.$refs.form.validate();
        if(this.producto.sp_temp <= 70 && this.producto.sp_temp >= 40 && this.producto.sp_vel  <= 100 && this.producto.sp_vel  >= 0 && this.producto.cod_pt !=""){
            let token = Cookies.get("token");
            this.producto.description=="" ? this.producto.description="NULL" : this.producto.description;
            this.producto.oncrimp==false ? this.producto.oncrimp="false" : this.producto.oncrimp; 
            this.producto.sp_temp = parseFloat(this.producto.sp_temp).toFixed(1);
            this.producto.sp_vel = parseFloat(this.producto.sp_vel).toFixed(1);

            await axios.put(`product/${this.editar.id}`, this.producto, {
              headers: { Authorization: `Bearer ${token}` },
            });

            this.producto.oncrimp=="false" ? this.producto.oncrimp=false : this.producto.oncrimp;
            this.$emit("reload");
            this.dialog = false;
            this.toggleInfoModal({
              dialog: true,
              msj: `Producto: ${this.editar.cod_pt} Actualizado correctamente`,
              titulo: "Actualizar Producto",
              alertType: "success",
            });
        }
        
/*         if(this.producto.sp_temp < 40 || this.producto.sp_vel < 40){
          this.producto.sp_temp = this.editar.sp_temp
          this.producto.sp_vel = this.editar.sp_vel
          this.toggleInfoModal({
            dialog: true,
            msj: `El valor minimo de velocidad y temperaatura permitido es: 40`,
            titulo: "Actualizar Producto",
            alertType: "error",
            });
        }
        
        if(this.producto.sp_temp > 70 || this.producto.sp_vel > 70){
          this.producto.sp_temp = this.editar.sp_temp
          this.producto.sp_vel = this.editar.sp_vel
          this.toggleInfoModal({
          dialog: true,
          msj: `El valor maximo de velocidad o temperaatura permitido es: 70`,
          titulo: "Actualizar Producto",
          alertType: "error",
          });
        } */

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