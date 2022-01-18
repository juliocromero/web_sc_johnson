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

    <v-dialog v-model="dialog" width="950">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text">Reasignar códigos</v-card-title>
        <v-card-text class="py-0">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-container class="py-0">
              <v-row>
                <v-col class="pb-0 mt-2">
                  <v-autocomplete
                    v-model="id_group"
                    :items="groups"
                    item-text="nombre"
                    item-value="id"
                    label="Seleccione un grupo"
                    class="py-0"
                    outlined
                    @change="getCodesByGroup_BySelectedGroup"
                    @click="getCurrentId(id_group)"
                    :menu-props="{maxHeight: 350}"
                    hide-details
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <v-row> 
                <v-col cols="5" align-self="center" class="pt-0 pb-10">              
                    <h4 class="grey-lihgten-1--text overline text-center h6">NO INCLUIDOS</h4>
                    <v-autocomplete
                      v-model="selectedNotIncluded"
                      :items="notIncluded"
                      item-text="id"
                      return-object
                      outlined
                      chips
                      small-chips
                      placeholder="Busque y seleccione"
                      multiple
                      no-data-text="Sin codigós"
                      hide-details
                      allow-overflow
                      class="auto__complete"
                      :menu-props="{maxHeight: 300}"
                    >
                    
                      <template v-slot:selection="data">
                        <v-chip
                          v-bind="data.attrs"
                          :input-value="data.selected"
                          @click="data.select"
                          @click:close="removeNotIncluded(data.item)"
                        >
                          <div class="d-flex">
                            <strong>{{ data.item.id }}:</strong>
                            <i>{{ data.item.nombre }}</i>                           
                          </div>

                        </v-chip>
                      </template>
                    </v-autocomplete>    
<!--                     <v-list
                      flat
                      subheader
                      three-line
                      class="list__class"
                    >
                      <v-subheader style="text-align:center;"><b>NO INCLUIDOS</b></v-subheader>
                      <v-divider class="mb-2"/>
                      <v-list-item-group
                        multiple
                      >
                        <v-list-item v-for="(item, i) of notIncluded" :key="i" class="mb-3">
                          <template>
                            <v-list-item-action class="mt-1 pt-0">
                              <input class="mt-1 checkbox__list" type="checkbox" v-model="selectedNotIncluded" :value="item">
                            </v-list-item-action>

                            <v-list-item-content class="py-0">
                              <v-list-item-title>{{item.id}}</v-list-item-title>
                              <v-list-item-subtitle>{{item.nombre}}</v-list-item-subtitle>
                            </v-list-item-content>
                          </template>
                        </v-list-item>
                      </v-list-item-group>
                    </v-list> -->
                 
                </v-col>

                <v-col cols="2" class="pa-0 mt-5">
                  <v-row justify="center">
                    <v-col cols="12" class="d-flex align-center justify-center pa-0">
                      <v-btn class="mb-2" @click="include" :disabled="selectedNotIncluded.length > 0 ? false : true">
                        <v-icon>arrow_forward</v-icon>
                      </v-btn>                      
                    </v-col>
                    <v-col class="d-flex align-center justify-center pa-0">
                      <v-btn @click="exclude" :disabled="selectedIncluded.length > 0 ? false : true">
                        <v-icon>arrow_back</v-icon>
                      </v-btn>                      
                    </v-col>

                    <v-col cols="12" class="d-flex align-center justify-center px-0" style="height:1rem;">
                       <span class="red--text" v-if="changesAlert">
                        <i>
                          Cambios
                        </i>
                        <i>
                          pendientes
                        </i>               
                      </span>   
                      <!-- ERROR INDICATOR -->
                      <v-chip class="mt-3" color="error" small v-if="errorAlert">
                        <v-progress-circular
                        v-if="loadingPUT"
                          indeterminate
                          color="primary"
                        ></v-progress-circular>
                          Error
                      </v-chip>
                      <!-- SUCCESS INDICATOR -->
                      <v-chip class="mt-3" color="success" v-if="successAlert">
                        <v-progress-circular
                        v-if="loadingPUT"
                          indeterminate
                          color="primary"
                        ></v-progress-circular>
                          OK
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-col>

                <v-col cols="5" align-self="center" class="pt-0 pb-10">
                   <h4 class="grey-lihgten-1--text overline text-center">INCLUIDOS</h4>
                    <v-autocomplete
                      v-model="selectedIncluded"
                      :items="included"
                      item-text="id"
                      return-object
                      outlined
                      chips
                      small-chips
                      placeholder="Busque y seleccione"
                      multiple
                      no-data-text="Sin codigós"
                      hide-details
                    >
                      <template v-slot:selection="data">
                        <v-chip
                          v-bind="data.attrs"
                          :input-value="data.selected"
                          close
                          @click="data.select"
                          @click:close="removeIncluded(data.item)"
                        >
                          <strong>{{ data.item.id }}:</strong><i>{{ data.item.nombre }}</i>
                        </v-chip>
                      </template>
                    </v-autocomplete>                   
