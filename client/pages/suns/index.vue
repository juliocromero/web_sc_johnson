<template>
  <v-container>
    <!--     <v-row class="pa-0 ma-0">
      <v-col class="pa-0 ma-0">
        <v-card color="#FFE4D5">
          <v-container class="py-0">
            <v-row>
              <v-spacer/>
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
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row> -->

    <v-row>
      <v-col>
        <v-card>
          <v-container>
            <v-row>
              <v-col cols="2" sm="2" class=" d-flex ml-3">

                <!-- <sync class="mr-2" @reload="getSuns"/> -->
          
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      depressed
                      color="success"
                      @click="descargaCSV"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    >
                      <!-- <div class="d-sm-none d-md-flex">Descargar .CSV</div> -->
                      <img
                        src="@/static/iconos/cloud_download.svg"
                        alt="upload"
                      />
                    </v-btn>   
                  </template>
                  <span>Descargar datos en .csv</span>
                </v-tooltip>
              </v-col>
              <v-spacer />
              <v-col cols="8" sm="8" class="mt-0 pt-0">
                <v-text-field
                  v-model="searched_value"
                  append-icon="mdi-magnify"
                  label="Indique un lote ó sun y presione enter"
                  single-line
                  hide-details
                  class="mr-1"
                  @keyup.enter="filtrarTabla"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-data-table
                  :headers="headers"
                  :items="suns"
                  class="m-2"
                  :options.sync="options"
                  no-data-text="Sin datos"
                  :single-expand="singleExpand"
                  :expanded.sync="expanded"
                  show-expand
                  item-key="lote"
                  :footer-props="footerProps"
                >
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
                  <template v-for="(h, i) in headers" v-slot:[`header.${h.value}`]="{ headers }">
                    <span :key="i+1">{{h.text}}</span>  
                        <v-btn
                        v-if="i < 1"
                        @click="flag ? sortAc(suns, h.value, i) : sortDc(suns, h.value, i)"
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

                  <template
                    v-slot:[`item.data-table-expand`]="{ expand, isExpanded }"
                  >
                    <v-btn
                      icon
                      @click="expand(!isExpanded)"
                      :class="isExpanded ? 'anim1' : ''"
                    >
                      <img src="@/static/iconos/expand_more.svg" alt="expand" />
                    </v-btn>
                  </template>
                  <!-- TABLA SUNS -->
                  <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length" class="px-0">
                      <div class="wrapper__suns__table">
                        <v-data-table
                          :headers="headersSuns"
                          :items="item.suns"
                          hide-default-footer                     
                          height="100%"
                          style="background:rgb(241, 241, 241,0.3);box-shadow: inset 0 0 20px 0 #E7E7E7;"
                        >
                            <template v-slot:[`item.fecha_hora`]="{ item }">
                              {{ item.fecha_hora | fecha }}
                            </template>

                            <template v-slot:[`item.hora`]="{ item }">
                              {{ item.fecha_hora | hora }}
                            </template>
                        </v-data-table>                      
                      </div>
                    </td>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
            <v-dialog v-model="dialogSpinner" hide-overlay>
              <v-progress-circular
                :size="70"
                :width="7"
                color="primary"
                indeterminate
                class="spinner"
              ></v-progress-circular>
            </v-dialog>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <infoModal />
    <info-modal-crud />
  </v-container>
</template>

<script>
import "material-design-icons-iconfont/dist/material-design-icons.css";
import axios from "@/plugins/axios";
import infoModal from "@/components/common/infoModal";
import infoModalCRUD from "@/components/common/infoModalCRUD.vue";
import sync from "@/components/suns/sync.vue";
import moment from "moment";
import Cookies from "js-cookie";
let CSVtoJSON = require("csvtojson");
import { mapState, mapMutations } from "vuex";

