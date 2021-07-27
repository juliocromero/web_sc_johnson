<template>
  <v-row justify="center">
    <v-btn icon @click.stop="dialog = true">
      <img src="@/static/iconos/baseline_delete_black_18dp.png" alt="delete">
    </v-btn>
    <v-dialog v-model="dialog" max-width="350">
      <v-card>
        <v-card-title class="headline dark v-card-titulo white--text"
          >Eliminar Producto</v-card-title
        >

        <v-card-text>
          <h3 class="my-3">¿Deseas eliminar el siguiente Producto?:</h3>
          <v-alert dense outlined type="error">
            <span outlined>
              <strong>codigo: </strong>{{ delet.cod_pt }} <br />
              <strong>Descripción: </strong>{{ delet.description }}
            </span>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="dialog = false">
            CANCELAR
          </v-btn>

          <v-btn color="green darken-1" :loading="loading" text @click="Eliminar_Products_table">
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
    delet: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    dialog: false,
    loading:false,
    producto: {
      codigo: null,
      sp_temperatura: "",
      sp_velocidad: "",
      crimper: false,
      description: ""
    }
  }),
  methods:{
        ...mapMutations(["toggleInfoModal","ocultarInfoModal","toggleInfoModalCRUD","ocultarInfoModalCRUD"]),
    async Eliminar_Products_table() {
      try {
        this.rellenarProducto()    
        let token = Cookies.get("token"); 
        this.loading = true;
        await axios.delete(`products/${this.delet.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res)=>{
          this.toggleInfoModalCRUD({
            dialog: true,
            msj: `¡¡Producto ${this.delet.cod_pt} eliminado!!`,
            s1:{ 
              status:res.data.server1.status, 
              msj:res.data.server1.message 
              },
            s2:{ 
              status:res.data.server2.status, 
              msj:res.data.server2.message 
              },
            titulo: "Eliminar Producto",
            alertType: "success",
          });
          this.$emit('reload')
          this.dialog = false
          this.loading = false;
        })
      } catch (error) {
        console.log(error)
        this.toggleInfoModal({
          dialog: true,
          msj:`Ha ocurrido un error al eliminar tu producto`,
          titulo:"Eliminar Producto",
          alertType: "error"
        })
        this.loading = false;
      }
    },
    async rellenarProducto(){
      let rellenar = { ...this.delet }
      this.producto = rellenar
    }
  },
};
</script>

<style>
.v-card-titulo {
  background: #f44336;
}
</style>
