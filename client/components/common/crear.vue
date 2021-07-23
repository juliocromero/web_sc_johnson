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
          @click.stop="dialog = true"
        >
          <img src="@/static/iconos/baseline_add_white_24dp.png" alt="plus" />
        </v-btn>
      </template>
      <span>Agregar Producto</span>
    </v-tooltip>

    <v-dialog v-model="dialog" width="600">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Crear producto</v-card-title
        >

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
                      <span class="mt-1 mr-2">Asignar a todos:</span>
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
                      <template v-slot:[`item.linea`]="{ item }">
                          <b>{{item.linea}}</b>               
                      </template>
                      <template v-slot:[`item.temperatura`]="{ item }">
                        <v-text-field
                        v-model="item.temperatura"
                        type="number"
                        solo
                        dense
                        hide-details
                        background-color="#F3F3F3"
                        flat
                        />
                      </template>
                      <template v-slot:[`item.velocidad`]="{ item }">
                        <v-text-field
                        v-model="item.velocidad"
                        type="number"
                        solo
                        dense
                        hide-details
                        background-color="#F3F3F3"
                        flat
                        />
                      </template>
                      <template v-slot:[`item.crimper`]="{ item }">
                        <div style="display: flex;align-items: center;justify-content: center;">
                          <v-switch
                            v-model="item.crimper"
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
                              <b>{{setAllItems.lineas}}</b> 
                            </td>
                            <td>
                              <v-text-field
                              v-model="setAllItems.temperatura"
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
                              v-model="setAllItems.velocidad"
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
                                  v-model="setAllItems.crimper"
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

          <v-btn color="green darken-1" text @click="add_products()"
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
    setAll:true,
    setAllItems:{ lineas:"Todas", temperatura:"", velocidad:"", crimper:false }, 
    valid: true,
    dialog: false,
    nameRules: [(value) => !!value || "Este campo es requerido"],
    new_product: {
      cod_pt: "",
      description: ""
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
    ...mapMutations(["toggleInfoModal"]),
    validarLineas(){
      let res = false;
      this.lineas.forEach(item => {
        if(item.temperatura >=40 && item.temperatura<=70 ) {
          if(item.velocidad > 0 &&  item.velocidad <=100){
            res = true
          }
        }
      });
      return res
    },
    setAllTempeture(){
      this.lineas[0].temperatura = this.setAllItems.temperatura;
      this.lineas[1].temperatura = this.setAllItems.temperatura;
      this.lineas[2].temperatura = this.setAllItems.temperatura;
      this.lineas[3].temperatura = this.setAllItems.temperatura;
    },
    setAllVelocity(){
      this.lineas[0].velocidad = this.setAllItems.velocidad;
      this.lineas[1].velocidad = this.setAllItems.velocidad;
      this.lineas[2].velocidad = this.setAllItems.velocidad;
      this.lineas[3].velocidad = this.setAllItems.velocidad;
    },
    setAllCrimper(){
      this.lineas[0].crimper = this.setAllItems.crimper;
      this.lineas[1].crimper = this.setAllItems.crimper;
      this.lineas[2].crimper = this.setAllItems.crimper;
      this.lineas[3].crimper = this.setAllItems.crimper;
    },
    toggleDialog() {
      this.dialog = false;
      this.$refs.form.reset();
    },
    async add_products() {
      try {
       if(this.$refs.form.validate()){
         if(this.validarLineas()){
            this.showMsg = false;         
            let token = Cookies.get("token");

            let new_product = {
              cod_pt: this.new_product.cod_pt,
              description:this.new_product.description,
              l310_sp_temp: this.lineas[0].temperatura,
              l310_sp_vel: this.lineas[0].velocidad,
              l310_oncrimp: this.lineas[0].crimper,
              l320_sp_temp: this.lineas[1].temperatura,
              l320_sp_vel: this.lineas[1].velocidad,
              l320_oncrimp: this.lineas[1].crimper,
              l330_sp_temp: this.lineas[2].temperatura,
              l330_sp_vel: this.lineas[2].velocidad,
              l330_oncrimp: this.lineas[2].crimper,
              l340_sp_temp: this.lineas[3].temperatura,
              l340_sp_vel: this.lineas[3].velocidad,
              l340_oncrimp: this.lineas[3].crimper,
            }

            await axios.post("products", new_product , {
              headers: { Authorization: `Bearer ${token}` },
            });
            this.$emit("reload");
            this.toggleInfoModal({
              dialog: true,
              msj: `Producto agregado correctamente`,
              titulo: "Agregar Producto",
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