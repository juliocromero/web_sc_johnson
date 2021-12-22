<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-container>
            <v-row>
              <v-col cols="2" sm="2" class="ml-3">
                <add-group @reload="getGroups" />
              </v-col>
              <v-spacer />
              <v-col cols="8" sm="8" class="mt-0 pt-0">
                <v-text-field 
                  v-model="group_name"
                  append-icon="mdi-magnify"
                  @click:append="filtrarTabla"
                  label="Ingrese un nombre y presione Enter"
                  single-line
                  hide-details
                  class="mr-1"
                  @keyup.enter="filtrarTabla"
                >
                </v-text-field>                           
              </v-col>
            </v-row>
          </v-container>
          <v-data-table
            :headers="headers"
            :items="groups"
            class="m-2"
            :options.sync="options"
            no-data-text="Sin datos"
            :footer-props="footerProps"
          >
            <template v-slot:[`item.grupo`]="{ item }">
              <v-chip
                class="ma-2"
                color="#ffe4d5"
                text-color="white"
              >
                <v-avatar
                  color="#f44336"
                  class="white--text"
                >
                  {{item.grupo}}
                </v-avatar>
              </v-chip>
            </template>

            <template v-slot:[`item.editar`]="{ item }">
              <edit-group @click="getGroups" @reload-rules="reloadFromRules" :id_group="item.id"/>
            </template>

            <template v-slot:[`item.eliminar`]="{ item }">
              <delete-group @reload="getGroups" :group="item"/>
            </template>

            <template v-for="(h, i) in headers" v-slot:[`header.${h.value}`]="{ headers }">
              <span :key="i+1">{{h.text}}</span>  
                  <v-btn
                  v-if="i == 2"
                  @click="flag ? sortAc(groups, h.value, i) : sortDc(groups, h.value, i)"
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
import add_group from "@/components/washing_rules/add_group.vue";
import edit_group from "@/components/washing_rules/edit_group.vue";
import delete_group from "@/components/washing_rules/delete_group.vue";
import infoModal from "@/components/common/infoModal";
import infoModalCRUD from "@/components/common/infoModalCRUD.vue";
import Cookies from "js-cookie";
let CSVtoJSON = require("csvtojson");
import { mapState, mapMutations } from "vuex";


export default {
  middleware: "NOAUTH",
  components: {
    add_group,
    edit_group,
    delete_group,
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
    dialogSpinner: false,
    total: null,
    group_name:null,
    options: {},
    files: null,
    headers: [
      /* { text: "id", value: "id", align: "center", sortable: false}, */
      { text: "Nombre", value: "nombre", align: "center" , sortable: false},
      { text: "Familia", value: "familia", align: "center" , sortable: false},
      { text: "TMax", value: "t_maxlmp", align: "center", sortable: false},
      { text: "Editar", value: "editar", align: "center", sortable: false},
      { text: "Eliminar", value: "eliminar", align: "center", sortable: false},
      //{ text: "Líneas", value: "data-table-expand"},
    ],
    groups:[],
  }),
  computed: {
    ...mapState(["infoModal"]),
  },
  methods: {
    reloadFromRules(){
      this.$emit('reloadFromRules');
    },
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
     this.options.all = false;
      await this.getGroups();
      this.options.page = 1; //para que al filtrar desde otra page se vaya a 1 donde estan los resultados
    },
    async getGroups() {
      this.dialogSpinner = true;
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
        .then((res) => {
          this.groups = res.data.data.data;
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
  watch: {
    group_name: {
      handler() {
        if (this.group_name == "") {
          this.options.all = false;
          this.getGroups();
          this.group_name = null;
        }
      }
    },
    options: {
      handler() {
        this.options.all = false;
        this.getGroups();
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
</style>