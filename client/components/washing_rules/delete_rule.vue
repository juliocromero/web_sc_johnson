<template>
  <v-row justify="center">
    <v-btn icon @click="dialog = true">
      <img src="@/static/iconos/baseline_delete_black_18dp.png" alt="create">
    </v-btn>
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="headline dark v-card-titulo white--text"
          >Eliminar regla</v-card-title
        >

        <v-card-text>
          <h3 class="my-3">¿Esta seguro de eliminar la siguiente regla?:</h3>
          <v-alert dense outlined type="error">
            <span outlined>
              <strong>Grupo anterior: </strong>{{ rule.pre_group_name }}
              <br>
              <strong>Grupo actual: </strong>{{ rule.cur_group_name }} 
            </span>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="dialog = false">
            CANCELAR
          </v-btn>

          <v-btn color="green darken-1" text @click="delete_rule">
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
    rule: {
      type: Object
    },
  },
  data: () => ({
    dialog: false
  }),
  methods:{
        ...mapMutations(["toggleInfoModal","ocultarInfoModal"]),
    async delete_rule() {
      try {
        let token = Cookies.get("token"); 
        await axios.delete(`washing_rules/rules/${this.rule.pre_group_id}&${this.rule.cur_group_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then((res)=>{
          this.toggleInfoModal({
            dialog: true,
            msj:`Regla Eliminada correctamente`,
            titulo:"Eliminar regla",
            alertType: "success"
          })
          this.$emit('reload');
          this.dialog = false
        });
      } catch (error) {
        console.log(error)
        this.toggleInfoModal({
          dialog: true,
          msj:`Ha ocurrido un error al eliminar la regla`,
          titulo:"Eliminar regla",
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
