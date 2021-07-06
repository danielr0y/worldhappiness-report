# worldhappiness-report

Check out the project at https://worldhappiness-report.vercel.app/

## Summary
This application is the front-end/client-side half of a two-part full-stack web application development project. The REST API/back-end application can be found at https://github.com/danielr0y/worldhappiness-api

This project presents a subset of data from [The World Happiness Report](https://worldhappiness.report/), an initiative of the United Nations, formatted for easier comprehension. In the report, as many as 157 countries are ranked according to an overall ‘happiness score’.

The application allows users to view, sort, filter and compare rankings data for a given year or for a particular country (or countries) over time. Registered users have the option to login and view further data depicting the perceived influence of several socioeconomic factors on the data.

## Technologies
* JavaScript
* React
* Web Storage API
* History API
* Fetch API
* JSON Web Tokens
* AG-Grid
* Chartjs
* HTML
* Bootstrap

## App Architecture 
The application is split into 4 main parts: a router, sub-routers, view components and reuseable UI components.

App.js includes the main router component which imports sub-routers from /src/Routes/

These sub-routers each lead to one of 3 primary view components: Form, Year or Country. 

Year and Country are higher-order components which abstract the differences between the similar authenticated and unauthenticated lower-order views. The lower-oder view components fetch data from my own [API project](https://github.com/danielr0y/worldhappiness-api) at https://worldhappiness-api.herokuapp.com/  

These components use UI components like YearSelector and CountrySelector from /src/helpers/

Custom React hooks like useSession(), useValidate() and useCountriesList() are used at all levels of the application.

## User guide  
The rankings page is displayed immediately on your arrival.

Limited to a specific year, countries are displayed on the rankings page in a table and sorted initially by their rank. Users can change the year in the top right corner.
 
Users can sort and filter the data from the column headers. Clicking on sortable header toggles between ascending, descending and default order. Filterable columns display a menu button in the column header on hover. Clicking this button allows the user to filter the column by a range of conditions, for example, countries which end in ‘land’. 

Double clicking on a row brings the user to the respective countries-page.

Countries pages are limited to a specific country or set few countries but opened to all years. Here, a line graph takes centerstage to better highlight how happiness is trending in each country.

Users can quickly switch between different countries or add a country for comparison using the search bar at the top of the page. Users can navigate back to the rankings section for a particular year by clicking on a row.

To see more information about which factors influences these results, users should register for an account under ‘register’ in the navigation menu. 
On successfully registering, users will be redirected to the login page where they can enter their newly registered credentials and login.
 
Once logged-in, members are presented with additional data on each page representing the amount of perceived influence each socioeconomic factor likely had on the reported level of happiness. The bar chart as it was for guests has now been upgraded to a grouped bar chart to accommodate this new information.

As before, this page is limited to one year. Here, the number of results has been limited to improve performance. Users can change the year and limit using the dropdown boxes in the top right corner.

This page is limited to 6 results by default. This does not merely limit how many results are presented in the graph, it actually reduces the size of the response from the server. Because the grid’s filter and sort functions will only process results from that limited response, a search bar has been provided in order to retrieve more data from the server. Use the search bar to custom build your own list of countries to compare for the selected year.
 
As before, members can sort and filter results by column (now extended to include factors). Results could, for example, be filtered by countries where economy is suspected to highly influence happiness, but still sorted by score. 

Double clicking on a row will again take the member to the respective countries-page where the trend data is displayed on a line graph. However, for members, the line graph additionally displays the factors over time as well as the score. Adding additional countries for comparison removes those factors. Factors can be displayed on the chart by sorting the table.
