<template>
  <v-container>
    <v-row class="pa-0 ma-0">
      <v-col class="pa-0 ma-0">
        <v-card color="#FFE4D5">
          <v-container class="py-0">
<!--             <v-row>
              <v-col
                cols="12"
                sm="2"
                md="3"
                class="py-0 ma-0 d-flex align-center"
              >
                <v-btn
                  depressed
                  color="success"
                  @click="descargaCSV"
                  block
                  dark
                  class="my-2"
                >
                  <div class="d-sm-none d-md-flex">Descargar .CSV</div>
                  <img
                    class="ml-2 d-sm-none d-md-flex"
                    src="@/static/iconos/baseline_cloud_download_white_1x.png"
                    alt="upload"
                  />
                  <img
                    class="d-none d-sm-flex d-md-none"
                    src="@/static/iconos/baseline_cloud_download_white_2x.png"
                    alt="upload"
                  />
                </v-btn>
              </v-col>
              <v-spacer />
              <v-col></v-col>
            </v-row> -->
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-tabs
            v-model="tabs"
            fixed-tabs
          >
            <v-tabs-slider></v-tabs-slider>
            <v-tab
              href="#mobile-tabs-5-1"
              style="max-width:100%;"
              @click="SET_DISPATCH"
            >
              <span class="d-flex align-center"> 
                  <img
                    src="@/static/iconos/codes.svg"
                    alt="upload"
                  /> 
                  <span
                  class="ml-2"
                  >
                    Códigos
                  </span>
              </span>                    
            </v-tab>

            <v-tab
              href="#mobile-tabs-5-2"
              style="max-width:100%;"
            >
              <span class="d-flex align-center"> 
                  <img
                    src="@/static/iconos/groups.svg"
                    alt="upload"
                  /> 
                  <span
                  class="ml-2"
                  >
                    Grupos
                  </span>
              </span>                 
            </v-tab>

            <v-tab
              href="#mobile-tabs-5-3"
              style="max-width:100%;"
              @click="rulesFn"
            >
            <span class="d-flex align-center"> 
                <img
                  src="@/static/iconos/rules.svg"
                  alt="upload"
                /> 
                <span
                class="ml-2"
                >
                  Reglas
                </span>
            </span>                  
            </v-tab>            

          </v-tabs>

          <v-tabs-items v-model="tabs">
            <v-tab-item
              v-for="i in 3"
              :key="i"
              :value="'mobile-tabs-5-' + i"
            >
              <codes-table v-if="i==1"/>
              <groups-table v-if="i==2" @reloadFromRules="reloadRules"/>
              <rules-table :bus="bus" v-if="i==3"/>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue'
import "material-design-icons-iconfont/dist/material-design-icons.css";
import edit from "@/components/common/editar";
import axios from "@/plugins/axios";
import delet from "@/components/common/eliminar";
import create from "~/components/washing_rules/add_group.vue";
import infoModal from "@/components/common/infoModal";
import infoModalCRUD from "@/components/common/infoModalCRUD.vue";
import codes_table from "@/components/washing_rules/codes_table.vue";
import groups_table from "@/components/washing_rules/groups_table.vue";
import rules_table from "@/components/washing_rules/rules_table.vue";
import Cookies from "js-cookie";
let CSVtoJSON = require("csvtojson");
import { mapState, mapMutations } from "vuex";


