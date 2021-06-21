import { useHistory } from "react-router-dom";


export default function useSession(){
  const history = useHistory();

  function loggedin(){
    const token = localStorage.getItem('token') || false;
    return ( token && !expired() );
  }

  function expired(){
    const expires_at = localStorage.getItem('expires_at') || false;
    if ( !expires_at )
      return true;

    return ( Math.floor(Date.now() / 1000) >= expires_at )
  }

  function login(data){
    // store all of the data that comes in from a login call in local storage
    Object.entries(data).forEach( ([key, value]) => localStorage.setItem(key, value) );
    
    // redirect
    history.push('/rankings');
  }

  function logout(){
    // delete all of the local storage
    const keys = ['token', 'token_type', 'expires_in', 'expires_at'];
    keys.forEach( (key) => localStorage.removeItem(key) );
    
    // redirect
    history.push('/rankings');
  }

  return {
    loggedin: loggedin(), 
    expired: expired(), 
    login: login, 
    logout: logout
  };
};