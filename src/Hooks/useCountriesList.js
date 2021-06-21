import { useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";

import useSession from "./useSession";

  
export default function useCountriesList(){
  const history = useHistory();
  const location = useLocation();
  const { path } = useRouteMatch();
  const searchqueries = new URLSearchParams( location.search );
  const limit = searchqueries.get('limit') || 6;
  const { countries, year } = useParams(); // the URL is validated elsewhere. these values are clean
  const { loggedin } = useSession();


  function buildURL(year, countriesList, limit){
    return path.replace('/:year', (year) ? `/${year}` : '')
      .replace('/:countries', (countriesList.length) ? '/' + countriesList.join(',') : '/allcountries')
      + ((limit && loggedin ) ? `?limit=${limit}` : '');
  }

  function getYear(){
    return ( year && 'allyears' !== year) ? year : ''; 
  }

  function getCountriesList(){
    return ( countries && 'allcountries' !== countries ) ? countries.split(',') : [];
  }

  function setLimit(limit){
    history.push(buildURL(year, getCountriesList(), limit));
  }

  function setYear(year){
    history.push(buildURL(year, getCountriesList(), limit));
  }

  function setCountriesList(country){
    const countriesList = [country];
    history.push(buildURL(year, countriesList, limit));
  }

  function addCountry(country){
    const countriesList = Array.from( new Set([...getCountriesList(), country]) ); // return a set to weed out duplicates
    history.push(buildURL(year, countriesList, limit));
  }

  function removeCountry(targetCountry){
    const countriesList = getCountriesList().filter( country => (country !== targetCountry) );
    history.push(buildURL(year, countriesList, limit));
  }

  return {
    limit,
    setLimit,
    year: getYear(),
    setYear,
    countries, 
    getCountriesList, 
    setCountriesList, 
    addCountry, 
    removeCountry
  };
}