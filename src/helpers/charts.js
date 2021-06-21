import React from 'react';
import { Line, Bar } from 'react-chartjs-2';





function formatDataForChart(countries, column='score'){
  const chartData = emptyChart();
  chartData.datasets = countries.map( country => {
    const lineonchart = chartData.emptyDataset();

    lineonchart.data = country.map( (country) => {
      lineonchart.label = country.country;
      return country[column];
    } );

    if ( country.length > chartData.labels.length )
      chartData.labels = country.map( ({year}) => year );

    return lineonchart;
  } );

  return chartData;
}


function formatDataForLineChartOneCountry(country){
  const chart = emptyCountryLineChart();
  const factors = chart.getfactors();

  country.forEach( (country) => {
    chart.labels.push(country.year);
    factors['economy'].data.push(country.economy);
    factors['family'].data.push(country.family);
    factors['freedom'].data.push(country.freedom);
    factors['generosity'].data.push(country.generosity);
    factors['health'].data.push(country.health);
    factors['trust'].data.push(country.trust);
  } )

  chart.datasets = Object.values(factors);
  
  return chart;
}


const HorizontalBarChart = ({data}) => {
  const options = {
    animations: false,
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return(
    <Bar data={data} options={options} />
  );
}


const GroupedBar = ({data}) => {
  const options = {
    animations: false,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  return(
    <Bar data={data} options={options} />
  );
}


const emptyYearLineChart = () => ({
  labels: [],
  datasets: [],
  getfactors : () => ({
      economy: {
          label: 'Economy',
          data: [],
          backgroundColor: 'rgb(255, 99, 132)',
      },
      family: {
          label: 'Family',
          data: [],
          backgroundColor: 'rgb(255, 159, 64)',
      },
      freedom: {
          label: 'Freedom',
          data: [],
          backgroundColor: 'rgb(255, 205, 86)',
      },
      generosity: {
          label: 'Generosity',
          data: [],
          backgroundColor: 'rgb(75, 192, 192)',
      },
      health: {
          label: 'Health',
          data: [],
          backgroundColor: 'rgb(54, 162, 235)',
      },
      trust: {
          label: 'Trust',
          data: [],
          backgroundColor: 'rgb(153, 102, 255)',
      }
  })
})


const emptyCountryLineChart = () => ({
  labels: [],
  datasets: [],
  getfactors : () => ({
      economy: {
          label: 'Economy',
          type: 'line',
          data: [],
          fill: false,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
      },
      family: {
          label: 'Family',
          type: 'line',
          data: [],
          fill: false,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgb(255, 159, 64)',
      },
      freedom: {
          label: 'Freedom',
          type: 'line',
          data: [],
          fill: false,
          borderColor: 'rgb(255, 205, 86)',
          backgroundColor: 'rgb(255, 205, 86)',
      },
      generosity: {
          label: 'Generosity',
          type: 'line',
          data: [],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgb(75, 192, 192)',
      },
      health: {
          label: 'Health',
          type: 'line',
          data: [],
          fill: false,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgb(54, 162, 235)',
      },
      trust: {
          label: 'Trust',
          type: 'line',
          data: [],
          fill: false,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgb(153, 102, 255)',
      }
  })
});


const emptyChart = () => ({
  labels: [],
  datasets: [],
  emptyDataset: () => ({
    label: '',
    type: 'line',
    data: [],
    fill: false,
    borderColor: ['rgb(255, 99, 132)','rgb(255, 159, 64)','rgb(255, 205, 86)','rgb(75, 192, 192)','rgb(54, 162, 235)','rgb(153, 102, 255)','rgb(201, 203, 207)'],
    backgroundColor: 'rgba(255, 99, 132, 0)',
  }),
});



const emptyBarchart = () => ({
  labels: [],
  datasets: [{
    label: 'score',
    data: [],
    backgroundColor: ['rgb(255, 99, 132)','rgb(255, 159, 64)','rgb(255, 205, 86)','rgb(75, 192, 192)','rgb(54, 162, 235)','rgb(153, 102, 255)','rgb(201, 203, 207)'],
    borderWidth: 0,
  },],
});


const LineChart = ({data}) => {
  const options = {
    animations: false,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
        },
      }],
    },
  };
  return (
    <Line data={data} options={options} />
  );
}



export {LineChart, 
  emptyYearLineChart, 
  emptyBarchart, 
  GroupedBar, 
  HorizontalBarChart, 
  formatDataForChart, 
  formatDataForLineChartOneCountry
};