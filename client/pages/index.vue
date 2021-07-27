<template>
  <v-container>
    <v-row class="pa-0 ma-0">
      <v-col class="pa-0 ma-0">
        <v-card color="#FFE4D5">
          <v-container class="py-0">
            <v-row>
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
              <v-col cols="12" sm="6" md="3" class="py-0 ma-0">
                <v-file-input
                  v-model="datosCsv"
                  placeholder=" Archivo .csv"
                  accept=".csv"
                  @change="csvImport"
                  hide-details
                  outlined
                  dense
                  prepend-icon
                  prepend-inner-icon="attach_file"
                  background-color="#FFFFFF"
                  color="black"
                  class="my-2"
                >
                </v-file-input>
              </v-col>

              <v-col
                cols="12"
                sm="4"
                md="3"
                class="py-0 ma-0 d-flex align-center"
              >
                <v-btn
                  depressed
                  color="#F44336"
                  @click="csvModelo(products)"
                  block
                  dark
                  class="my-2"
                >
                  Plantilla CSV
                  <img
                    class="ml-2"
                    src="@/static/iconos/baseline_cloud_download_white_1x.png"
                    alt="upload"
                  />
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-container>
            <v-row>
              <v-col cols="2" sm="2" class="ml-3">
                <create @reload="getProducts" />
              </v-col>
              <v-spacer />
              <v-col cols="8" sm="8" class="mt-0 pt-0">
                <v-text-field
                  type="number"
                  v-model="cod_pt"
                  append-icon="mdi-magnify"
                  @click:append="filtrarTabla"
                  label="Ingrese un código y presione Enter"
                  single-line
                  hide-details
                  class="mr-1"
                  ref="cod_pt"
                  counter
                  maxlength="8"
                  @keyup.enter="filtrarTabla"
                >
                </v-text-field>                           
              </v-col>
            </v-row>
          </v-container>

          <v-data-table
            :headers="headers"
            :items="products"
            class="m-2"
            :options.sync="options"
            :server-items-length="parseInt(total)"
            no-data-text="Sin datos"
            :single-expand="singleExpand"
            :expanded.sync="expanded"
            item-key="cod_pt"
            show-expand
          >
            <template v-slot:[`item.editar`]="{ item }">
              <edit :product="item" :lines="filtrarLineas(item.cod_pt)" @reload="getProducts" />
            </template>

            <template v-slot:[`item.eliminar`]="{ item }">
              <delet :delet="item" @reload="getProducts" />
            </template>

            <template v-slot:[`item.oncrimp`]="{ item }">
              <input
                :class="item.oncrimp ? 'crimperON' : 'crimperOFF'"
                type="text"
                :value="item.oncrimp ? 'On' : 'Off'"
                disabled
              />
            </template>
            <template v-for="(h, i) in headers" v-slot:[`header.${h.value}`]="{ headers }">
              <span :key="i+1">{{h.text}}</span>  
                  <v-btn
                  v-if="i < 1"
                  @click="flag ? sortAc(products, h.value, i) : sortDc(products, h.value, i)"
                  icon
                  :key="i"
                  :class="ctrl[i]"
                >
                  <img
                    src="@/static/iconos/filter_list-white-24dp.svg"
                    alt="sort"
                  />
                </v-btn>           
            </template>

            <template v-slot:[`item.data-table-expand`]="{ expand, isExpanded }">
              <v-btn
              icon
              @click="expand(!isExpanded)"
              :class="isExpanded ? 'anim1':''"
              >
                <img src="@/static/iconos/expand_more.svg" alt="expand">
              </v-btn>
            </template>

            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" class="px-0">
                <v-data-table
                  :headers="headersLineas"
                  :items="filtrarLineas(item.cod_pt)"
                  hide-default-footer
                  height="100%"
                  style="background:rgb(241, 241, 241,0.3);box-shadow: inset 0 0 20px 0 #E7E7E7;"
                >
                  <template v-slot:[`item.onCrimp`]="{ item }" class="pa-0">
                    <div style="display: flex;align-items: center;justify-content: center;">
                      <!--<v-switch
                        v-model="item.onCrimp"
                        color="success"
                        hide-details
                        readonly
                        dense
                        class="ma-0 ml-4"
                      ></v-switch>  -->
                      <v-chip small color="success" v-if="item.onCrimp">ON</v-chip>
                      <v-chip small color="error" v-if="!item.onCrimp">OFF</v-chip>                         
                    </div>
                  </template>
                </v-data-table>
              </td>
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
import edit from "@/components/common/editar";
import axios from "../plugins/axios";
import delet from "@/components/common/eliminar";
import create from "@/components/common/crear";
import infoModal from "@/components/common/infoModal";
import infoModalCRUD from "@/components/common/infoModalCRUD.vue";
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
    infoModalCRUD
  },
  data: () => ({
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
    pag: null,
    dialogSpinner: false,
    total: null,
    perPage: 10,
    page: 1,
    pageCount: 1,
    cod_pt: null,
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
    ...mapMutations(["toggleInfoModal", "SET_DESLOGIN"]),
    filtrarTabla() {
      this.getProducts();
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
          this.cod_pt ? this.expanded : this.expanded = []; //para expandir la tabla de linea solo al filtrar
          this.dialogSpinner = false;
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
  },
  watch: {
    cod_pt: function () {
      if (this.cod_pt === "") {
        this.getProducts();
      }
    },
    options: {
      handler() {
        //this.fillItems()
        this.getProducts()
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
