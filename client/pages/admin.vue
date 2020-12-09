<template>
  <div>
<!--       <h1>Administración de Usuarios</h1> -->
      <v-container>
            <v-row>
      <v-col>
        <v-card>
          <v-container>
            <v-row>
              <v-col cols="2" sm="2" class="ml-3">
                <create @reload="cargarUsuarios" />
              </v-col>
              <v-spacer />
              <v-col cols="8" sm="8" class="mt-0 pt-0">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Ingrese un nombre valido"
                  single-line
                  hide-details
                  class="mr-1"
                  ref="codigo"
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
            :items="usuarios"
            :page="page"
            :itemsPerPage="10"
            :server-items-length="parseInt(total)"
            class="m-2"
            @pagination="indexPage($event)"
            :footer-props="{ itemsPerPageOptions: [5, 10, 25] }"
            :search="search"
            no-data-text="No se encontraron resultados"
          >
            <template v-slot:[`item.editar`]="{ item }">
              <edit :editar="item" @reload="cargarUsuarios" />
            </template>

            <template v-slot:[`item.eliminar`]="{ item }">
              <delete-usuario :user="item" @reload="cargarUsuarios" />
            </template>

            <template v-slot:[`item.reset`]="{ item }">
              <admin-reset-pass :editar="item" @reload="cargarUsuarios" />
            </template>

            <template v-for="(item, i) in usuarios" v-slot:[`item.username`]="{ item }">
                <span :key="i">
                  <img src="@/static/iconos/verified_user-black-18dp.svg" alt="username" class="mr-2" v-if="item.rol_id=='administrador'"/>
                  {{ item.username }}
                </span>
            </template>

          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <infoModal />
    
      </v-container>
  </div>
</template>

<script>
import password from "@/components/common/cambiarPassword";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import edit from "@/components/common/editar-usuario";
import axios from "../plugins/axios";
import deleteUsuario from "@/components/common/eliminar-usuario";
import AdminResetPass from "@/components/common/adminResetPass";
import create from "@/components/common/crear-usuario";
import infoModal from "@/components/common/infoModal";
import Cookies from "js-cookie";
import { mapState, mapMutations } from "vuex";
let CSVtoJSON = require("csvtojson");

export default {
  layout: "admin",
  middleware: "NOAUTH",
  components: {
    edit,
    deleteUsuario,
    create,
    password,
    infoModal,
    AdminResetPass
  },
  data: () => ({
    search:"",
    datosCsv:null,
    pag : null,
    dialogSpinner: false,
    total: null,
    perPage: 10,
    page: 1,
    codigo: null,
    usuarios: [],
    files: null,
    headers: [
      { text: "Nombre", value: "username", align: "center" },
      { text: "Apellido", value: "lastname", align: "center" },
      { text: "Email", value: "email", align: "center" },
      { text: "Tipo de Usuario", value: "rol_id", align: "center" },
      { text: "Editar", value: "editar", align: "center" },
      { text: "Reestablecer", value: "reset", align: "center" },
      { text: "Eliminar", value: "eliminar", align: "center" },
    ],
  }),
  computed: {
    ...mapState(["infoModal"]),
  },
  watch: {

        codigo: function () { 
                if(this.codigo === ""){
                  this.page = this.pag
                  this.codigo = null
                  this.indexPage(this.$emit("pagination"))                
                } 
        }
  },
  methods: {
    ...mapMutations(["toggleInfoModal",'SET_DESLOGIN']),
    filtrarTabla(){
      try {
        if(this.codigo){
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
      this.cargarUsuarios() 
    },
    async cargarUsuarios() {
      this.dialogSpinner = true;
      let token = Cookies.get("token");
      await axios
        .get("user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: this.page,
            perPage: this.perPage
          }
        })
        .then((res) => {
          this.usuarios = res.data.data.data;
          this.total = res.data.data.total;
          this.dialogSpinner = false;
          /* if(this.codigo != null){this.$refs.codigo.focus()} */
        }).catch(error =>{
          console.log(error)
            this.toggleInfoModal({
            dialog: true,
            msj: `Ha ocurrido un error`,
            titulo: "Datos",
            alertType: "error",
          });
        })
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
</style>
