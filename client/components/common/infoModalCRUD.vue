<template>
  <div class="text-center">
    <v-dialog
      v-model="infoModalCRUD.dialog"
      width="350"
      :retain-focus="false"
    >
      <v-card>
        <v-card-title class="dark headline lighten-2 v-card-titulo white--text">
          {{infoModalCRUD.titulo}}
        </v-card-title>

        <v-card-text>
          <v-alert class="mt-7 mb-1" dense outlined :type="infoModalCRUD.alertType">
            <span outlined>
              <strong>{{infoModalCRUD.msj}}</strong>
            </span>
          </v-alert>
              <span v-if="infoModalCRUD.s1.status == 200" class="ml-1">
                <v-icon color="success" small>check_circle_outline</v-icon>
                {{infoModalCRUD.s1.msj}}
              </span>
              <span v-if="infoModalCRUD.s1.status == 400" class="ml-1">
                <v-icon color="warning" small>warning</v-icon>
                {{infoModalCRUD.s1.msj}}
              </span>      
            <br>    
              <span v-if="infoModalCRUD.s2.status == 200" class="ml-1">
                <v-icon color="success" small>check_circle_outline</v-icon>
                {{infoModalCRUD.s2.msj}}
              </span>
              <span v-if="infoModalCRUD.s2.status == 400" class="ml-1">
                <v-icon color="warning" small>warning</v-icon>
                {{infoModalCRUD.s2.msj}}
              </span>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="ocultarInfoModalCRUD(false)"
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
        ...mapState(['infoModalCRUD'])
    },
    methods:{
        ...mapMutations(["toggleInfoModalCRUD","ocultarInfoModalCRUD"]),
    }
  }
</script>
<style>
.v-card-titulo {
  background: #f44336;
}
</style>
