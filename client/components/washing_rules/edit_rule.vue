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
      <span>Editar regla</span>
    </v-tooltip>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="headline v-card-titulo white--text"
          >Editar Regla</v-card-title
        >

        <v-card-text class="pb-0">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-container class="pa-0">
              <v-row justify="space-between">
                <v-col cols="8">
                  <v-row>
                    <v-col cols="12" class="pb-0">
                        <v-autocomplete
                          v-model="rule.grupo_id_act"
                          :items="groups"
                          item-text="nombre"
                          item-value="id"
                          label="Grupo Actual"
                          dense
                          outlined
                          background-color="white"
                          hide-details
                          :menu-props="{maxHeight: 350}"
                          required
                        ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" class="pb-0">
                        <v-autocomplete
                          v-model="rule.grupo_id_ant"
                          :items="groups"
                          item-text="nombre"
                          item-value="id"
                          label="Grupo anterior"
                          dense
                          outlined
                          background-color="white"
                          hide-details
                          :menu-props="{maxHeight: 350}"
                          required
                        ></v-autocomplete>
                    </v-col>                    
                  </v-row>
                </v-col>
                <v-col cols="2" class="pb-0 d-flex align-center justify-end">
                    <div class="d-flex align-center">
                      <div v-show="false">{{rule.limpiar == 1 ? rule.limpiar = true : rule.limpiar=false}}</div>
                      <span class="mr-2" style="font-size:18px;color:#757575;">Lavar:</span>
                        <v-switch
                          v-model="rule.limpiar"
                          inset
                          class="my-0"
                          hide-details
                          color="success"
                        />
                    </div>              
                </v-col>
              </v-row>
            </v-container>
            <div :class="showMsg ? 'my-0':'my-5'"><p v-if="showMsg" class="error--text ml-4 my-0">Al menos una línea debe contener datos correctos</p></div>
          </v-form>
        </v-card-text>

        <v-card-actions class="d-flex justify-center">
          <v-btn color="red" text @click="hide">Cancelar</v-btn>
          <br>
          <v-btn color="green darken-1" :loading="loading" text @click="update_rule">
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
    ruleProp:{
      type:Object,
      required:true
    }
  },
  data: () => ({
    showMsg:false,
    loading:false,
    valid: true,
    dialog: false,
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
    groups:[],
    rule:{},
    rules: {
      required: (value) => !!value || "Requerido.",
    },
  }),
  methods: {
    ...mapMutations(["toggleInfoModalCRUD","toggleInfoModal","SET_DISPATCH"]),
    show(){
      this.getGroups();
      this.current_rule = {
        grupo_id_act:this.ruleProp.cur_group_id,
        grupo_id_ant:this.ruleProp.pre_group_id,
        limpiar:this.ruleProp.clean
      };
      this.rule = {
        grupo_id_act:this.ruleProp.cur_group_id,
        grupo_id_ant:this.ruleProp.pre_group_id,
        limpiar:this.ruleProp.clean
      };
      this.dialog = true;
    },
    hide(){
      this.dialog = false;
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
    async update_rule() {
      try {
        this.showMsg = false;         
        let token = Cookies.get("token");
        this.loading = true;
        this.rule.limpiar == true ? this.rule.limpiar = 1 : this.rule.limpiar = 0;
        await axios.put("washing_rules/rules",
        { 
          current_rule : this.current_rule,
          new_rule : this.rule
        }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }).then(()=>{
          this.$emit("click");
          this.toggleInfoModalCRUD({
            dialog: true,
            msj: `Regla actualizada!!`,
            // s1:{ 
            //   status:res.data.server1.status, 
            //   msj:res.data.server1.message 
            //   },
            // s2:{ 
            //   status:res.data.server2.status, 
            //   msj:res.data.server2.message 
            //   },
            titulo: "Editar regla",
            alertType: "success",
          });
          this.dialog = false;
        });
      } catch (error) {
        console.log(error);
        if(error.response){
          this.toggleInfoModal({
          dialog: true,
          msj: `${error.response.data.message}`,
          titulo: "Actualizar Regla",
          alertType: "error",
          });
          console.error('UPDATING_RULE_ERROR:', error.response.data.message)
          this.loading = false;
        }
        else{
          this.toggleInfoModal({
          dialog: true,
          msj: `Ha ocurrido un error al actualizar la regla`,
          titulo: "Actualizar Regla",
          alertType: "error",
          });
          this.loading = false;
        } 
      }
    },
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