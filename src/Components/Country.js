import { useState, useEffect } from 'react';
import { useHistory, useRouteMatch, Route, Switch, Redirect } from 'react-router-dom';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import { Badge } from 'reactstrap';

import useCountriesList from "../Hooks/useCountriesList";
import useSession from "../Hooks/useSession";
import useValidate from "../Hooks/useValidate";

import { hitRankings, hitFactors } from "../helpers/endpoints";
import { LineChart, formatDataForChart, formatDataForLineChartOneCountry } from '../helpers/charts';
import { CountrySelector, MyAlert, range } from '../helpers/components';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'


// this should really have been a higher-order component. instead it is just a route/loader
export default function Country(){
  const {loggedin} = useSession();
  const {path, url} = useRouteMatch();
  const [valid, message] = useValidate();

  if (!valid){
    return <MyAlert message={message} />;
  }
  
  return (
    <Switch>
      <Route exact path={path}>
        {(loggedin) ? <FactorsCountry /> : <RankingsCountry />}
      </Route>
      <Route path={`${path}/`} >
        <Redirect to={url} />
      </Route>
    </Switch>
  )
}

// unauthenticated view
function RankingsCountry(){
  const history = useHistory();
  const {countries, getCountriesList} = useCountriesList();
  const [data, setTableData] = useState([]);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState([]);

  
  useEffect( () => {
    // every time countries changes, get results for each country.
    Promise.all( getCountriesList(countries).map( country => hitRankings( country ) ) )
      // API returns results ordered from 2020 descending. for line charts we want ascending
      .then( countries => countries.map( country => country.reverse() ) ) 
      .then( countries => {
        setChartData( formatDataForChart(countries) ); 
        // give the original data on to the next thing
        return countries;
      } )
      // an array of arrays was good for the chart, but we want to flatten that for the table
      .then( years => years.reduce( (prev, year) => ([...prev, ...year]) ) )
      .then( data => setTableData(data) )
      .catch( ({message}) => setError(message) )
  }, [countries] ); 

  const handleRowDoubleClick = (row) => {
    history.push(`/rankings/${row.data.year}`);
  }

  function handleGridReady({api}){
    api.sizeColumnsToFit()
  }

  return (
    <>
      <header className="row">
        <h3 className="col-sm-auto">{getCountriesList(countries).join(', ')}</h3>
        <CountrySelector placeholder="Compare with other countries" />
      </header>
      <MyAlert message={error} />
      <p className="d-flex justify-content-end">
        <Badge color={!error ? "success" : "danger"}>{data.length}</Badge>
        <span className="ml-1"> year{ (data.length > 1) ? 's' : '' } of rankings retrieved for {getCountriesList(countries).join(' and ')}. </span>
      </p>
      <div className="mb-3">{ (data.length > 1) ? <LineChart data={chartData} /> : <p>there is not enough data for this country to show a chart</p>}</div>
      <div className="ag-theme-alpine" >
        <AgGridReact rowData={data} style={{ width: '100%' }}
            domLayout='autoHeight'
            onGridReady={handleGridReady} 
            onRowDoubleClicked={handleRowDoubleClick} 
            defaultColDef={{
              sortable: true,
            }} >
          <AgGridColumn field="country" />
          <AgGridColumn field="year" sort="desc" />
          <AgGridColumn field="rank" />
          <AgGridColumn field="score" />
        </AgGridReact>
      </div>
    </>
  );
}


// authenticated view
function FactorsCountry() {
  const history = useHistory();
  const {countries, getCountriesList} = useCountriesList();
  const [error, setError] = useState(false);
  const [rawData, setRawData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect( () => {
    // everytime countries changes, get results for each country
    Promise.all( getCountriesList(countries).map( country =>  (
      Promise.all( range(2015, 2020).map(year => hitFactors(year, country)) )
      // each time we hit factors we receive an array with just 1 object.  flatten this
      .then( years => years.reduce( (prev, year) => [...prev, ...year] ) )
    ) ) )
    .then( countries => {
      // save the raw data because it is grouped well for updating the chart later.
      setRawData(countries);
      // pass the original data onto the next thing
      return countries;
    })
    .then( countries => {
      // this chart displayed all factors for one country or just the score for many
      if (countries.length > 1){
        setChartData( formatDataForChart(countries) ); 
      }else{
        setChartData( formatDataForLineChartOneCountry(countries[0]) );
      }
      // pass the original data on to the next thing
      return countries;
    } )
    // grouped data was nice for the chart but we want it flattened for the table
    .then( countries => countries.reduce( (prev, country) => [...prev, ...country] ) )
    .then( data => setTableData(data) )
    .catch( ({message}) => setError(message) )
  }, [countries] );

  // callback funcitons for the HTML
  function handleRowDoubleClick({data}){
    history.push(`/rankings/${data.year}`);
  }

  // if the grid changes, update the chart
  function handleSortChanged(params){
    // determine which column was sorted
    const columnSortState = params.columnApi.getColumnState();
    const [columnClicked] = columnSortState.filter( ({sort}) => (sort !== null));

    const factorsData = formatDataForChart(rawData, columnClicked.colId);
    // display only the factor by which the user is sorting the table
    setChartData(factorsData);
  }
  
  
  return (
    <div>
      <h3 >{getCountriesList(countries).join(', ')}</h3>
      <CountrySelector placeholder="Compare with other countries"/>
      <MyAlert message={error} />
      <p className="d-flex justify-content-end">
        <Badge color={!error ? "success" : "danger"}>{tableData.length}</Badge>
        <span className="ml-1"> year{ (tableData.length > 1) ? 's' : '' } of rankings with factors retrieved for {getCountriesList(countries).join(' and ')}. </span>
      </p>
      <div className="mb-3">{ (tableData.length > 1) ? <LineChart data={chartData} /> : <p>there is not enough data for this country to show a chart</p>}</div>
      <div className="ag-theme-alpine" >
        <AgGridReact rowData={tableData} style={{ width: '100%' }} 
            domLayout='autoHeight'
            onRowDoubleClicked={handleRowDoubleClick} 
            onSortChanged={handleSortChanged} 
            defaultColDef={{
              width: 110,
              sortable: true,
              filter: 'agNumberColumnFilter',
            }} >
          <AgGridColumn field="year" sort="desc"/>
          <AgGridColumn field="country" width={200}/>
          <AgGridColumn field="rank" />
          <AgGridColumn field="score" />
          <AgGridColumn field="economy" />
          <AgGridColumn field="family" />
          <AgGridColumn field="health" />
          <AgGridColumn field="freedom" />
          <AgGridColumn field="generosity" />
          <AgGridColumn field="trust" />
        </AgGridReact>
      </div>
    </div>
  );
}