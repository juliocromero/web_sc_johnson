import cookie from 'cookie'


export default function ({ store, redirect , req}) {
    // If the user is not authenticated
    if(req.headers.cookie){
        let { token } = cookie.parse(req.headers.cookie);
        console.log(token)
        if (token) {
            return redirect('/')
          }
    }
    
  }