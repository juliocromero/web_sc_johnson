<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-container>
            <v-row>
              <v-col cols="2" sm="2" class="ml-3" >
                <div class="wrapper__btns">
                  <add-code @reload="getCodes" class="mr-2"/>
                  <massive-codes-edit @reload="getCodes" /> 
                </div>
                          
              </v-col>
              <v-spacer />
              <v-col cols="8" sm="8" class="mt-0 pt-0">
                <v-text-field
                  type="number"
                  v-model="code"
                  append-icon="mdi-magnify"
                  @click:append="filtrarTabla"
                  label="Ingrese un código y presione Enter"
                  single-line
                  hide-details
                  class="mr-1"
                  ref="cod_pt"
                  maxlength="8"
                  @keyup.enter="filtrarTabla"
                >
                </v-text-field>                           
              </v-col>
            </v-row>
          </v-container>

          <v-data-table
            :headers="headers"
            :items="codes"
            class="m-2"
            :options.sync="options"
            :server-items-length="parseInt(total)"
            no-data-text="Sin datos"
            :footer-props="footerProps"
          >
            <template v-slot:[`item.grupo`]="{ item }">
              <v-chip
                class="ma-2"
                color="#ffe4d5"
                text-color="white"
                v-if="item.grupo"
              >
                <!-- <v-avatar
                  color="#f44336"
                  class="white--text"
                >
                  {{item.grupo.id}}
                </v-avatar> -->
                  <span style="color:#f44336;">{{item.grupo.nombre}}</span>
              </v-chip>
              <span v-if="!item.grupo"><i style="color:#A0A0A0">&lt;No asignado&gt;</i></span>
            </template>

            <template v-slot:[`item.editar`]="{ item }">
              <edit-code :code="item" @reload="getCodes"/>
            </template>

            <template v-slot:[`item.eliminar`]="{ item }">
              <delete-code :code="item" @reload="getCodes" />
            </template>

            <template v-for="(h, i) in headers" v-slot:[`header.${h.value}`]="{ headers }">
              <span :key="i+1">{{h.text}}</span>  
                  <v-btn
                  v-if="i < 1"
                  @click="flag ? sortAc(codes, h.value, i) : sortDc(codes, h.value, i)"
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

            <!-- <template v-slot:[`item.data-table-expand`]="{ expand, isExpanded }">
              <v-btn
              icon
              @click="expand(!isExpanded)"
              :class="isExpanded ? 'anim1':''"
              >
                <img src="@/static/iconos/expand_more.svg" alt="expand">
              </v-btn>
            </template> -->

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
import axios from "@/plugins/axios";
import add_code from "@/components/washing_rules/add_code.vue";
import massive_codes_edit from "@/components/washing_rules/massive_codes_edit.vue";
import delete_code from "@/components/washing_rules/delete_code.vue";
import edit_code from "@/components/washing_rules/edit_code.vue";
import infoModal from "@/components/common/infoModal";
import infoModalCRUD from "@/components/common/infoModalCRUD.vue";
import Cookies from "js-cookie";
let CSVtoJSON = require("csvtojson");
import { mapState, mapMutations } from "vuex";


export default {
  middleware: "NOAUTH",
  components: {
    edit,
    delete_code,
    edit_code,
    add_code,
    massive_codes_edit,
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
    code: null,
    group:null,
    options: {},
    files: null,
    headers: [
      { text: "Codigo", value: "id", align: "center", sortable: false},
      { text: "Nombre", value: "nombre", align: "center" , sortable: false},
      { text: "Grupo", value: "grupo", align: "center" , sortable: false},
      { text: "Editar", value: "editar", align: "center", sortable: false},
      { text: "Eliminar", value: "eliminar", align: "center", sortable: false},
      //{ text: "Líneas", value: "data-table-expand"},
    ],
    codes:[],
  }),
  computed: {
    ...mapState(["infoModal", "dispatch" ]),
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
   async filtrarTabla() {
        await this.getCodes();
        this.options.page = 1; //para que al filtrar desde otra page se vaya a 1 donde estan los resultados
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
            options: this.options,
            code: this.code
          },
        })
        .then((res) => {
          this.codes = res.data.data.data;
          this.total = res.data.data.total;
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
      let productos = await this.getCodes();
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
          this.getCodes();
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
  mounted(){
    this.getCodes();
  },
  watch: {
    dispatch:function () {
      this.getCodes(); 
    },
    code: function () {
      if (this.code == "") {
        this.filtrarTabla();
      }
    },
    options: {
      handler() {
        this.getCodes();
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
.wrapper__btns{
  display: flex;
  flex-direction: row !important;
  max-width: 40px;
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
</style>