<!--                     <v-list
                      flat
                      subheader
                      three-line
                      class="list__class"
                    >
                      <v-subheader style="text-align:center;"><b>INCLUIDOS</b></v-subheader>
                      <v-divider class="mb-2"/>
                      <v-list-item-group   
                        multiple
                      >
                        <v-list-item :selectable="false" v-for="(item, i) of included" :key="i" class="mb-3">
                          <template>
                            <v-list-item-action class="mt-1 pt-0 d-flex align-center justify-center">
                              <input class="mt-1 checkbox__list" type="checkbox" v-model="selectedIncluded" :value="item">
                            </v-list-item-action>

                            <v-list-item-content class="py-0">
                              <v-list-item-title>{{item.id}}</v-list-item-title>
                              <v-list-item-subtitle>{{item.nombre}}</v-list-item-subtitle>
                            </v-list-item-content>
                          </template>
                        </v-list-item>
                        <v-list-item v-for="(item, i) of included" :key="i" class="mb-3">
                        <template v-slot:default="{ active }">
                          <v-list-item-action>
                           <v-checkbox v-model="selectedIncluded" :value="active"></v-checkbox>
                          </v-list-item-action>

                          <v-list-item-content>
                            <v-list-item-title>{{item.id}}</v-list-item-title>
                            <v-list-item-subtitle>{{item.nombre}}</v-list-item-subtitle>
                          </v-list-item-content>
                        </template>
                      </v-list-item>
                      </v-list-item-group>
                    </v-list> -->
                </v-col>
              </v-row>
            </v-container>
            <div class="my-0"><p v-if="showMsg" class="error--text ml-4 my-0">Al menos una línea debe contener datos correctos</p></div>
          </v-form>
        </v-card-text>

        <v-card-actions class="d-flex justify-center pt-0 mt-0">
          <v-btn color="red" text @click="hide">Cancelar</v-btn>
          <br>
          <v-btn color="green darken-1" :loading="loading" text @click="multiple_codes_update()">
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- ALERTA DE CAMBIOS PENDIENTES -->
    <div class="text-center">
      <v-dialog
        v-model="dialogChangesAlert"
        width="375"
      >
        <v-card>

            <v-alert
              dense
              outlined
              type="error"
              class="my-0 py-5"
              style="border:none!important;"
            >
              ¿ Desea aplicar los cambios realizados ?
            </v-alert> 


          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer/>
            <v-btn
              color="success"
              text
              @click="applyChanges"
            >
              Aceptar
            </v-btn>
            <v-btn
              color="error"
              text
              @click="discardChanges"
            >
              Descartar
            </v-btn>
            <v-spacer/>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
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
    options:{
      page: 1,
      perPage:10,
      all:true
    },
    groups:[],
    id_group:null,
    loadingPUT:false,
    group_name:null,
    errorAlert:false,
    successAlert:false,
    dialogChangesAlert:false,
    currentIdGroup:null,
    changesAlert:false,
    rules: {
      required: (value) => !!value || "Requerido.",
      minTemp: (value) => value >= 40 || "Valor mínimo 40",
      maxTemp: (value) => value <= 70 || "Valor máximo 70",
      minVel: (value) => value >= 0 || "Valor mínimo 0",
      maxVel: (value) => value <= 100 || "Valor máximo 100",
    },
    allCodes:[],
    included:[],
    initial:[],
    notIncluded:[],
    selectedNotIncluded:[],
    selectedIncluded:[]
  }),
  methods: {
    ...mapMutations(["toggleInfoModalCRUD","toggleInfoModal"]),
    removeIncluded (item) {
      const index = this.included.indexOf(item.id)
      if (index >= 0) {
        this.included.splice(index, 1);
        this.selectedIncluded.splice(index, 1);
      }
    },
    removeNotIncluded (item) {
      const index = this.notIncluded.indexOf(item.id)
      if (index >= 0) {
        this.notIncluded.splice(index, 1);
        this.selectedNotIncluded.splice(index, 1);
      }
    },
    show(){
      this.setAll = true;
      this.included = [];
      this.notIncluded = [];
      this.selectedIncluded = [];
      this.selectedNotIncluded = [];
      this.id_group = null;
      this.errorAlert = false;
      this.changesAlert = false;
      this.getGroups();
      this.dialog = true;
    },
    async multiple_codes_update(){
      try {
        let token = Cookies.get("token");
        await axios.put("washing_rules/multiple_codes", {
          included_arr:this.included,
          removed_arr:this.notIncluded,
          id_group:this.currentIdGroup
        },{
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res)=>{
            this.$emit("reload");
            this.errorAlert = false;
            this.successAlert = true;
            this.changesAlert = false;
            this.selectedNotIncluded = [];
            this.selectedIncluded = [];
            setTimeout(()=>{
              this.successAlert = false;
            },3000);
        });
      } catch (error) {
        console.log("UPDATING_MASSIVE_CODES_ERROR", error);
        this.successAlert = false;
        this.errorAlert = true;
      }
    },
    getCurrentId(id_group){
      this.currentIdGroup = id_group;
    },
    hide(){
      this.dialog = false;
      this.changesAlert = false;
    },
    async getCodesByGroup() {
      if(!this.changesAlert){
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
          this.allCodes = res.data.data.data;
          console.log('All codes:', res)
          this.allCodes.forEach((item)=>{
            if(!item.grupo){
              this.notIncluded.push(item);        
            }else if(item.grupo.id == this.id_group){
              this.included.push(item)
            }
          });
          this.initial = [...this.included];
          this.dialogSpinner = false;
          this.getCurrentId(this.id_group)
        })
        .catch((error) => {
          console.log(error);
        });
      } else {
        this.dialogChangesAlert = true;
      }
    },
    getCodesByGroup_BySelectedGroup(){
      this.options.all = true;
      this.included = [];
      this.notIncluded = [];
      console.log('options', this.options)
      this.getCodesByGroup();
    },
    async getGroups(){
      try {
        let token = Cookies.get("token");
      await axios
        .get("washing_rules/groups", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            options: this.options,
            group_name:this.group_name
          },
        })
        .then((res)=>{
            this.groups = res.data.data.data;
          });
      } catch (error) {
        console.log('ERROR_GET_GROUPS:', error);
      }
    },
    applyChanges(){
      this.changesAlert = true;
      this.multiple_codes_update(this.currentIdGroup);
      this.changesAlert = false;
      this.dialogChangesAlert = false;
      this.getCodesByGroup();
    },
    discardChanges(){
      this.changesAlert = false;
      this.dialogChangesAlert = false;
      this.getCodesByGroup();
    },
    include(){
      this.selectedNotIncluded.forEach( item => {
        this.included.push(item);
        this.selectedIncluded.push(item);
        let index = this.notIncluded.findIndex( el => el.id == item.id );
        this.notIncluded.splice(index, 1);
      });
      this.changesValidation();
      this.selectedNotIncluded = [];
    },
    exclude(){
      this.selectedIncluded.forEach( item => {
        this.notIncluded.push(item);
        this.selectedNotIncluded.push(item);
        let index = this.included.findIndex( el => el.id == item.id );
        this.included.splice(index, 1);
      });
      this.changesValidation();
      this.selectedIncluded = [];
    },
    changesValidation(){
      const compareId = (a, b) => {
        return a.id_auto - b.id_auto;
      }
        if(this.initial.length == this.included.length) {
          this.initial.sort(compareId);
          this.included.sort(compareId);

          this.initial.forEach((item, i)=> {
            if(item != this.included[i]){
              this.changesAlert = true;
              return true;
            };
          });

          this.changesAlert = false;
        } else {
          this.changesAlert = true;
        }
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
.massive_editing_btn{
  width: 36px;
  height:36px;
}

.checkbox__list{
  width:30px;
  height:30px;
  cursor: pointer;
}
.auto__complete{

}
</style>