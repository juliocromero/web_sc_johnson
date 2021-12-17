<template>
  <v-container>

    <v-row class="pa-0 ma-0">
      <v-col class="pa-0 ma-0">
        <v-card color="#FFE4D5">
          <v-container class="py-0">
              <v-form
                ref="form"
                v-model="valid"
                lazy-validation
              >
                <v-row justify="space-between">
                  <v-col
                    cols="12"
                    sm="4"
                    class="py-2 ma-0 d-flex align-center justify-center"
                  >
                    <v-autocomplete
                      v-model="new_rule.pre_group_id"
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
                      :rules="rulesValidation"
                    ></v-autocomplete>
                  </v-col>
                  <v-divider vertical />
                  <v-col 
                  cols="12" 
                  sm="4" 
                  class="py-2 ma-0 d-flex align-center justify-center"
                  >
                    <v-autocomplete
                      v-model="new_rule.cur_group_id"
                      :items="groups"
                      item-text="nombre"
                      item-value="id"
                      label="Grupo posterior"
                      dense
                      outlined
                      background-color="white"
                      hide-details
                      :menu-props="{maxHeight: 350}"
                      required
                      :rules="rulesValidation"
                    ></v-autocomplete>
                  </v-col>

                  <v-divider vertical />

                  <v-col
                    cols="12"
                    sm="2"           
                  >
                    <div class="d-flex align-center">
                      <span class="mr-2" style="font-size:18px;color:#757575;">Lavar:</span>
                        <v-switch
                          v-model="new_rule.clean"
                          inset
                          class="my-0"
                          hide-details
                          color="success"
                        />
                    </div>

                  </v-col>

                  <v-col
                    cols="12"
                    sm="1"
                    class="py-0 ma-0 d-flex align-center justify-end"
                  >
                    <v-btn
                      color="#F44336"
                      dark
                      icon
                      class="px-0 add__rule mr-1"
                      @click="reset"
                    >
                      <img src="@/static/iconos/clear.svg" alt="clear" />
                    </v-btn>                  
                    <v-btn
                      color="#F44336"
                      dark
                      class="px-0 add__rule"
                      @click="add_rule"
                    >
                      <img src="@/static/iconos/add.svg" alt="plus" />
                    </v-btn>
                  </v-col>
                </v-row>
            </v-form>
          </v-container>
        </v-card>
      </v-col>
    </v-row>



    <v-row>
      <v-col>
        <v-card>
          <v-container>
            
            <v-row>
              <v-col cols="10" sm="4" class="pt-0">
                <div class="mb-1">
                  <small style="font-size:14px;color:#757575;">Filtrar resultados:</small>
                </div>
                
                <v-autocomplete
                  v-model="searched_value.pre_group_id"
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
              <v-col cols="12" sm="4" class="pt-0 d-flex align-end">
                <v-autocomplete
                  v-model="searched_value.cur_group_id"
                  :items="groups"
                  item-text="nombre"
                  item-value="id"
                  label="Grupo posterior"
                  dense
                  outlined
                  background-color="white"
                  hide-details
                  :menu-props="{maxHeight: 350}"
                  required
                ></v-autocomplete>                      
              </v-col>
              <v-spacer />
              <v-col cols="2" class="d-flex justify-end align-end pt-0">
                <v-btn
                  color="#F44336"
                  dark
                  icon
                  class="px-0 add__rule mr-1"
                  @click="clearFilter"
                >
                  <img src="@/static/iconos/clear_filter.svg" alt="clear" />
                </v-btn>  
                <v-btn
                  color="#F44336"
                  dark
                  class="px-0 add__rule"
                  @click="filtrarTabla"
                >
                  <img src="@/static/iconos/filter.svg" alt="filter" />
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
          <v-data-table
            :headers="headers"
            :items="rules"
            class="m-2"
            :options.sync="options"
            no-data-text="Sin datos"
            :footer-props="footerProps"
          >
            <template v-slot:[`item.clean`]="{ item }" > 
              <div class="d-flex justify-center">
                <div v-show="false">{{item.clean == 1 ? item.clean = true : item.clean=false}}</div>
                <v-switch
                  v-model="item.clean"
                  readonly
                  inset
                  class="my-0"
                  hide-details
                  color="success"
                />                
              </div>
            </template>

            <template v-slot:[`item.editar`]="{ item }">
              <edit-rule @click="getRules" :ruleProp="item"/>
            </template>

            <template v-slot:[`item.eliminar`]="{ item }">
              <delete-rule @reload="getRules" :rule="item"/>
            </template>

            <template v-for="(h, i) in headers" v-slot:[`header.${h.value}`]="{ headers }">
              <span :key="i+1">{{h.text}}</span>  
                  <v-btn
                  v-if="i == 2"
                  @click="flag ? sortAc(rules, h.value, i) : sortDc(rules, h.value, i)"
                  icon
                  :key="i"
                  :class="ctrl[i]"
                >
                  <img
                    src="@/static/iconos/filter_list_gray_24dp.svg"
                    alt="sort"
                  />
                </v-btn>           
            </template>

