<template>
  <v-row justify="start">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="#F44336"
          dark
          v-bind="attrs"
          v-on="on"
          class="px-0 add__group"
          @click="show"
        >
          <img src="@/static/iconos/add_group.svg" alt="plus" />
        </v-btn>
      </template>
      <span>Crear nuevo grupo</span>
    </v-tooltip>

    <v-dialog v-model="dialog" width="600">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Crear Grupo</v-card-title
        >

        <v-card-text class="pb-0">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-container class="py-0">
              <v-row>
                <v-col cols="12" class="pb-0">
                  <v-text-field
                    v-model="new_group.nombre"
                    :rules="[rules.required]"
                    label="Nombre"
                    required
                    dense
                    ref="cod_pt"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="pb-0">
                  <v-text-field
                    v-model="new_group.familia"
                    label="Familia"
                    :rules="[rules.required]"
                    required
                    dense
                  />
                </v-col>
              </v-row>
              <v-row> 
                <v-col cols="12" class="pb-0">
                  <v-text-field
                    v-model="new_group.t_maxlmp"
                    type="number"
                    :rules="[rules.required]"
                    label="T.Max"
                    required
                    dense
                  ></v-text-field>                  
                </v-col>
              </v-row>
            </v-container>
            <div :class="showMsg ? 'my-0':'my-5'"><p v-if="showMsg" class="error--text ml-4 my-0">Al menos una línea debe contener datos correctos</p></div>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="toggleDialog">Cancelar</v-btn>

          <v-btn color="green darken-1" :loading="loading" text @click="add_group"
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
    showMsg:false,
    loading:false,
    valid: true,
    dialog: false,
    nameRules: [(value) => !!value || "Este campo es requerido"],
    new_group: {
      nombre: "",
      familia: "",
      t_maxlmp:null
    },
    headers:[
      { text: 'Líneas', value: 'linea', sortable: false, class:'my_table_style', align:'center' },
      { text: 'Temperatura', value: 'temperatura', sortable: false, class:'my_table_style', align:'center', width:'150px' },
      { text: 'Velocidad', value: 'velocidad', sortable: false, class:'my_table_style', align:'center', width:'150px' },
      { text: 'V.Crimper', value: 'crimper', sortable: false, class:'my_table_style', align:'center' },
    ],
    lineas:[
      { linea:"L310", temperatura:"", velocidad:"", crimper:false },
      { linea:"L320", temperatura:"", velocidad:"", crimper:false },
      { linea:"L330", temperatura:"", velocidad:"", crimper:false },
      { linea:"L340", temperatura:"", velocidad:"", crimper:false },
    ],
    rules: {
      required: (value) => !!value || "Requerido.",
      minTemp: (value) => value >= 40 || "Valor mínimo 40",
      maxTemp: (value) => value <= 70 || "Valor máximo 70",
      minVel: (value) => value >= 0 || "Valor mínimo 0",
      maxVel: (value) => value <= 100 || "Valor máximo 100",
    },
  }),
  methods: {
    ...mapMutations(["toggleInfoModalCRUD","toggleInfoModal"]),
    show(){
      this.setAll = true;
      this.dialog = true;
    },
    toggleDialog() {
      this.dialog = false;
      this.lineas = [
        { linea:"L310", temperatura:"", velocidad:"", crimper:false },
        { linea:"L320", temperatura:"", velocidad:"", crimper:false },
        { linea:"L330", temperatura:"", velocidad:"", crimper:false },
        { linea:"L340", temperatura:"", velocidad:"", crimper:false },
      ];
      this.$refs.form.reset();
    },
    async add_group() {
      try {
       if(this.$refs.form.validate()){
          this.showMsg = false;         
          let token = Cookies.get("token");
          this.loading = true;
          await axios.post("washing_rules/groups", this.new_group , {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res)=>{
            this.$emit("reload");
            this.toggleInfoModalCRUD({
              dialog: true,
              msj: `Grupo ${this.new_group.nombre} agregado correctamente`,
              // s1:{ 
              //   status:res.data.server1.status, 
              //   msj:res.data.server1.message 
              //   },
              // s2:{ 
              //   status:res.data.server2.status, 
              //   msj:res.data.server2.message 
              //   },
              titulo: "Agregar Grupo",
              alertType: "success",
            });
            this.dialog = false;
            this.toggleDialog()
            this.loading = false;
          });
       } 
      } catch (error) {
          if(error.response){
              this.toggleInfoModal({
              dialog: true,
              msj: `${error.response.data.message}`,
              titulo: "Agregar Grupo",
              alertType: "error",
              });
              console.error('POST creating group error:', error.response.data.message)
              this.loading = false;
          }
          else{
              this.toggleInfoModal({
              dialog: true,
              msj: `Ha ocurrido un error al crear el grupo`,
              titulo: "Agregar Grupo",
              alertType: "error",
              });
              this.loading = false;
        } 
      }
    },
  },
  mounted(){
  }
};
</script>

<style>
.v-card-titulo {
  background: #f44336;
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
.my_table_style{
  background-color: #ffe4d5;
}
.v-text-field.v-text-field--enclosed .v-text-field__details {
    margin-bottom: 0px!important;
}
.v-btn:not(.v-btn--round).v-size--default{
  min-width: 0px;
}
.add__group{
  width: 40px;
}
</style>