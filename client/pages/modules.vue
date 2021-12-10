<template>
  <div class="fondo">
    <v-container>
      <v-row>
        <v-col sm="4" lg="3" class="d-flex justify-center" v-for="(item, i) in opciones" :key="i">
      <v-hover
        v-slot="{ hover }"
        open-delay="200"
      >
              <v-card
                :class="{ 'on-hover': hover }"
                flat
                height="157"
                width="157"
                class="tarjeta"
                elevation="2"
                :to="item.url"
              >
                <v-card-text class="d-flex justify-center pb-0 mb-1">
                  <v-icon size="80"> {{item.icon}} </v-icon>
                </v-card-text>
                <v-card-title class="pt-0 px-3 d-flex justify-center" style="text-align:center;font-size:16px;line-height:normal;">
                  {{item.titulo}}
                </v-card-title>
              </v-card>
      </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import 'material-design-icons-iconfont/dist/material-design-icons.css';
export default {
  middleware: "NOAUTH",
  data(){
    return{
      opciones:[
        {titulo:'Setpoints Baños de Pruebas', icon:'fact_check', url:'/washing_set_points'},
        {titulo:'SUNs', icon:'widgets', url:'/suns'},
        {titulo:'Reglas de Lavado', icon:'waves', url:'/washing_rules'}
      ],
    }
  }
}
</script>

<style lang="css" scoped>
.tarjeta{
  cursor: pointer; 
  color: grey;
  background: #EAEAEA;
}

.tarjeta:hover{
  box-shadow: 0 0 15px #ffacac !important;
}

a{
  text-decoration: none;
}
.fondo {
  background: white;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.font-weight-medium {
  size: 1;
}
</style>

