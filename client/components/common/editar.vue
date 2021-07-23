<template>
  <v-row justify="center">

        <v-btn
          color="#F44336"
          icon
          small
          dark
          @click.stop="show"
        >
          <img src="@/static/iconos/baseline_create_black_18dp.png" alt="editar" />
        </v-btn>

    <v-dialog v-model="dialog" width="600">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text">
          Editar producto
        </v-card-title>

        <v-card-text class="pb-0">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-container class="py-0">
              <v-row>
                <v-col cols="12" class="pb-0">
                  <v-text-field
                    v-model="new_product.cod_pt"
                    type="number"
                    :rules="[rules.required]"
                    label="Código"
                    required
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="py-0">
                  <v-textarea
                    v-model="new_product.description"
                    label="Descripción"
                    required
                    dense
                    rows="1"
                  ></v-textarea>
                </v-col>
              </v-row>
              <v-row> 
                <v-col class="pt-2 pb-0">
                  <v-col class="pa-0 d-flex justify-spacer-between align-center">
                    <span style="font-size:16px;">Set Points:</span>
                    <v-spacer/>
                    <div class="d-flex">
                      <span class="mt-1 mr-2">Asignar a todas:</span>
                      <v-switch
                        v-model="setAll"
                        color="primary"
                        hide-details
                        dense
                        class="ma-0 mb-1"
                      />
                    </div>
                  </v-col>
                  
                    <v-data-table
                      :headers="headers"
                      :items="lineas"
                      hide-default-footer
                      class="elevation-1 mt-3"
                    >
                      <template v-slot:[`item.line`]="{ item }">
                          <b>{{item.line}}</b>               
                      </template>
                      <template v-slot:[`item.temperature`]="{ item }">
                        <v-text-field
                        v-model="item.temperature"
                        type="number"
                        solo
                        dense
                        hide-details
                        background-color="#F3F3F3"
                        flat
                        />
                      </template>
                      <template v-slot:[`item.velocity`]="{ item }">
                        <v-text-field
                        v-model="item.velocity"
                        type="number"
                        solo
                        dense
                        hide-details
                        background-color="#F3F3F3"
                        flat
                        />
                      </template>
                      <template v-slot:[`item.onCrimp`]="{ item }">
                        <div style="display: flex;align-items: center;justify-content: center;">
                          <v-switch
                            v-model="item.onCrimp"
                            color="success"
                            hide-details
                            dense
                            class="ma-0 ml-4"
                          ></v-switch>                          
                        </div>
                      </template>
                      <!-- ************ setAll ************ -->
                      <template
                        v-if="setAll"
                        v-slot:body
                      >
                        <tbody>
                          <tr>
                            <td style="display: flex;align-items: center;justify-content: center;"> 
                              <b>{{setAllItems.lines}}</b> 
                            </td>
                            <td>
                              <v-text-field
                              v-model="setAllItems.temperature"
                              @input="setAllTempeture"
                              type="number"
                              solo
                              dense
                              required
                              :rules="[rules.minTemp, rules.maxTemp, rules.required]"
                              style="text-align:center;"
                              background-color="#F3F3F3"
                              flat
                              class="mt-2"
                              />                              
                            </td>
                            <td>
                              <v-text-field
                              v-model="setAllItems.velocity"
                              @input="setAllVelocity"
                              type="number"
                              solo
                              dense
                              required
                              :rules="[rules.minVel, rules.maxVel, rules.required]"
                              background-color="#F3F3F3"
                              flat
                              class="mt-2"
                              />   
                            </td>
                            <td style="display: flex;align-items: center;justify-content: center;">
                              <div style="display: flex;align-items: center;justify-content: center;">
                                <v-switch
                                  v-model="setAllItems.onCrimp"
                                  @change="setAllCrimper"
                                  color="success"
                                  hide-details
                                  dense
                                  class="ma-0 ml-4"
                                ></v-switch>                          
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-data-table>
                </v-col>
              </v-row>
            </v-container>
            <div :class="showMsg ? 'my-0':'my-5'"><p v-if="showMsg" class="error--text ml-4 my-0">Al menos una línea debe contener datos</p></div>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="toggleDialog">Cancelar</v-btn>

          <v-btn color="green darken-1" text @click="edit_products()"
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
  props:{
    product:{
      type: Object,
      required: true      
    },
    lines:{
    type: Array,
    required:true
    }
  },
  data: () => ({
    showMsg:false,
    setAll:false,
    setAllItems:{ lines:"Todas", temperature:"", velocity:"", onCrimp:false }, 
    valid: true,
    dialog: false,
    nameRules: [(value) => !!value || "Este campo es requerido"],
    new_product: {
      cod_pt: "",
      description: ""
    },
    headers:[
      { text: 'Líneas', value: 'line', sortable: false, class:'my_table_style', align:'center' },
      { text: 'Temperatura', value: 'temperature', sortable: false, class:'my_table_style', align:'center', width:'150px' },
      { text: 'Velocidad', value: 'velocity', sortable: false, class:'my_table_style', align:'center', width:'150px' },
      { text: 'V.Crimper', value: 'onCrimp', sortable: false, class:'my_table_style', align:'center' },
    ],
    lineas:[
      { line:"L310", temperature:"", velocity:"", onCrimp:false },
      { line:"L320", temperature:"", velocity:"", onCrimp:false },
      { line:"L330", temperature:"", velocity:"", onCrimp:false },
      { line:"L340", temperature:"", velocity:"", onCrimp:false },
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
    ...mapMutations(["toggleInfoModal"]),
    show(){
      this.new_product = {...this.product}
      this.lineas = [
        { line:"L310", temperature:this.lines[0].temperature, velocity:this.lines[0].velocity, onCrimp:this.lines[0].onCrimp },
        { line:"L320", temperature:this.lines[1].temperature, velocity:this.lines[1].velocity, onCrimp:this.lines[1].onCrimp },
        { line:"L330", temperature:this.lines[2].temperature, velocity:this.lines[2].velocity, onCrimp:this.lines[2].onCrimp },
        { line:"L340", temperature:this.lines[3].temperature, velocity:this.lines[3].velocity, onCrimp:this.lines[3].onCrimp },
      ]
      this.dialog = true
    },
    validarLineas(){
      let res = false;
      this.lineas.forEach(item => {
        if(item.temperature >=40 && item.temperature<=70 ) {
          if(item.velocity > 0 &&  item.velocity <=100){
            res = true
          }
        }
      });
      return res
    },
    setAllTempeture(){
      this.lineas[0].temperature = this.setAllItems.temperature;
      this.lineas[1].temperature = this.setAllItems.temperature;
      this.lineas[2].temperature = this.setAllItems.temperature;
      this.lineas[3].temperature = this.setAllItems.temperature;
    },
    setAllVelocity(){
      this.lineas[0].velocity = this.setAllItems.velocity;
      this.lineas[1].velocity = this.setAllItems.velocity;
      this.lineas[2].velocity = this.setAllItems.velocity;
      this.lineas[3].velocity = this.setAllItems.velocity;
    },
    setAllCrimper(){
      this.lineas[0].onCrimp = this.setAllItems.onCrimp;
      this.lineas[1].onCrimp = this.setAllItems.onCrimp;
      this.lineas[2].onCrimp = this.setAllItems.onCrimp;
      this.lineas[3].onCrimp = this.setAllItems.onCrimp;
    },
    toggleDialog() {
      this.dialog = false;
      this.$refs.form.reset();
    },
    async edit_products() {
      try {
       if(this.$refs.form.validate()){
         if(this.validarLineas()){
            this.showMsg = false;         
            let token = Cookies.get("token");

            let new_product = {
              cod_pt: this.new_product.cod_pt,
              description:this.new_product.description,
              l310_sp_temp: this.lineas[0].temperature,
              l310_sp_vel: this.lineas[0].velocity,
              l310_oncrimp: this.lineas[0].onCrimp,
              l320_sp_temp: this.lineas[1].temperature,
              l320_sp_vel: this.lineas[1].velocity,
              l320_oncrimp: this.lineas[1].onCrimp,
              l330_sp_temp: this.lineas[2].temperature,
              l330_sp_vel: this.lineas[2].velocity,
              l330_oncrimp: this.lineas[2].onCrimp,
              l340_sp_temp: this.lineas[3].temperature,
              l340_sp_vel: this.lineas[3].velocity,
              l340_oncrimp: this.lineas[3].onCrimp,
            }
            console.log('Data:', new_product )
            await axios.put(`products/${this.product.id}`, new_product , {
              headers: { Authorization: `Bearer ${token}` },
            });
            this.$emit("reload");
            this.toggleInfoModal({
              dialog: true,
              msj: `Producto actualizado correctamente`,
              titulo: "Editar Producto",
              alertType: "success",
            });
            this.dialog = false;
            this.$refs.form.reset();
         }
         else{
           this.showMsg = true
         }
       } 
      } catch (error) {
          this.toggleInfoModal({
          dialog: true,
          msj: `Ha ocurrido un error al actualizar el producto`,
          titulo: "Editar Producto",
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