<template>
  <v-app dark>
    <v-app-bar :clipped-left="clipped" fixed color="#f44336" app>
     <v-btn icon to="/"><img class="scj" src="@/static/iconos/west-white-24dp.svg" alt="volver" ></v-btn>
     <v-card-title class="white--text pl-0">Administración de Usuarios</v-card-title>
      <v-spacer />
      <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on">
            <img src="@/static/iconos/person-white-48dp.svg" >
          </v-btn>
        </template>

        <v-list>
          <v-list-item class="menuUser poiter" @click="Salir()">
            <v-list-item-title class="d-flex align-center">
              <img class="mr-2" src="@/static/iconos/baseline_west_white_18dp.png" alt="salir">
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
    <password />
  </v-app>
</template>

<script>
      
import { mapState, mapMutations, mapActions } from "vuex";
import password from "@/components/common/cambiarPassword";

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
      right: true,
      rightDrawer: false,
    };
  },
  components:{
    password
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