<!--             <template v-slot:[`item.data-table-expand`]="{ expand, isExpanded }">
              <v-btn
              icon
              @click="expand(!isExpanded)"
              :class="isExpanded ? 'anim1':''"
              >
                <img src="@/static/iconos/expand_more.svg" alt="expand">
              </v-btn>
            </template> -->

            <template v-slot:[`footer.page-text`] >

              <v-btn
                color="primary"
                dark
                class="ma-2"
                icon
                :disabled="options.page == 1"
                @click="options.page--"
              >
                <img
                  src="@/static/iconos/before.svg"
                  alt="before"
                />
              </v-btn>

              {{ `${options.page}/${Math.ceil(total/options.itemsPerPage)} `}}

              <v-btn
                color="primary"
                dark
                class="ma-2"
                icon
                :disabled="options.page == Math.ceil(total/options.itemsPerPage)"
                @click="options.page++"
              >
                <img
                  src="@/static/iconos/next.svg"
                  alt="next"
                />
              </v-btn>

            </template>

          </v-data-table>
          <v-dialog v-model="dialogSpinner" hide-overlay>
            <v-progress-circular
              :size="70"
              :width="7"
              color="primary"
              indeterminate
              class="spinner"
            ></v-progress-circular>
          </v-dialog>
        </v-card>
      </v-col>
    </v-row>
    <infoModal />
    <info-modal-crud/>
  </v-container>
</template>

<script>
import "material-design-icons-iconfont/dist/material-design-icons.css";
import axios from "@/plugins/axios";
import edit_rule from "@/components/washing_rules/edit_rule.vue";
import delete_rule from "@/components/washing_rules/delete_rule.vue";
import infoModal from "@/components/common/infoModal";
import infoModalCRUD from "@/components/common/infoModalCRUD.vue";
import Cookies from "js-cookie";
let CSVtoJSON = require("csvtojson");
import { mapState, mapMutations } from "vuex";


