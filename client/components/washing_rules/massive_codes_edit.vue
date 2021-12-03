<template>
  <div justify="start">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="#F44336"
          dark
          v-bind="attrs"
          v-on="on"
          class="px-0 massive_editing_btn"
          @click="show"
        >
          <v-icon>app_registration</v-icon>
        </v-btn>
      </template>
      <span>Edición multiple</span>
    </v-tooltip>

    <v-dialog v-model="dialog" width="900">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Reasignar códigos</v-card-title
        >

        <v-card-text class="pb-0">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-container class="py-0">
              <v-row>
                <v-col class="pb-0 mt-2">
                  <v-select
                    v-model="id_group"
                    :items="groups"
                    item-text="nombre"
                    item-value="id"
                    label="Seleccione un grupo"
                    class="py-0"
                    outlined
                    @change="getCodesByGroup"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row justify="center"> 
                <v-col cols="5" align-self="center" class="mt-5 pb-0 pr-0">              
                  <v-card class="mx-auto" width="100%">
                    <v-list
                      flat
                      subheader
                      three-line
                      class="list__class"
                    >
                      <v-subheader style="text-align:center;"><b>NO INCLUIDOS</b></v-subheader>
                      <v-divider></v-divider>
                      <v-list-item-group
                        v-model="selectedNotIncluded"
                        multiple
                        active-class=""
                      >
                        <v-list-item v-for="(item, i) of notIncluded" :key="i">
                          <template v-slot:default="{ active }">
                            <v-list-item-action>
                              <v-checkbox :input-value="active"></v-checkbox>
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

                <v-col cols="2" class="d-flex align-center justify-center px-0">
                  <div>
                    <v-chip class="ml-1 mb-2" color="error">
                      <v-progress-circular
                      v-if="loadingPUT"
                        indeterminate
                        color="primary"
                      ></v-progress-circular>
                      <v-icon dark>
                        close
                      </v-icon>
                    </v-chip>
                    <br>
                    <v-btn class="mb-2">
                      <v-icon>arrow_forward</v-icon>
                    </v-btn>
                    <br>
                    <v-btn>
                      <v-icon>arrow_back</v-icon>
                    </v-btn>
                  </div>
                </v-col>

                <v-col cols="5" align-self="center" class="mt-5 pl-0">
                 <v-card class="mx-auto">
                    <v-list
                      flat
                      subheader
                      three-line
                      class="list__class"
                    >
                      <v-subheader style="text-align:center;"><b>INCLUIDOS</b></v-subheader>
                      <v-divider></v-divider>
                      <v-list-item-group
                        v-model="selectedIncluded"
                        multiple
                        active-class=""
                      >
                        <v-list-item v-for="(item, i) of included" :key="i">
                          <template v-slot:default="{ active }">
                            <v-list-item-action>
                              <v-checkbox :input-value="active"></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content class="py-0">
                              <v-list-item-title>{{item.id}}</v-list-item-title>
                              <v-list-item-subtitle>Notify me about</v-list-item-subtitle>
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
          <!-- <v-btn color="green darken-1" :loading="loading" text @click="edit_group">
            Aceptar
          </v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
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
    code:null,
    options:{},
    groups:[],
    id_group:null,
    loadingPUT:false,
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
    selectedNotIncluded:[],
    selectedIncluded:[]
  }),
  methods: {
    ...mapMutations(["toggleInfoModalCRUD","toggleInfoModal"]),
    show(){
      this.setAll = true;
      this.dialog = true;
    },
    async edit_group() {
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
    classifyCodes(group){

    },
    hide(){
      this.dialog = false;
    },
    async getCodesByGroup() {
      this.dialogSpinner = true;
      let token = Cookies.get("token");
      this.included=[];
      this.notIncluded=[];
      await axios
        .get("washing_rules/codes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            options: this.options,
            code: this.code
          },
        })
        .then((res) => {
          console.log('CODES_FROM_MASSIVE_EDIT:', res.data.data.data);
          this.allCodes = res.data.data.data;
          this.allCodes.forEach((item)=>{
            if(item.grupo == this.id_group){
              this.included.push(item)
            }else{
              this.notIncluded.push(item)
            }
          })
          this.dialogSpinner = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async getGroups(){
      try {
        let token = Cookies.get("token");
          await axios.get("washing_rules/groups", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res)=>{
            this.groups = res.data.data.data;
          });
      } catch (error) {
        console.log('ERROR_GET_GROUPS:', error);
      }
    }
  },
  mounted(){
    this.getGroups();
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
.massive_editing_btn{
  width: 36px;
  height:36px;
}
</style>