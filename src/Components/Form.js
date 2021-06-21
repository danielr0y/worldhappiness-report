import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'reactstrap';
import jwt from 'jsonwebtoken';

import useSession from '../Hooks/useSession';

import { MyAlert } from '../helpers/components';
import { hitUser } from '../helpers/endpoints';


function Form( {action } ) {
  const {login} = useSession();
  const history = useHistory();
  const [error, setError] = useState('');

  function handleSubmit(e){
    e.preventDefault();

    // gather the data
    const formdata = new FormData( e.target ); 
    const payload = Object.fromEntries(formdata.entries());

    hitUser( action, e.target.method, payload )
      .then( body => handleSuccess(body) )
      .catch( ({message}) => setError(message) )

    e.target.reset();
  }

  function handleSuccess(body){
    // register and login responses both come through here
    
    if ( 'register' === action ){
      // reuse error state for the success message
      setError(body.message);
      return history.push(`/login`);
    }

    // add expiry time to login response
    const decoded = jwt.decode(body.token);
    login({ ...body, expires_at: decoded.exp }); // login stores the token and redirects
  }


  function handleChange({target}){
    // use the HTML validation API to display errors before they happen
    if ( ! target.validity.valid ){
      return setError(target.validationMessage);
    }
    
    setError('');
  }

  return (
    <div>
      <MyAlert message={error} />
      <p>enter your {'register' === action ? "desired " : "registered "}credentials to {'register' === action ? "register " : "login "}</p>
      <form onSubmit={handleSubmit} method="POST" className="d-flex justify-content-start">
        <label className="m-0">
          <span>email: </span>
          <input type="email" name="email" onChange={handleChange} autoComplete="email" required/>
        </label>
        <label className="m-0 ml-3">
          <span>password: </span>
          <input type="password" name="password" autoComplete="current-password" required/>
        </label>
        <Button type="submit" color="primary" size="sm" className="ml-3">{action}</Button>
      </form>
    </div>
  );
}

export default Form;
