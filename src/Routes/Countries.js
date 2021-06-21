import { createContext, useContext, useEffect, useState } from 'react';
import { Link, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import { CountriesContext } from '../App';

import Country from '../Components/Country';


export default function Countries(){
  let { path } = useRouteMatch();
  const validCountries = useContext(CountriesContext);
  const [ countries, setCountries ] = useState([]);
  const tagcloud = ['medium','xx-small','x-small','small','large','x-large','xx-large','smaller','larger'];
  
  useEffect(()=>{
    setCountries(validCountries);
  }, [validCountries])
  
  function handleSearch({target}){
    if ( !target.value.length ){
      setCountries(validCountries);
    }
    
    const query = new RegExp(target.value, 'i');
    setCountries( validCountries.filter( (country) => query.test(country) ) );
  }
  
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  return (
    <Switch>
      <Route exact path={path}>
        <header className="row">
          <h3 className="d-inline-block col-sm-auto">countries</h3>
          <input type="search" className="form-control col-sm" onChange={handleSearch} 
              placeholder="search for a country" />
        </header>
        <div>
          {countries.map( (country) => (<Link className="mr-1 d-inline-block" 
              style={{'fontSize': tagcloud[getRandomInt(tagcloud.length)]}} 
              key={country} to={`${path}/${country}`}>
            {country}
          </Link>) )}
        </div>
      </Route>
      <Route path={`${path}/allcountries`}>
        <Redirect to="/rankings" />
      </Route>
      <Route path={`${path}/:countries`}>
        <Country />
      </Route>
    </Switch>
  );

}