import { createContext, useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Countries from './Routes/Countries';
import Rankings from './Routes/Rankings';

import Form from './Components/Form';
import Nav from './Components/Nav';

import { hitCountries } from './helpers/endpoints';
import { MyAlert } from './helpers/components';

import 'bootstrap/dist/css/bootstrap.min.css';

const CountriesContext = createContext();

function App() {
  const [countries, setCountries] = useState([]); // exposed via context
  const [error, setError] = useState('');
  
  useEffect( () => {
    hitCountries()
      .then( data => setCountries(data) )
      .catch( ({message}) => setError(message) )
  }, [] );


  return (
    <div className="container" >
      <div className="mx-auto" style={{'maxWidth': '960px'}}>
        <Nav />
        {(error) ? <MyAlert message={error} /> : <></>}
        <CountriesContext.Provider value={countries}>
          <Switch>
            <Route exact path="/">
              <Redirect to="/rankings" />
            </Route>
            <Route path="/rankings">
              <Rankings/>
            </Route>
            <Route path="/countries">
              <Countries />
            </Route>
            <Route path="/register">
              <Form action="register"/>
            </Route>
            <Route path="/login">
              <Form action="login"/>
            </Route>
          </Switch>
        </CountriesContext.Provider>
      </div>
    </div>
  );
}

export { App, CountriesContext };
