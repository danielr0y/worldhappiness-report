import { useEffect, useState } from "react";
import { Redirect, Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import { Badge } from 'reactstrap';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';

import useCountriesList from "../Hooks/useCountriesList";
import useSession from "../Hooks/useSession";
import useValidate from "../Hooks/useValidate";

import { hitRankings, hitFactors } from "../helpers/endpoints";
import { emptyBarchart, emptyYearLineChart, GroupedBar, HorizontalBarChart } from '../helpers/charts';
import { YearSelector, MyAlert, LimitSelector, CountrySelector } from '../helpers/components';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

// this should really have been a higher-order component. instead it is just a route/loader
export default function Year(){
  const {loggedin} = useSession();
  const {path, url} = useRouteMatch();

  return(
    <Switch>
      <Route exact path={path}>
        <Redirect to={url + '/allcountries'} />
      </Route>
      <Route path={`${path}/:countries`} >
        {(loggedin) ? <FactorsYear /> : <RankingsYear />}
      </Route>
  </Switch>
  )
}

// unauthenticated view
function RankingsYear() {
  const history = useHistory();
  const {year, countries, getCountriesList} = useCountriesList();
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState('');
  const [gridApi, setGridApi] = useState(null);
  const [valid, message] = useValidate();
  
  useEffect( () => {
    // whenever countries or years changes fetch

    // blank countries are ok, but an empty array will do nothing. set a default if neccessary
    const countriesChecked = (getCountriesList(countries).length) ? getCountriesList(countries) : [''];

    Promise.all( countriesChecked.map( (country) => hitRankings( country, year ) ) )
      // this could potentially get results for serveral countries resulting in an array of arrays. flatten that
      .then( (countries) => countries.reduce( (prev, country) => [...prev, ...country] ) ) 
      .then( (data) => {
        setData(data);
        
        // also set the chart data here
        const chart = emptyBarchart();

        // only include first 10 results
        data.forEach( ({country, score}, index) => {
          if ( index >= 10 ) return;

          chart.labels.push(country);
          chart.datasets[0].data.push(score);
        } )
        
        setChartData(chart);
      })
      .catch(({message}) => setError(message) )
  }, [countries, year] )

  // check the URL
  if (!valid){
    return <MyAlert message={message} />;
  }
  
  // callback functions for things in the HTML
  function handleRowDoubleClick(cell){
    history.push(`/countries/${cell.data.country}`);
  }

  function handleGridReady({api}){
    setGridApi(api);
    api.sizeColumnsToFit();
  };

  function handlefilterChanged(){
    if ( !gridApi ) return; // callbacks seem to be occurring before onGridReady

    const chart = emptyBarchart();

    // every time a change occures to the table, update the chart.
    gridApi.forEachNodeAfterFilterAndSort( ({data}, index) => {
      const size =  gridApi.paginationGetPageSize();
      const min =  gridApi.paginationGetCurrentPage() * size;
      const max =  min + size;

      // only include results actually displayed on the table
      if ( index < min || index >= max ) return;

      chart.labels.push(data.country);
      chart.datasets[0].data.push(data.score);
    } )
    
    setChartData(chart);
  }

  return (
    <div>
      <MyAlert message={error} />
      <p>This application shows a subset of data from the <a href="https://worldhappiness.report/">World Happiness Report</a>, an initiative of the United Nations. In the report, as many as 157 countries are ranked according to an overall ‘happiness score’. </p>
      <p>To view more information about these scores, create an account and login</p>
      <p className="d-flex justify-content-end">
        <Badge color={!error ? "success" : "danger"}>{data.length}</Badge>
        <span> rankings retrieved for the year </span>
        <YearSelector />
      </p>
      <div className="mb-3"><HorizontalBarChart data={chartData} /></div>
      <div className="ag-theme-alpine" >
        <AgGridReact rowData={data} style={{ width: '100%' }}
            domLayout='autoHeight'
            pagination={true} paginationPageSize={10} 
            onRowDoubleClicked={handleRowDoubleClick} 
            onGridReady={handleGridReady}
            onPaginationChanged={handlefilterChanged} 
            onFilterChanged={handlefilterChanged} >
          <AgGridColumn field="rank" suppressSizeToFit={true} width={110} sortable={true} />
          <AgGridColumn field="country" suppressSizeToFit={true} width={200} filter={true} />
          <AgGridColumn field="score" filter='agNumberColumnFilter' />
        </AgGridReact>
      </div>
    </div>
  );
}

// authenticated view
function FactorsYear() {
  const history = useHistory();
  const {limit, year, countries, getCountriesList} = useCountriesList();
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [valid, message] = useValidate('');
    
  useEffect( () => {
    // whenever countries, year or limit changes fetch

    // blank countries are ok, but an empty array will do nothing. set a default if neccessary
    const countriesChecked = (getCountriesList(countries).length) ? getCountriesList(countries) : [''];

    Promise.all( countriesChecked.map( (country) => hitFactors( year, country, limit ) ) )
      .then( (countries) =>  countries.reduce( (prev, country) => [...prev, ...country] ) ) // merge them
      .then( (data) => {
        setData(data);
        return data;
      } )
      .then( (data) => {
        if (data.length > 10) return data; // skip generating chart for unlimited results

        const chart = emptyYearLineChart();
        const factors = chart.getfactors();

        data.forEach( (data) => {
          chart.labels.push(data.country);
          factors['economy'].data.push(data.economy);
          factors['family'].data.push(data.family);
          factors['freedom'].data.push(data.freedom);
          factors['generosity'].data.push(data.generosity);
          factors['health'].data.push(data.health);
          factors['trust'].data.push(data.trust);
        } )
        chart.datasets = Object.values(factors);
        setChartData(chart);
      } )
      .catch( ({message}) => setError(message) )
  }, [countries, year, limit] )

  // check the URL
  if (!valid){
    return <MyAlert message={message} />;
  }

  // callback functions for things in the HTML
  function handleRowDoubleClick({data}){
    history.push( '/countries/' + data.country );
  }

  return (
    <div>
      <MyAlert message={error} />
      <p>Each new column shown here represents the estimated influence each factor is suspected to have had on participants' reported happiness.</p>
      <p className="d-flex justify-content-end">
        <Badge color={error ? "danger" : "success"}>{data.length}</Badge>
        <span>rankings with factors retrieved&nbsp;</span>
        <span>for the year<YearSelector className="ml-1" /></span>
        <span className="ml-3">limited to<LimitSelector className="ml-1" /></span>
      </p>
      {( data.length <= 10 ) ? <GroupedBar data={chartData} /> : 'limit results to see charts'}
      <CountrySelector placeholder="add a country not in these results" onlyAdd />
      <div className="ag-theme-alpine">
        <AgGridReact rowData={data} style={{ width: '100%' }}
            domLayout='autoHeight'
            onRowDoubleClicked={handleRowDoubleClick} 
            defaultColDef={{
              width: 110,
              sortable: true,
              filter: 'agNumberColumnFilter',
            }} >
          <AgGridColumn field="rank" />
          <AgGridColumn field="country" width={200} suppressSizeToFit={true} sortable={false} filter={false} />
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