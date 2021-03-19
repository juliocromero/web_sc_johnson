import Cookies from 'js-cookie';

export default function ({ store, redirect , req}) {
    // If the user is not authenticated    
    if(store.state.auth == false || !Cookies.get('token')){        
        return redirect('/login')
    }    
  }