export default {
  middleware: "NOAUTH",
  components: {
    edit,
    delet,
    create,
    infoModal,
    infoModalCRUD,
    codes_table,
    groups_table,
    rules_table
  },
  data: () => ({
    tabs: null,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    expanded: [],
    singleExpand: false,
    ctrl:[],
    flag:true,
    sortClass: '',
    footerProps: {
      disablePagination: true,
      prevIcon: null,
      nextIcon: null,
      itemsPerPageText: "items por página",
      itemsPerPageOptions: [5, 10, 25],
    },
    datosCsv: null,
    bus: new Vue(),
    pag: null,
    dialogSpinner: false,
    total: null,
    perPage: 10,
    page: 1,
    pageCount: 1,
    cod_pt: "",
    products: [],
    options: {},
    files: null,
    headers: [
      { text: "Codigo", value: "cod_pt", align: "center", sortable: false},
      { text: "Descripción", value: "description", align: "center" , sortable: false},
      { text: "Editar", value: "editar", align: "center", sortable: false},
      { text: "Eliminar", value: "eliminar", align: "center", sortable: false},
      { text: "Líneas", value: "data-table-expand"},
    ],
    headersLineas:[
      { text: 'Líneas', value: 'line', sortable: false, class:'my_table_style', align:'center' },
      { text: 'Temperatura', value: 'temperature', sortable: false, class:'my_table_style', align:'center', width:'150px' },
      { text: 'Velocidad', value: 'velocity', sortable: false, class:'my_table_style', align:'center', width:'150px' },
      { text: 'V.Crimper', value: 'onCrimp', sortable: false, class:'my_table_style', align:'center' },
    ],
    lineas:[],
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
    ...mapMutations(["toggleInfoModal", "SET_DESLOGIN", "SET_DISPATCH"]),
   async filtrarTabla() {
        await this.getProducts();
        this.options.page = 1; //para que al filtrar desde otra page se vaya a 1 donde estan los resultados
    },
    async getProducts() {
      this.dialogSpinner = true;
      let token = Cookies.get("token");
      await axios
        .get("products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            options: this.options,
            cod_pt: this.cod_pt,
          },
        })
        .then((res) => {
          this.products = res.data.data.products;
          this.lineas = res.data.data.lines
          this.total = res.data.data.total;
          this.dialogSpinner = false;
          if(this.cod_pt != ""){
            this.expanded = [ { "cod_pt": this.cod_pt }];
          }
          else{
            this.expanded = [{ "cod_pt": -1 }];
          }
          if (this.cod_pt != null) {
            this.$refs.cod_pt.focus();
          }
        })
        .catch((error) => {
          console.log(error);
          this.toggleInfoModal({
            dialog: true,
            msj: `Ha ocurrido un error`,
            titulo: "Filtrar Datos",
            alertType: "error",
          });
        });
    },
    filtrarLineas(codigo){
      if(codigo){
        let resultado = this.lineas.filter((item)=> item.cod_pt == codigo)
         return resultado[0].setPoints;
      }
    },
    csvModelo() {
      let csvContent = "data:text/csv;charset=utf-8,";
      let arr = [
        {
          cod_pt: 1111,
          description: "Lorem ipsum dolor sit amet",
          l310_sp_temp : 45,
          l310_sp_vel  : 45,
          l310_oncrimp : true,
          l320_sp_temp : 45,
          l320_sp_vel  : 45,
          l320_oncrimp : true,
          l330_sp_temp : 45,
          l330_sp_vel  : 45,
          l330_oncrimp : false,
          l340_sp_temp : 45,
          l340_sp_vel  : 45,
          l340_oncrimp : false,
        },
        {
          cod_pt: 9999,
          description: "Lorem ipsum dolor sit amet",
          l310_sp_temp : 65,
          l310_sp_vel  : 65,
          l310_oncrimp : true,
          l320_sp_temp : 65,
          l320_sp_vel  : 65,
          l320_oncrimp : true,
          l330_sp_temp : 65,
          l330_sp_vel  : 65,
          l330_oncrimp : false,
          l340_sp_temp : 65,
          l340_sp_vel  : 65,
          l340_oncrimp : false,
        },
      ];
      csvContent += [
        Object.keys(arr[0]).join(";"),
        ...arr.map((item) => Object.values(item).join(";")),
      ]
        .join("\n")
        .replace(/(^\[)|(\]$)/gm, "");

      const data = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", data);
      link.setAttribute("download", "plantilla.csv");
      link.click();
    },
    async getAllProducts() {
      this.dialogSpinner = true;
      let token = Cookies.get("token");
      let all = [];

      try {
     await axios
        .get("products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            options: this.options,
            cod_pt: this.cod_pt,
          },
        })
        .then((res) => {
          let products = res.data.data.products;
          let lineas = res.data.data.lines

          lineas = lineas.map((item)=> item.setPoints)
          all = products.map((item, index) => {
            return{
              ...item,
              l310_sp_temp : lineas[index][0].temperature,
              l310_sp_vel  : lineas[index][0].velocity,
              l310_oncrimp : lineas[index][0].onCrimp,
              l320_sp_temp : lineas[index][1].temperature,
              l320_sp_vel  : lineas[index][1].velocity,
              l320_oncrimp : lineas[index][1].onCrimp,
              l330_sp_temp : lineas[index][2].temperature,
              l330_sp_vel  : lineas[index][2].velocity,
              l330_oncrimp : lineas[index][2].onCrimp,
              l340_sp_temp : lineas[index][3].temperature,
              l340_sp_vel  : lineas[index][3].velocity,
              l340_oncrimp : lineas[index][3].onCrimp,
            }
          });
          this.dialogSpinner = false;
          if (this.cod_pt != null) {
            this.$refs.cod_pt.focus();
          }
        })
        return all;        
      } catch (error) {
          console.log(error);
          this.toggleInfoModal({
            dialog: true,
            msj: `Ha ocurrido al consultar los datos`,
            titulo: "Descargar .CSV",
            alertType: "error",
          });        
      }
    },
    async descargaCSV() {
      this.dialogSpinner = true;
      let productos = await this.getAllProducts();
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
    async cargarProduct(obj) {
      let token = Cookies.get("token");
      await axios.post("products", obj, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
          this.getProducts();
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
    rulesFn(){
      this.bus.$emit('click');
    },
    reloadRules(){
      this.bus.$emit('reload');
    }
  },
  watch: {
/*     cod_pt: function () {
      if (this.cod_pt == "") {
        this.filtrarTabla();
      }
    },
    options: {
      handler() {
        this.getProducts()
      },
      deep: true,
    } */
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
