<template>
  <v-row justify="center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="#F44336"
          dark
          icon
          v-bind="attrs"
          v-on="on"
          class="px-0"
          @click="show"
        >
          <img src="@/static/iconos/baseline_create_black_18dp.png" alt="editar" />
        </v-btn>
      </template>
      <span>Crear nuevo grupo</span>
    </v-tooltip>

    <v-dialog v-model="dialog" width="800">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Editar Grupo</v-card-title
        >

        <v-card-text class="pb-0">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-container class="py-0">
              <v-row>
                <v-col cols="12" class="pb-0">
                  <v-text-field
                    v-model="currentGroup.nombre"
                    :rules="[rules.required]"
                    label="Nombre"
                    required
                    dense
                    ref="cod_pt"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="pb-0">
                  <v-text-field
                    v-model="currentGroup.familia"
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
                    v-model="currentGroup.t_maxlmp"
                    type="number"
                    :rules="[rules.required]"
                    label="T.Max"
                    required
                    dense
                  ></v-text-field>                  
                </v-col>
              </v-row>

              <v-row> 
                <v-col cols="5" class="pt-2 pb-0">              
                  <v-card class="mx-auto">
                    <v-list
                      flat
                      subheader
                      three-line
                      class="list__class"
                    >
                      <v-subheader style="text-align:center;"><b>NO ASIGNADOS</b></v-subheader>
                      <v-divider></v-divider>
                      <v-list-item-group                        
                        multiple
                      >
                        <v-list-item v-for="(item, i) of notIncluded" :key="i">
                          <template>
                            <v-list-item-action>
                              <!-- <v-checkbox v-model="selectedNotIncluded" :value="item"></v-checkbox> -->
                              <input class="mt-1 checkbox__list" type="checkbox" v-model="selectedNotIncluded" :value="item">
                            </v-list-item-action>

                            <v-list-item-content class="py-0">
                              <v-list-item-title>{{item.id}}</v-list-item-title>
                              <!-- <v-list-item-subtitle>Notify me about</v-list-item-subtitle> -->
                            </v-list-item-content>
                          </template>
                        </v-list-item>
                      </v-list-item-group>
                    </v-list>
                  </v-card>
                </v-col>

                <v-col cols="2" class="d-flex align-center justify-center">
                  <div>
                    <v-btn class="mb-2" @click="include" :disabled="selectedNotIncluded.length > 0 ? false : true">
                      <v-icon>arrow_forward</v-icon>
                    </v-btn>
                    <br>
                    <v-btn @click="exclude" :disabled="selectedIncluded.length > 0 ? false : true">
                      <v-icon>arrow_back</v-icon>
                    </v-btn>
                  </div>
                </v-col>

                <v-col cols="5">
                 <v-card class="mx-auto">
                    <v-list
                      flat
                      subheader
                      three-line
                      class="list__class"
                    >
                      <v-subheader style="text-align:center;"><b>ASIGNADOS</b></v-subheader>
                      <v-divider></v-divider>
                      <v-list-item-group
                        multiple
                      >
                        <v-list-item v-for="(item, i) of included" :key="i" :selectable="false">
                          <template>
                            <v-list-item-action>
                              <!-- <v-checkbox v-model="selectedIncluded" :value="item"></v-checkbox> -->
                              <input class="mt-1 checkbox__list" type="checkbox" v-model="selectedIncluded" :value="item">
                            </v-list-item-action>

                            <v-list-item-content class="py-0">
                              <v-list-item-title>{{item.id}}</v-list-item-title>
                              <!-- <v-list-item-subtitle>Notify me about</v-list-item-subtitle> -->
                            </v-list-item-content>
                          </template>
                        </v-list-item>
                      </v-list-item-group>
                    </v-list>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
            <div :class="showMsg ? 'my-0':'my-5'"><p v-if="showMsg" class="error--text ml-4 my-0">Al menos una línea debe contener datos correctos</p></div>
          </v-form>
        </v-card-text>

        <v-card-actions class="d-flex justify-center">
          <v-btn color="red" text @click="hide">Cancelar</v-btn>
          <br>
          <v-btn color="green darken-1" :loading="loading" text @click="update_group">
            Aceptar
          </v-btn>
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
    id_group:{
      type:Number,
      required:true
    }
  },
  data: () => ({
    showMsg:false,
    loading:false,
    valid: true,
    dialog: false,
    code:null,
    options:{
      page: 1,
      itemsPerPage: 10,
      sortBy: [],
      sortDesc: [],
      groupBy: [],
      groupDesc: [],
      mustSort: false,
      multiSort: false
    },
    currentGroup: {
      id:null,
      nombre: "",
      familia: "",
      t_maxlmp:null
    },
    rules: {
      required: (value) => !!value || "Requerido.",
      minTemp: (value) => value >= 40 || "Valor mínimo 40",
      maxTemp: (value) => value <= 70 || "Valor máximo 70",
      minVel: (value) => value >= 0 || "Valor mínimo 0",
      maxVel: (value) => value <= 100 || "Valor máximo 100",
    },
    allCodes:[],
    included:[],
    notIncluded:[],
    selectedIncluded:[],
    selectedNotIncluded:[]
  }),
  methods: {
    ...mapMutations(["toggleInfoModalCRUD","toggleInfoModal","SET_DISPATCH"]),
    show(){
      this.included = [];
      this.notIncluded = [];
      this.selectedIncluded = [];
      this.selectedNotIncluded = [];
      this.getCodes();
      this.getCurrentGroup();
      this.dialog = true;
    },
    async multiple_codes_update(){
      try {
        let token = Cookies.get("token");
        await axios.put("washing_rules/multiple_codes", {
          included_arr:this.included,
          removed_arr:this.notIncluded,
          id_group:this.currentGroup.id
        },{
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res)=>{
            this.$emit("click");
            this.toggleInfoModalCRUD({
              dialog: true,
              msj: `Grupo ${this.currentGroup.nombre} actualizado`,
              // s1:{ 
              //   status:res.data.server1.status, 
              //   msj:res.data.server1.message 
              //   },
              // s2:{ 
              //   status:res.data.server2.status, 
              //   msj:res.data.server2.message 
              //   },
              titulo: "Actualizar Grupo",
              alertType: "success",
            });
            this.dialog = false;
            this.loading = false;
        });
      } catch (error) {
        console.log("UPDATING_CODES_ERROR", error);
          if(error.response){
              this.toggleInfoModal({
              dialog: true,
              msj: `${error.response.data.message}`,
              titulo: "Actualizar Grupo",
              alertType: "error",
              });
              console.error('UPDATING_GROUP_ERROR:', error.response.data.message)
              this.loading = false;
          }
          else{
              this.toggleInfoModal({
              dialog: true,
              msj: `Ha ocurrido un error al reasignar el los codigos`,
              titulo: "Actualizar Grupo",
              alertType: "error",
              });
              this.loading = false;
        } 
      }
    },
    async update_group() {
      try {
       if(this.$refs.form.validate()){
          this.showMsg = false;         
          let token = Cookies.get("token");
          this.loading = true;
          await axios.put("washing_rules/groups", this.currentGroup , {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res)=>{
            console.log('Grupo actualizado correctamente!!');
          }).then(()=>{
            this.multiple_codes_update();
          });
       } 
      } catch (error) {
          if(error.response){
              this.toggleInfoModal({
              dialog: true,
              msj: `${error.response.data.message}`,
              titulo: "Actualizar Grupo",
              alertType: "error",
              });
              console.error('UPDATING_GROUP_ERROR:', error.response.data.message)
              this.loading = false;
          }
          else{
              this.toggleInfoModal({
              dialog: true,
              msj: `Ha ocurrido un error al actualizar el grupo`,
              titulo: "Actualizar Grupo",
              alertType: "error",
              });
              this.loading = false;
        } 
      }
    },
    async getCurrentGroup(){
      try {
        let token = Cookies.get("token");
          await axios.get("washing_rules/groups", {
            headers: { 
              Authorization: `Bearer ${token}` 
            },
            params:{
              id:this.id_group,
              options:this.options
            }
          }).then((res)=>{
            console.log('GetcurrentGroup',res)
            this.currentGroup = res.data.data.data;
          });
      } catch (error) {
        console.log('ERROR_GET_GROUPS:', error);
      }
    },
    hide(){
      this.dialog = false;
    },
    async getCodes() {
      this.dialogSpinner = true;
      let token = Cookies.get("token");
      await axios
        .get("washing_rules/codes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            options: {
              page: 1,
              itemsPerPage: 10,
              sortBy: [],
              sortDesc: [],
              groupBy: [],
              groupDesc: [],
              mustSort: false,
              multiSort: false
            },
            code: this.code
          },
        })
        .then((res) => {
          this.allCodes = res.data.data.data;
          this.allCodes.forEach((item)=>{
            if(!item.grupo){
              this.notIncluded.push(item);        
            }else if(item.grupo.id == this.id_group){
              this.included.push(item)
            }
          });
          this.dialogSpinner = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    include(){
      this.selectedNotIncluded.forEach( item => {
        this.included.push(item);
        let index = this.notIncluded.findIndex( el => el.id == item.id );
        this.notIncluded.splice(index, 1);
        this.selectedNotIncluded = [];
      })
    },
    exclude(){
      this.selectedIncluded.forEach( item => {
        this.notIncluded.push(item);
        let index = this.included.findIndex( el => el.id == item.id );
        this.included.splice(index, 1);
        this.selectedIncluded = [];
      })
    }
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
.list__class{
  overflow: scroll;
  height: 350px;
}
.v-list--three-line .v-list-item, .v-list-item--three-line{
  min-height: 0px;
}

.checkbox__list{
  width:30px;
  height:30px;
  cursor: pointer;
}
</style>