<template>
  <v-app dark>
    <v-app-bar :clipped-left="clipped" fixed color="#f44336" app>
      <img class="scj" src="@/static/iconos/logo-white.png" >
      <v-spacer />
      <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on">
            <img src="@/static/iconos/person-white-48dp.svg" >
          </v-btn>
        </template>

        <v-list>
          <v-list-item class="menuUser pointer">
            <v-list-item-title  @click="toggleDialogPassword(true)">
              <img src="@/static/iconos/baseline_lock_black_18dp.png" alt="">
              Cambiar Contraseña
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="menuUser poiter" @click="Salir()">
            <v-list-item-title>
              <img class="pt-2" src="@/static/iconos/baseline_west_white_18dp.png" alt="">
              Salir
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
      
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Welcome",
          to: "/"
        },
        {
          icon: "mdi-chart-bubble",
          title: "Inspire",
          to: "/inspire"
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Vuetify.js"
    };
  },
  methods:{
    ...mapActions(['data']),
    ...mapMutations(['SET_DESLOGIN']),
    ...mapMutations(['toggleDialogPassword']),
    Salir(){
      this.SET_DESLOGIN()
    },
  },
  mounted(){
    this.data()
  },
  computed:{
    ...mapState(['dialogPassword']) 
  }
};
</script>
<style scoped>
.menuUser:hover{
 background: rgb(189, 189, 189);
  
}
.pointer {cursor: pointer;}

.scj{
  max-width: 70%;
  max-height: 70%;
}
</style>