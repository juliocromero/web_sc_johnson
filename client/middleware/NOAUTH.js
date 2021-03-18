export default function ({ store, redirect , req}) {
    // If the user is not authenticated    
    if(store.state.auth == false){        
        return redirect('/login')
    }    
  }