export default {
  middleware: "NOAUTH",
  props: ['bus'],
  components: {
    edit_rule,
    delete_rule,
    infoModal,
    infoModalCRUD
  },
  data: () => ({
    valid:false,
    rulesValidation: [
      v => !!v || 'Campo requerido',
    ],
    rules:[],
    expanded: [],
    singleExpand: false,
    ctrl:[],
    pre_group:null,
    pos_group:null,
    groups:[],
    flag:true,
    sortClass: '',
    new_rule:{
      pre_group_id:null,
      cur_group_id:null,
      clean:false
    },
    footerProps: {
      disablePagination: true,
      prevIcon: null,
      nextIcon: null,
      itemsPerPageText: "items por página",
      itemsPerPageOptions: [5, 10, 25],
    },
    datosCsv: null,
    dialogSpinner: false,
    total: null,
    searched_value:{
      cur_group_id:null,
      pre_group_id:null
    },
    options: {},
    files: null,
    headers: [
      /* { text: "id", value: "id", align: "center", sortable: false}, */
      { text: "Grupo anterior", value: "pre_group_name", align: "center" , sortable: false },
      { text: "Grupo actual", value: "cur_group_name", align: "center" , sortable: false },
      { text: "Limpiar", value: "clean", align: "center", sortable: false },
      { text: "Editar", value: "editar", align: "center", sortable: false},
      { text: "Eliminar", value: "eliminar", align: "center", sortable: false},
      //{ text: "Líneas", value: "data-table-expand"},
    ],
  }),
  computed: {
    ...mapState(["infoModal"]),
  },
  methods: {
    sortAc(arr, parametro, i){
      let ordenado = [];
      ordenado =  arr.sort(function( a, b){ return a[parametro] - b[parametro]; });
      this.flag = !this.flag
      this.ctrl=[];
      this.ctrl[i]='anim1';
      return ordenado;
    },
    sortDc(arr, parametro, i){
      let ordenado = [];
      ordenado =  arr.sort(function(a, b){ return b[parametro] - a[parametro]; });
      this.flag = !this.flag
      this.ctrl=[];
      this.ctrl[i]='anim2';
      return ordenado;
    },
    ...mapMutations(["toggleInfoModalCRUD","toggleInfoModal", "SET_DESLOGIN"]),
    show(){
      this.reset();
      this.getGroups();
    },
    reset(){
      if(this.$refs.form){
      this.$refs.form.reset(),
      this.$refs.form.resetValidation()        
      };
      this.new_rule = {
      pre_group_id:null,
      cur_group_id:null,
      clean:false
    }
    },
    async add_rule(){
      try {
        if(this.$refs.form.validate()){
          if( this.new_rule.pre_group_id != this.new_rule.cur_group_id ){
            this.new_rule.clean == true ? this.new_rule.clean = 1 : this.new_rule.clean = 0;
            let token = Cookies.get("token");
            await axios.post("washing_rules/rules", {
              pre_group_id:this.new_rule.pre_group_id,
              cur_group_id:this.new_rule.cur_group_id,
              clean:this.new_rule.clean
              }, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res)=>{
              console.log('add', res);
              this.toggleInfoModalCRUD({
                dialog: true,
                msj: `Nueva regla creada`,
                // s1:{ 
                //   status:res.data.server1.status, 
                //   msj:res.data.server1.message 
                //   },
                // s2:{ 
                //   status:res.data.server2.status, 
                //   msj:res.data.server2.message 
                //   },
                titulo: "Agregar Regla",
                alertType: "success",
              });
              this.dialog = false;
              this.loading = false;
              this.getRules();
              this.reset();
            });      
          } 
          else {
            alert('Los grupos no pueden ser iguales')
          }
        }
      } catch (error) {
        if(error.response){
            this.toggleInfoModal({
            dialog: true,
            msj: `${error.response.data.message}`,
            titulo: "Agregar regla",
            alertType: "error",
            });
            console.error('POST adding error:', error.response.data.message)
            this.loading = false;
        }
        else{
            this.toggleInfoModal({
            dialog: true,
            msj: `Ha ocurrido un error al crear la nueva regla`,
            titulo: "Agregar regla",
            alertType: "error",
            });
            this.loading = false;
        }         
      }
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
          //console.log('Get groups', res);
            this.groups = res.data.data.data;
          });
      } catch (error) {
        console.log('ERROR_GET_GROUPS:', error);
      }
    },
    async filtrarTabla() {
      this.options.searched_value = this.searched_value;
      await this.getRules();
      this.options.page = 1; //para que al filtrar desde otra page se vaya a 1 donde estan los resultados
    },
    async clearFilter(){
      this.searched_value = {
        cur_group_id:null,
        pre_group_id:null
      };
      this.options.searched_value = {
        cur_group_id:null,
        pre_group_id:null
      };
      this.getRules();
    },
    async getRules() {
      this.dialogSpinner = true;
      let token = Cookies.get("token");
      await axios
        .get("washing_rules/rules", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            options: this.options,
          },
        })
        .then((res) => {
          //console.log('rules', res);
          this.rules = res.data.rules;
          this.total = res.data.total;
          this.dialogSpinner = false;
        })
        .catch((error) => {
          console.log(error);
          /* this.toggleInfoModal({
            dialog: true,
            msj: `Ha ocurrido un error`,
            titulo: "Filtrar Datos",
            alertType: "error",
          }); */
        });
    },
    async descargaCSV() {
      this.dialogSpinner = true;
      let productos = await this.getGroups();
      await this.csvExport(productos);
      this.dialogSpinner = false;
    },
    csvExport(arrData) {
      for (let i = 0; i < arrData.length; i++) {
        delete arrData[i].fecha;
      }
      let csvContent = "data:text/csv;charset=utf-8,";

      csvContent += [
        Object.keys(arrData[0]).join(";"),
        ...arrData.map((item) => Object.values(item).join(";")),
      ]
        .join("\n")
        .replace(/(^\[)|(\]$)/gm, "");
      const data = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", data);
      link.setAttribute("download", "export.csv");
      link.click();
    },
    csvImport(files) {
      try {
        var file = files;
        var reader = new FileReader();
        file = new Blob([file], { type: "text/plain" });
        reader.readAsBinaryString(file);
        reader.onload = (event) => {
          var lines = event.target.result.split("\n");

          const result = [];
          const headers = lines[0].split(";");

          for (let i = 0; i < lines.length; i++) {
            if (!lines[i]) continue;
            const obj = {};
            let currentline = lines[i].split(";");

            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentline[j];
            }
            this.cargarProduct(obj);
          }
          this.datosCsv = null;
          this.getGroups();
          this.toggleInfoModal({
            dialog: true,
            msj: `Producto(s) agregado(s) correctamente`,
            titulo: "Importar CSV",
            alertType: "success",
          });
        };
      } catch (error) {
        console.log(error);
      }
    },
  },
  created() {
    this.bus.$on('click', this.show)
  }, 
  mounted(){
    this.reset();
    this.getGroups();
  },
  watch: {
    options: {
      handler() {
        this.options.all = false;
        this.getRules();
      },
      deep: true,
    }
  },
};
</script>