export default {
  middleware: "NOAUTH",
  components: {
    infoModal,
    infoModalCRUD,
    sync
  },
  data: () => ({
    searched_value:null,
    expanded: [],
    singleExpand: true,
    ctrl: [],
    flag: true,
    sortClass: "",
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
    suns: [],
    options: {},
    files: null,
    headers: [
      { text:"Lote", value:'lote', align:"center", sortable:false },
      { text: "Ver Suns", value: "data-table-expand", width:100, align:"center", sortable:false},
    ],
    headersSuns:[
      { text: 'Suns', value: 'sun_number', sortable: false, class:'my_table_style', align:'center' },
      { text:"Fecha", value:'fecha_hora', sortable: true, class:'my_table_style', align:'center'  },
      { text:"Hora", value:'hora', sortable: true, class:'my_table_style', align:'center'  },
    ],
  }),
  computed: {
    ...mapState(["infoModal"]),
      totalRecords() {
          return this.total
      },
      pageCount() {
          return this.totalRecords / this.options.itemsPerPage
      },
  },
filters: {
  fecha: function (value) {
    if (!value) return ''
    return moment(value).format('DD-MM-YYYY');
  },
  hora: function (value) {
    if (!value) return ''
    return moment(value).format('HH:mm:ss');
  }
},
  methods: {
    sortAc(arr, parametro, i) {
      let ordenado = [];
      ordenado = arr.sort(function(a, b) {
        return a[parametro] - b[parametro];
      });
      this.flag = !this.flag;
      this.ctrl = [];
      this.ctrl[i] = "anim1";
      return ordenado;
    },
    sortDc(arr, parametro, i) {
      let ordenado = [];
      ordenado = arr.sort(function(a, b) {
        return b[parametro] - a[parametro];
      });
      this.flag = !this.flag;
      this.ctrl = [];
      this.ctrl[i] = "anim2";
      return ordenado;
    },
    ...mapMutations(["toggleInfoModal", "SET_DESLOGIN"]),
    async filtrarTabla() {
      if ( this.searched_value && this.searched_value != "") {
        this.getSuns();
        this.expanded = this.suns;
      } 
      this.options.page = 1; //para que al filtrar desde otra page se vaya a 1 donde estan los resultados
    },
    async getSuns() {
      this.dialogSpinner = true;
      let token = Cookies.get("token");
      await axios
        .get("producto_lote", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            options: this.options,
            searched_value:this.searched_value
          },
        })
        .then((res) => {
          this.suns = res.data.suns;
          this.total = res.data.total;
          this.dialogSpinner = false;
        })
        .catch((error) => {
          this.dialogSpinner = false;
          console.log(error);
        });
    },
    descargaCSV() {
      this.dialogSpinner = true;

      const arrData = this.suns.map( (item)=> {
        let suns = '';
        item.suns.map( item => suns += (' ' + item.sun_number.toString()) );
        console.log('sunsss', suns);
        return {
          lote: item.lote,
          suns: suns
        }
      });

      let csvContent = "data:text/csv;charset=utf-8,";

      csvContent += [
        Object.keys(arrData[0]).join(";"),
        ...arrData.map(item => Object.values(item).join(";"))
      ]
        .join("\n")
        .replace(/(^\[)|(\]$)/gm, "");
      const data = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", data);
      link.setAttribute("download", "export.csv");
      link.click();
      this.dialogSpinner = false;
    },
  },
  watch: {
    options: {
      handler() {
        if(!this.searched_value){
          this.searched_value = null;
          this.expanded = [];
          this.getSuns();
        }
      },
      deep: true
    },
    searched_value:{
      handler() {
        if(this.searched_value == ""){
          this.searched_value = null;
          this.expanded = [];
          this.getSuns(); 
        };
      },
      deep: true      
    }
  }
};
</script>

<style lang="css" scoped>
.my_table_style {
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
.wrapper__suns__table{
  height: auto;
  max-height: 250px;
  overflow: scroll;
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