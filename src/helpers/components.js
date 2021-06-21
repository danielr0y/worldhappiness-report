import { useContext, useEffect, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Alert } from 'reactstrap';

import useCountriesList from '../Hooks/useCountriesList';

import { CountriesContext } from '../App';


// https://stackoverflow.com/a/65050538/13076283
function range( start, end ){
  return new Array( end-start+1 ).fill().map( (el, ind) => ind + start );
}


function YearSelector( {className='', supportAllyears=false} ) {
  const {year, setYear} = useCountriesList();
  let years = range( 2015, 2020 );

  if (supportAllyears)
    years = [...years, "all years"];

  function handleChange({target}){
    setYear(target.value);
  }

  return (
    <select className={className} value={year} onChange={handleChange}>
      {years.map( year => <option key={year} value={(year === "all years") ? 'allyears' : year}>{year}</option> )}
    </select>
  );
}


function LimitSelector( {className=''} ) {
  const {limit, setLimit} = useCountriesList();

  function handleChange({target}){
    setLimit(target.value);
  }

  return (
    <select className={className} value={limit} onChange={handleChange}>
      {[...range( 1, 10 ), "unlimited"].map( limit => <option key={limit} value={limit}>{limit}</option> )}
    </select>
  );
}


function CountrySelector( {className="", placeholder="search for a country", onlyAdd=false}) {
  const validCountries = useContext(CountriesContext);
  const {countries, getCountriesList, setCountriesList, addCountry, removeCountry} = useCountriesList();
  const [suggested, setSuggested] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleChange({target}){ 
    // filter the list of countries leaving only those left that match the query
    // i.e. partial match search
    const query = new RegExp(target.value, 'i');
    const results = validCountries.filter( (country) => query.test(country) );

    // toggle the dropdown if there are results
    if ( !results.length || results.length > 10 ){
      if ( dropdownOpen )
        toggle();
      return;
    }

    setSuggested(results);

    if ( !dropdownOpen )
      toggle();
  }

  function handleSelect({target}){
    setCountriesList(target.value);

    // clear and refocus the search box after adding
    const input = target.closest('.input-group').querySelector('input');
    input.value = '';
    input.focus();
  }

  function handleAdd({target}){
    addCountry(target.value);

    // clear and refocus the search box after adding
    const input = target.closest('.input-group').querySelector('input');
    input.value = '';
    input.focus();
  }

  function handleRemove({target}){
    removeCountry(target.value)

    // clear and refocus the search box after removing
    const input = target.closest('.input-group').querySelector('input');
    input.value = '';
    input.focus();
}

  function toggle(){
    setDropdownOpen(prevState => !prevState);
  }

  function getButtons(country){
    return (onlyAdd) ? <DropdownItem onClick={handleAdd} value={country} >{country}</DropdownItem> : (
      <>
        <DropdownItem onClick={handleAdd} value={country} >compare with {country}</DropdownItem>
        <DropdownItem onClick={handleSelect} value={country} >go to {country}</DropdownItem>
      </>
    );
  }

  return (
    <div className={className + " input-group mb-3"}>
      <div className="input-group-prepend">
        { (getCountriesList(countries).length > 1 || onlyAdd) ? getCountriesList(countries).map( country => (<button type="button" className="btn btn-outline-danger" 
            value={country} key={country} onClick={handleRemove}>&#x2718;&nbsp;{country}</button>) ) : <></>}
        <Dropdown isOpen={dropdownOpen} toggle={toggle} data-display="static">
          <DropdownToggle className="rounded-0 bg-white" >&#x1f50d;</DropdownToggle>
          <DropdownMenu className="">
            {suggested.map( (country) => (
              <div key={country} className="d-flex">
                {getButtons(country)}
              </div>
            ) )}
          </DropdownMenu>
        </Dropdown>
      </div>
      <input type="search" className="form-control" onChange={handleChange} placeholder={placeholder} />
    </div>
  );
}



function MyAlert( {message} ){
  const [isVisible, setisVisible] = useState(false);

  useEffect( () => {
    setisVisible( message ? true : false )
  } , [message] );

  function onDismiss(){
    setisVisible(false);
  }

  return (
    <Alert color={('User created' === message) ? "success" : "danger"} isOpen={isVisible} toggle={onDismiss}>
      {message}
    </Alert>
  );
}


export {MyAlert, YearSelector, CountrySelector, LimitSelector, range};
