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
              <v-col cols="2" sm="2" class="ml-3">
                <v-btn
                  depressed
                  color="success"
                  @click="descargaCSV"
                  block
                  dark
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
              <v-col cols="8" sm="8" class="mt-0 pt-0">
                <v-text-field
                  v-model="lote"
                  append-icon="mdi-magnify"
                  label="Indique un lote y presione enter"
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
                  :search="lote"
                  class="m-2"
                  :options.sync="options"
                  :server-items-length="parseInt(total)"
                  no-data-text="Sin datos"
                  :single-expand="singleExpand"
                  :expanded.sync="expanded"
                  :footer-props="footerProps"
                  item-key="lote"
                >
                  <template v-slot:[`item.suns`]="{ item }">
                    <div>
                      <v-chip
                        v-for="(sun, i) of item.suns"
                        :key="i"
                        class="ma-2"
                        color="grey"
                        pill
                        text-color="white"
                      >
                        <v-icon left>
                          mdi-label
                        </v-icon>
                        {{ sun.sun_number}}
                      </v-chip>
                    </div>
                  </template>

                  <!--             <template v-for="(h, i) in headers" v-slot:[`header.${h.value}`]="{ headers }">
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
                </template>-->

                  <!-- <template
                    v-slot:[`item.data-table-expand`]="{ expand, isExpanded }"
                  >
                    <v-btn
                      icon
                      @click="expand(!isExpanded)"
                      :class="isExpanded ? 'anim1' : ''"
                    >
                      <img src="@/static/iconos/expand_more.svg" alt="expand" />
                    </v-btn>
                  </template> -->
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
import Cookies from "js-cookie";
let CSVtoJSON = require("csvtojson");
import { mapState, mapMutations } from "vuex";

export default {
  middleware: "NOAUTH",
  components: {
    infoModal,
    infoModalCRUD
  },
  data: () => ({
    lote: "",
    expanded: [],
    singleExpand: false,
    ctrl: [],
    flag: true,
    sortClass: "",
    footerProps: {
 /*   disablePagination: false,
      prevIcon: null,
      nextIcon: null, */
      itemsPerPageText: "items por página",
      itemsPerPageOptions: [ 5, 10, 25]
    },
    datosCsv: null,
    pag: null,
    dialogSpinner: false,
    total: null,
    perPage: 10,
    page: 1,
    pageCount: 1,
    suns: [],
    options: {
      page:1,
      itemsPerPage:10,
      lote:null
    },
    files: null,
    headers: [
      { text:"Lote", value:'lote', align:"center", sortable:false },
      { text:"SUNs", value:'suns', sortable: false }
      //{ text: "Líneas", value: "data-table-expand"},
    ]
  }),
  computed: {
    ...mapState(["infoModal"])
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
      if (this.lote && this.lote != "") {
        this.options.lote = this.lote;
        await this.getSuns();
      }else {
        this.options = {
          page:1,
          itemsPerPage:10,
          lote:null
        }
        this.getSuns();
      }
      this.options.page = 1; //para que al filtrar desde otra page se vaya a 1 donde estan los resultados
    },
    async getSuns() {
      this.dialogSpinner = true;
      let token = Cookies.get("token");
      console.log('options', this.options);
      await axios
        .get("producto_lote", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            options: this.options
          },
        })
        .then((res) => {
          console.log('suns',res);
          this.suns = res.data.suns.data;
          this.total = res.data.suns.total;
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
        this.getSuns();
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
</style>

<style>
#table .v-data-footer .v-icon {
  color: blue !important;
}
</style>
