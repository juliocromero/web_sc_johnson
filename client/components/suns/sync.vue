<template>
  <v-row justify="space-around">
    <v-col cols="auto" class="pa-0">
        <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
            <v-btn
            depressed
            color="success"
            @click="show"
            block
            dark
            v-bind="attrs"
            v-on="on"
            >
            <!-- <div class="d-sm-none d-md-flex">Descargar .CSV</div> -->
            <img
                src="@/static/iconos/sync_white.svg"
                alt="upload"
            />
            </v-btn>     
            </template>
            <span>Sincronizar</span>
        </v-tooltip>
      <v-dialog
        v-model="dialog"
        transition="dialog-bottom-transition"
        max-width="500"
      >
          <v-card>
            <v-card-title class="headline v-card-titulo white--text">Sincronizar</v-card-title>
            <v-card-text class="py-0">
              <div class="block d-flex justify-center my-5">
                  <v-date-picker
                  color="#f44336"
                  v-model="picker"
                  :landscape="landscape"
                  show-current
                  locale="es-ar"
                  ></v-date-picker>
              </div>
              <div class="block d-flex justify-center my-5">
                  <v-btn color="success" block @click="sync">
                      Sincronizar
                  </v-btn>
              </div>
              <div>
                <v-alert
                v-if="resSync.show"
                  dense
                  text
                  prominent
                  :type="resSync.type"
                >
                  <section class="ml-5">
                    <div>
                      <strong>S1:</strong>
                        <ul><strong class="mr-3">Estado:</strong><i>{{resSync.s1.msg}}</i></ul>
                        <ul><strong class="mr-3">Registros:</strong>{{resSync.s1.rowCount}}</ul>                       
                    </div>
                    <div>
                      <strong>S2:</strong>
                        <ul><strong class="mr-3">Estado:</strong><i>{{resSync.s2.msg}}</i></ul>
                        <ul><strong class="mr-3">Registros:</strong>{{resSync.s2.rowCount}}</ul>                      
                    </div>                    
                  </section>
                </v-alert>
              </div>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                text
                @click="hide">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import infoModal from "@/components/common/infoModal";
import infoModalCRUD from "@/components/common/infoModalCRUD.vue";
import moment from "moment";
import Cookies from "js-cookie";
import axios from "@/plugins/axios";
import { mapMutations } from "vuex";

export default {
    data: ()=> ({
        dialog:false,
        picker: new Date().toISOString().substr(0, 7),
        landscape:true,
        resSync:{
          show:false,
          type: 'error',
          s1:{
            msg:'',
            rowCount:null
          },
          s2:{
            msg:'',
            rowCount:null
          }
        }
    }),
    methods:{
      ...mapMutations(["toggleInfoModalDetail","ocultarInfoModal","toggleInfoModal"]),
        show(){
            this.dialog = true;
        },
        hide(){
          this.dialog = false;
          this.resSync = {
            show:false,
            type: 'error',
            s1:{
              msg:'',
              rowCount:null
            },
            s2:{
              msg:'',
              rowCount:null
            }
          };
          this.picker = new Date().toISOString().substr(0, 7);
        },
        async sync(){
          try {
            this.loading = true; 
            const token = Cookies.get('token');
            await axios
              .get('producto_lote/sync', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                params: {
                  dateSync:moment(this.picker).format('YYYY-MM-DD HH:mm:ss')
                },                
              })
              .then((res)=>{
                this.resSync = res.data.data;
                this.resSync.type = 'success';
                this.loading = false; 
                this.resSync.show = true;
                this.$emit('reload');  
              });
          } catch (error) {
            this.resSync =  {
                type:'error',
                s1:{
                  msg:'Error',
                  rowCount:0
                },
                s2:{
                  msg:'Error',
                  rowCount:0
                }
            }
            this.loading = false; 
            this.resSync.show = true;
            console.log('SYNC_ERROR:', error);          
          }
        }
    }
}
</script>

<style>
</style>