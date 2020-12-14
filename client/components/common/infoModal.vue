<template>
  <div class="text-center">
    <v-dialog
      v-model="infoModal.dialog"
      width="320"
    >
      <v-card>
        <v-card-title class="dark headline lighten-2 v-card-titulo white--text">
          {{infoModal.titulo}}
        </v-card-title>

        <v-card-text>
          <v-alert class="mt-7" dense outlined :type="infoModal.alertType">
            <span outlined>
              <strong>{{infoModal.msj}}</strong>
            </span>
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="ocultarInfoModal(false)"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

  export default {
    data () {
      return {
      }
    },
    computed:{
        ...mapState(['infoModal'])
    },
    methods:{
        ...mapMutations(["toggleInfoModal","ocultarInfoModal"]),
    }
  }
</script>
<style>
.v-card-titulo {
  background: #f44336;
}
</style>
