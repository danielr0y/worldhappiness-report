import { useContext } from "react";
import { useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";

import useSession from "./useSession";

import { CountriesContext } from "../App";


export default function useValidate(){
    const { loggedin, logout, expired } = useSession();
    const validCountries = useContext(CountriesContext);
    const { countries, year } = useParams();
    const { path } = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const searchqueries = new URLSearchParams( location.search );
    const limit = searchqueries.get('limit');

    // validate session
    if ( loggedin && expired ){
      logout();
      return [false, 'session expired'];
    }
  
    // validate the year from the url
    // '' is a valid year at this point
    if ( year ){
      const year_num = Number(year);
      if ( isNaN(year_num) || year_num < 2015 || year_num > 2020 ){
        return [false, "we only have results for the years 2015 to 2020"];
      }
    }
  
    // validate the limit
    // '' is valid at this point
    if ( limit && 'unlimited' !== limit ){
      const limit_num = Number(limit);
      if ( isNaN(limit_num) || limit_num === 0 || limit_num > 10 ){
        return [false, "we plot rankings on a chart only when the results are limited. Please limit the results to no more than 10 so the information looks good. 0 or a word would also be silly"];
      }
    }

    // wait for the list of countries from the API
    if ( validCountries && !validCountries.length ){
      return [false, "loading countries..."];
    }
    
    
    // validate the countries list
    if ( countries && 'allcountries' !== countries ){
      // filter the list leaving only valid countries remaining
      const filteredValidCountries = countries.split(',').filter( (country) => (
        // convert them to uppercase because case-insensitive includes is not an option
        validCountries.map( (country) => country.toUpperCase() ).includes( country.toUpperCase() ) 
      ) );

      if ( !filteredValidCountries.length ){
        return [false, "we don't have any information on " + ((countries.split(',').length > 1) ? "any of those countries" : "that country")] ;
      }
      // if the list has changed ie. was filtered, update the url
      else if ( filteredValidCountries.join(',') !== countries ){
        history.push( path.replace(':year', year).replace(':countries', filteredValidCountries.join(',')) );
      }

      // otherwise the url was fine how it was
    }
  
    return [true, 'noice']; // '' AND '' will be caught by the router
}