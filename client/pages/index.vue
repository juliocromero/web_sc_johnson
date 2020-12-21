<template>
  <v-container>
    <v-row class="pa-0 ma-0">
      <v-col class="pa-0 ma-0">
        <v-card color="#FFE4D5">
          <v-container class="py-0">
            <v-row  >
              <v-col cols="12"  sm="2" md="3" class="py-0 ma-0 d-flex align-center">
                <v-btn
                  depressed
                  color="success"
                  @click="descargaCSV"
                  block
                  dark
                  class="my-2"          
                >
                 <div class="d-sm-none d-md-flex">Descargar .CSV</div> 
                  <img class="ml-2 d-sm-none d-md-flex" src="@/static/iconos/baseline_cloud_download_white_1x.png" alt="upload">
                  <img class="d-none d-sm-flex d-md-none" src="@/static/iconos/baseline_cloud_download_white_2x.png" alt="upload">
                </v-btn>
              </v-col>
              <v-spacer/>
              <v-col cols="12"  sm=6 md="3" class="py-0 ma-0">
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

              <v-col cols="12"  sm="4" md="3" class="py-0 ma-0 d-flex align-center">
                <v-btn
                  depressed
                  color="#F44336"
                  @click="csvModelo(product)"
                  block
                  dark
                  class="my-2"
                >
                  Plantilla CSV
                   <img class="ml-2" src="@/static/iconos/baseline_cloud_download_white_1x.png" alt="upload">
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
                <create @reload="producto" />
              </v-col>
              <v-spacer />
              <v-col cols="8" sm="8" class="mt-0 pt-0">
                <v-text-field
                  type="number"
                  v-model="cod_pt"
                  append-icon="mdi-magnify"
                  label="Ingrese un código y presione Enter"
                  single-line
                  hide-details
                  class="mr-1"
                  ref="cod_pt"
                  counter
                  oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
                  maxlength="8"
                  @keyup.enter="filtrarTabla"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>

          <v-data-table
            :headers="headers"
            :items="product"
            class="m-2"
            :page="page"
            :itemsPerPage="10"
            :server-items-length="parseInt(total)"
            @pagination="indexPage($event)"
            no-data-text="No se encontraron resultados"
            :footer-props="{
                prevIcon: 'mdi-arrow-left',
                nextIcon:'mdi-arrow-right',
                itemsPerPageText: 'items por página',
                pageText: 'páginas',
                itemsPerPageOptions: [5, 10, 25] 
              }"
          >
            <template v-slot:[`item.editar`]="{ item }">
              <edit :editar="item" @reload="producto" />
            </template>

            <template v-slot:[`item.eliminar`]="{ item }">
              <delet :delet="item" @reload="producto" />
            </template>

            <template v-slot:[`item.oncrimp`]="{ item }">
              <input 
              :class="item.oncrimp ? 'crimperON' : 'crimperOFF'"  
              type="text" 
              :value="item.oncrimp ?  'On' : 'Off'" 
              disabled
              />
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
  </v-container>
</template>

<script>
import "material-design-icons-iconfont/dist/material-design-icons.css";
import edit from "@/components/common/editar";
import axios from "../plugins/axios";
import delet from "@/components/common/eliminar";
import create from "@/components/common/crear";
import infoModal from "@/components/common/infoModal";
import Cookies from "js-cookie";
let CSVtoJSON = require("csvtojson");
import { mapState, mapMutations } from "vuex";
/* import { delete } from 'vue/types/umd'; */

export default {
  middleware: "NOAUTH",
  components: {
    edit,
    delet,
    create,
    infoModal,
  },
  data: () => ({
    datosCsv:null,
    pag : null,
    dialogSpinner: false,
    total: null,
    perPage: 10,
    page: 1,
    cod_pt: null,
    product: [],
    files: null,
    headers: [
      {
        text: "Codigo",
        value: "cod_pt",
        align: "center",
        filterable: false,
      },
      { text: "SP Temperatura", value: "sp_temp", align: "center" },
      { text: "SP Velocidad", value: "sp_vel", align: "center" },
      { text: "Descripción", value: "description", align: "center" },
      { text: "Válvula crimper", value: "oncrimp", align: "center" },
      { text: "Editar", value: "editar", align: "center" },
      { text: "Eliminar", value: "eliminar", align: "center" },

    ],
  }),
  computed: {
    ...mapState(["infoModal"]),
  },
  watch: {

        cod_pt: function () { 
                if(this.cod_pt === ""){
                  this.page = this.pag
                  this.cod_pt = null
                  this.indexPage(this.$emit("pagination"))                
                } 
        }
  },
  methods: {
    ...mapMutations(["toggleInfoModal",'SET_DESLOGIN']),
    filtrarTabla(){
      try {
        if(this.cod_pt){
        this.dialogSpinner = true;
        let pg = this.$emit("pagination")
        if(pg.page>1){
        this.pag = pg.page
        }
      this.indexPage(pg)
      pg.page = 1        
      }
      } catch (error) {
        console.log(erro)
      }
    },
    async indexPage(e) {
      this.page = e.page;
      this.perPage = e.itemsPerPage;
      this.producto() 
    },
    async producto() {
      this.dialogSpinner = true;
      let token = Cookies.get("token");
      await axios
        .get("product", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: this.page,
            perPage: this.perPage,
            cod_pt: this.cod_pt
          }
        })
        .then((res) => {
          this.product = res.data.data.data;
          this.total = res.data.data.total;
          this.dialogSpinner = false;
          if(this.cod_pt != null){this.$refs.cod_pt.focus()}
        }).catch(error =>{
          console.log(error)
            this.toggleInfoModal({
            dialog: true,
            msj: `Ha ocurrido un error`,
            titulo: "Filtrar Datos",
            alertType: "error",
          });
        })
    },
    csvModelo() {
      let csvContent = "data:text/csv;charset=utf-8,";
      let arr = [
        {
          codigo: 100,
          sp_temperatura: "99",
          sp_velocidad: "99",
          description: "Lorem ipsum dolor sit amet",
          crimper: "false",
        },
        {
          codigo: 101,
          sp_temperatura: "100",
          sp_velocidad: "100",
          description: "Lorem ipsum dolor sit amet",
          crimper: "true",
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
 async callAllProducts(){
      let token = Cookies.get("token");
      let allProducts = await axios
        .get("product", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            perPage: '*',
            cod_pt: this.cod_pt
          }
        })
        .then((res) => {
          return res.data.data.data
        }).catch(error =>{
          console.log(error)
        })
        return allProducts;
    }
    ,
    async descargaCSV(){
    this.dialogSpinner = true;
    let productos =  await this.callAllProducts();
    await this.csvExport(productos)
    this.dialogSpinner = false;
    }
    ,
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
      await axios.post("product", obj, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    csvImport(files) {
      try {
        var file = files;
        var reader = new FileReader();
        file =  new Blob([file], { type: "text/plain" });
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
          this.datosCsv= null
          this.producto();
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
};
</script>

<style scoped>
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.div {
  border-radius: 5px;
  border: 2px solid #F44336;
  padding: 5px;
}

.crimperON{
  background-color: #4CAF50 ;
  color: white;
  width: 30px;
  text-align: center;
  border-radius: 15px;
}
.crimperOFF{
  background-color: #F44336 ;
  color: white;
  width: 30px;
  text-align: center;
  border-radius: 15px;
}
</style>
