import Cookies from 'js-cookie'
import axios from '../plugins/axios'
import cookie from 'cookie'


export const state = () => ({
  infoModal:{
    dialog: false,
    msj:"",
    titulo:"",
    alertType: ""
  },
  dialogPassword: false,
  auth: false,
  dataUser:null
});

export const mutations = {
  async SET_AUTH(state, token) {
    state.auth = true;  
    Cookies.set('token', token)   
    this.$router.push('/')
  },
  async SET_AUTH_AUTOMATIC(state, res) {
    state.auth = true;
    this.$router.push('/')
  },
  async SET_DESLOGIN(state) {  
    state.auth = false;
    Cookies.remove('token')   
    location.reload();
  },
  async toggleDialogPassword(state, payload){
    state.dialogPassword = payload
  },
  async toggleInfoModal(state, payload){
    state.infoModal.dialog = true
    state.infoModal.msj = payload.msj
    state.infoModal.titulo = payload.titulo
    state.infoModal.alertType = payload.alertType
  },
  async ocultarInfoModal(state, payload){
    state.infoModal.dialog = payload
  }
 
};
export const actions = {
  
  async nuxtServerInit ({ commit , state , }, { req }  ) { 
        
     if (req.headers.cookie) { 
         let { token } = cookie.parse(req.headers.cookie);
        
         await axios
           .get("/loginUsersAutomatico", {
             headers: { Authorization: `Bearer ${token}` }
           })
           .then(res => {
             this.commit('SET_AUTH_AUTOMATIC', true );                    
           }).catch(err => {               
           })
         
         
     }
   },
 

};