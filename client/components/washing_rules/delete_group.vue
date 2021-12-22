<template>
  <v-row justify="center">
    <v-btn icon @click="dialog = true">
      <img src="@/static/iconos/baseline_delete_black_18dp.png" alt="create">
    </v-btn>
    <v-dialog v-model="dialog" max-width="320">
      <v-card>
        <v-card-title class="headline dark v-card-titulo white--text"
          >Eliminar Grupo</v-card-title
        >

        <v-card-text>
          <h3 class="my-3">¿Esta seguro de eliminar el siguiente grupo?:</h3>
          <v-alert dense outlined type="error">
            <span outlined>
              <strong>Nombre: </strong>{{ group.nombre }} 
            </span>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="dialog = false">
            CANCELAR
          </v-btn>

          <v-btn color="green darken-1" text @click="Delete_group">
             ELIMINAR
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapMutations } from "vuex";
import axios from "~/plugins/axios";
import Cookies from "js-cookie";

export default {
  props: {
    group: {
      type: Object
    },
  },
  data: () => ({
    dialog: false
  }),
  methods:{
        ...mapMutations(["toggleInfoModalCRUD","ocultarInfoModal","toggleInfoModal"]),
    async Delete_group() {
      try {
        let token = Cookies.get("token"); 
        await axios.delete(`washing_rules/groups/${this.group.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then((res)=>{
            this.toggleInfoModalCRUD({
              dialog: true,
              msj: `Grupo ${this.group.nombre} eliminado correctamente`,
              // s1:{ 
              //   status:res.data.server1.status, 
              //   msj:res.data.server1.message 
              //   },
              // s2:{ 
              //   status:res.data.server2.status, 
              //   msj:res.data.server2.message 
              //   },
              titulo: "Eliminar Grupo",
              alertType: "success",
            });
          this.$emit('reload');
          this.dialog = false
        });
      } catch (error) {
          if(error.response){
              this.toggleInfoModal({
              dialog: true,
              msj: `${error.response.data.message}`,
              titulo: "Eliminar Grupo",
              alertType: "error",
              });
              console.error('DELETE group error:', error.response.data.message)
              this.loading = false;
          }
          else{
              this.toggleInfoModal({
              dialog: true,
              msj: `Ha ocurrido un error al eliminar el grupo`,
              titulo: "Eliminar Grupo",
              alertType: "error",
              });
              this.loading = false;
        };
      }
    },
  },
};
</script>

<style>
.v-card-titulo {
  background: #f44336;
}
</style>