<style lang="css" scoped>
.my_table_style{
  background-color: #ffe4d5;
}
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.div {
  border-radius: 5px;
  border: 2px solid #f44336;
  padding: 5px;
}

.crimperON {
  background-color: #4caf50;
  color: white;
  width: 30px;
  text-align: center;
  border-radius: 15px;
}
.crimperOFF {
  background-color: #f44336;
  color: white;
  width: 30px;
  text-align: center;
  border-radius: 15px;
}


@keyframes rotate360 {
  to { 
    transform: rotate(360deg);
  }
       
}
.anim1 { 
/* animation: 1s rotate360; */
-webkit-transform: rotate(180deg);
-moz-transform: rotate(180deg);
-o-transform: rotate(180deg);
-ms-transform: rotate(180deg);
transform: rotate(180deg);
background-color: rgb(219, 214, 214);
}

.anim2 { 
/* animation: 1s rotate360; */
-webkit-transform: rotate(360deg);
-moz-transform: rotate(180deg);
-o-transform: rotate(360deg);
-ms-transform: rotate(360deg);
transform: rotate(360deg);
background-color: rgb(219, 214, 214);
}
</style>

<style >
#table .v-data-footer .v-icon {
  color: blue !important;
}
</style>

<style>
#table .v-data-footer .v-icon {
  color: blue !important;
}
</style>
<style >
#table .v-data-footer .v-icon {
  color: blue !important;
}
.v-data-footer__pagination{
  position: absolute;
  margin-left: 0px!important;
  margin-right: 0px!important;
}
.v-data-footer__select{
  margin-right: 45px!important;
}
.add__rule{
  width: 40px;
}
</style>