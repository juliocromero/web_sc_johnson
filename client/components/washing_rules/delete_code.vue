<template>
  <v-row justify="center">
    <v-btn icon @click.stop="dialog = true">
      <img src="@/static/iconos/baseline_delete_black_18dp.png" alt="create">
    </v-btn>
    <v-dialog v-model="dialog" max-width="320">
      <v-card>
        <v-card-title class="headline dark v-card-titulo white--text"
          >Eliminar Código</v-card-title
        >

        <v-card-text>
          <h3 class="my-3">¿Esta seguro de eliminar el siguiente código?:</h3>
          <v-alert dense outlined type="error">
            <span outlined>
              <strong>Id: </strong>{{ code.id }} <br />
              <strong>Nombre: </strong>{{ code.nombre }} 
            </span>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="dialog = false">
            CANCELAR
          </v-btn>

          <v-btn color="green darken-1" text @click="Delete_code">
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
    code: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    dialog: false
  }),
  methods:{
        ...mapMutations(["toggleInfoModal","ocultarInfoModal"]),
    async Delete_code() {
      try {
        let token = Cookies.get("token"); 
        await axios.delete(`washing_rules/codes/${this.code.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.toggleInfoModal({
          dialog: true,
          msj:`Código: ${this.code.nombre} Eliminado correctamente`,
          titulo:"Eliminar código",
          alertType: "success"
        })
        this.$emit('reload');
        this.dialog = false
      } catch (error) {
        console.log(error)
        this.toggleInfoModal({
          dialog: true,
          msj:`Ha ocurrido un error al eliminar el código`,
          titulo:"Eliminar código",
          alertType: "error"
        })
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
