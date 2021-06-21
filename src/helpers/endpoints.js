const URL = 'https://worldhappiness-api.herokuapp.com';
const cache = {};
const headers = { accept: 'application/json', "content-type": 'application/json' };


function handleErrors(body){
  if ( body.hasOwnProperty('error') || body.status === 'error' ) // 'error' is provided by the API. check for it
    throw new Error(body.message);

  return body;
}


function hitUser(action, method, payload){
  // don't cache these

  const POST = {
    method,
    headers,
    body: JSON.stringify( payload )
  }

  // don't send POST bits with GET requests
  return fetch( URL + '/user/' + action, ('post' === method) ? POST : {} )
    .then( res => res.json() )
    .then( body => handleErrors(body) )
}


function hitCountries(){
  if ( cache['countries'] ){
    return cache['countries']; // don't hit the API again if we've already been there
  }

  const promise = fetch( URL + '/countries' )
    .then( res => res.json() )
    .then( body => handleErrors(body) )

  cache['countries'] = promise; // cache it before we leave.
  return promise;
}


function hitRankings( country, year='' ) {
  if ( cache['rankings'+country+year] ){
    return cache['rankings'+country+year]; // don't hit the API again if we've already been there
  }

  function getCountry(){
    return ( country ) ? '&country=' + country : '';
  }

  function getYear(){
    return ( year ) ? '&year=' + year : '';
  }

  const promise = fetch( URL + '/rankings?' + getCountry() + getYear() )
    .then( res => res.json() )
    .then( body => handleErrors(body) )
    // if country is not in the response get it from the function scope
    .then( data => data.map( item => (!item.country) ? {...item, country} : item ) )

  cache['rankings'+country+year] = promise; // cache it before we leave. 
  return promise;
}


function hitFactors( year, country='', limit=10 ) {
  if ( cache['factors'+country+year+limit] ){
    return cache['factors'+country+year+limit]; // don't hit the API again if we've already been there
  }

  function getCountry(){
    return ( country ) ? '&country=' + country : '';
  }

  function getLimit(){
    return ( 'unlimited' === limit ) ? '' : '&limit=' + limit;
  }

  const auth = {
    ...headers, 
    Authorization: localStorage.getItem("token_type") + ' ' + localStorage.getItem("token"),
  };

  const promise = fetch( URL + '/factors/' + year + '?' + getCountry() + getLimit(), {headers: auth} )
    .then( res => res.json() )
    .then( body => handleErrors(body) )
    .then( data => data.map( item => {
      return({...item, year})} ) )

  cache['factors'+country+year+limit] = promise; // cache it before we leave. 
  return promise;
}

export {hitRankings, hitFactors, hitCountries, hitUser};