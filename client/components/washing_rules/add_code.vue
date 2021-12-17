<template>
  <v-row justify="start">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="#F44336"
          dark
          v-bind="attrs"
          v-on="on"
          class="px-0"
          @click="show"
        >
          <img src="@/static/iconos/baseline_add_white_24dp.png" alt="plus" />
        </v-btn>
      </template>
      <span>Crear nuevo código</span>
    </v-tooltip>

    <v-dialog v-model="dialog" width="600">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Crear código</v-card-title
        >

        <v-card-text class="pb-0">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-container class="py-0">
              <v-row>
                <v-col cols="12" class="pb-1">
                  <v-text-field
                    v-model="new_code.id"
                    type="number"
                    :rules="[rules.required]"
                    label="Código"
                    required
                    dense
                    ref="cod_pt"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="py-1">
                  <v-text-field
                    v-model="new_code.nombre"
                    label="Nombre"
                    :rules="[rules.required]"
                    required
                    dense
                    rows="1"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col class="py-1">
                  <v-select
                    v-model="new_code.grupo"
                    :items="groups"
                    item-text="nombre"
                    item-value="id"
                    label="Asignar a un grupo"
                    class="py-0"
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
            <div :class="showMsg ? 'my-0':'my-5'"><p v-if="showMsg" class="error--text ml-4 my-0">Al menos una línea debe contener datos correctos</p></div>
          </v-form>
        </v-card-text>

        <v-card-actions class="pt-0">
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="toggleDialog">Cancelar</v-btn>

          <v-btn color="green darken-1" :loading="loading" text @click="add_code"
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
    setAll:true,
    setAllItems:{ lineas:"Todas", temperatura:"", velocidad:"", crimper:false }, 
    valid: true,
    dialog: false,
    tempValidation:{},
    velValidation:{},
    nameRules: [(value) => !!value || "Este campo es requerido"],
    groups:[],
    new_code: {
      id: null,
      nombre: "",
      grupo:null
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
    show() {
      this.setAll = true;
      this.dialog = true;
      this.getGroups();
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
    async add_code() {
      try {
       if(this.$refs.form.validate()){
          this.showMsg = false;         
          let token = Cookies.get("token");
          this.loading = true;
          await axios.post("washing_rules/codes", this.new_code , {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res)=>{
            this.$emit("reload");
            this.toggleInfoModalCRUD({
              dialog: true,
              msj: `Código ${this.new_code.id} agregado correctamente`,
              // s1:{ 
              //   status:res.data.server1.status, 
              //   msj:res.data.server1.message 
              //   },
              // s2:{ 
              //   status:res.data.server2.status, 
              //   msj:res.data.server2.message 
              //   },
              titulo: "Agregar Código",
              alertType: "success",
            });
            this.dialog = false;
            this.loading = false;
          });
       } 
      } catch (error) {
          if(error.response){
              this.toggleInfoModal({
              dialog: true,
              msj: `${error.response.data.message}`,
              titulo: "Agregar Código",
              alertType: "error",
              });
              console.error('POST adding error:', error.response.data.message)
              this.loading = false;
          }
          else{
              this.toggleInfoModal({
              dialog: true,
              msj: `Ha ocurrido un error al crear el producto`,
              titulo: "Agregar Producto",
              alertType: "error",
              });
              this.loading = false;
        } 
      }
    },
    async getGroups(){
      try {
        let token = Cookies.get("token");
          await axios.get("washing_rules/groups", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              options: {
                page: 1,
                itemsPerPage: 10,
                sortBy: [],
                sortDesc: [],
                groupBy: [],
                groupDesc: [],
                mustSort: false,
                multiSort: false,
                all:true
              }, 
            }
          }).then((res)=>{
            console.log('GET_GROUPS:', res.data);
            this.groups = res.data.data.data;
          });
      } catch (error) {
        console.log('ERROR_GET_GROUPS:', error);
      }
    }
  },
};
</script>

<style>
.v-card-titulo {
  background: #f44336;
}
</style>
<style>
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
</style>