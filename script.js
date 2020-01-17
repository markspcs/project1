const apiKey = "166a433c57516f51dfab1f7edaed8413";
const weatherSite = "https://api.openweathermap.org/data/2.5/forecast/daily?cnt=6&appid=" + apiKey + "&q=";
const uvSite = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey;
const forecastSite = "https://api.openweathermap.org/data/2.5/forecast/daily?cnt=6&appid=166a433c57516f51dfab1f7edaed8413&q=";
const imgDir = "./images/";
// Icons https://openweathermap.org/weather-conditions
// forecast https://api.openweathermap.org/data/2.5/forecast/daily?q=kansas+city&cnt=5&appid=166a433c57516f51dfab1f7edaed8413
// UV https://samples.openweathermap.org/data/2.5/uvi?lat=37.75&lon=-122.37&appid=b6907d289e10d714a6e88b30761fae22
var city = "kansas+city"
var searchBox = $("#searchBox");
var searchBtn = $("#searchBtn");
//var storedCities = [];
var storedItems = JSON.parse(localStorage.getItem("searchedCities"));
var storedCities = storedItems ? storedItems : [];
console.log(storedCities);
writeStoredCities(storedCities);

$(searchBtn).click(function () {
  let searchCity = searchBox.val().toLowerCase();
  getWeather(searchCity);
  getForecast(searchCity);
  orderCities(searchCity);
  
  console.log(searchCity);
})
$(".list-group-item").click(function () {
  let clickedCity = $(this).attr("city-search");
  console.log(clickedCity);
  getWeather(clickedCity);
  getForecast(clickedCity);
})
//////////////////////////////////////////
//orders, and dedups and stores array of cities
function orderCities(city){
  console.log(city);
  let indexed = storedCities.indexOf(city);
  console.log(indexed);
  if (indexed < 0) {
    storedCities.unshift(city);

    console.log("not stored");
  }
  else {
    storedCities.splice(indexed, 1);
    storedCities.unshift(city);   
  }
  localStorage.setItem("searchedCities", JSON.stringify(storedCities));
  $(".list-group").empty();
  writeStoredCities(storedCities);
  //console.log();
}
////////////////////////////////////////////
// writes left column of prevouis stored cities
function writeStoredCities(storedCities){

  storedCities.forEach(function(city){
  //console.log(storedCities);
  $(".list-group").append("<li class='list-group-item' city-search='" + city + "'" + ">" + city + "</li>");
  });
}
/////////////////////////////////////////////
//formats  5 day forecast to the bottom of the screen
function forecastWeather(forecast) {
  let dateObj = new Date(forecast.dt * 1000);
  let day = dateObj.getDate();
  let month = dateObj.getMonth() + 1;
  let year = dateObj.getFullYear();
  console.log(day + " " + month + " " + year);
  console.log(forecast);
  
  let fcDiv = $("<div>");
  let p = $("<p>");
  $(".forecastBoxes").append(fcDiv);
  let card = $(fcDiv).addClass("card forecastBox");
  let cardBody = card.addClass("card-body");
  cardBody.html("<h4 class='card-title'>" + month +"/" + day + "/" + year + "</h4>");
  cardBody.append("<img class='boxIcon' src='" + imgDir + forecast.weather[0].icon + ".png' /><p>");
  cardBody.append("Temp: " + kelvToFahr(forecast.temp.day) + " &#8457;<p>");
  cardBody.append("Humidity: " + forecast.humidity + "%");

}
///////////////////////////////
//gets 5 day forecast from api, and call forecastWeather() and passes the array of days
function getForecast(city) {
  let forecast = $.ajax({
    url: forecastSite + city,
    method: "GET"
  })
    .then(function (response) {
      //forecastWeather(response.list);
      response.list.shift();
      $(".forecastBoxes").empty();
      response.list.forEach(forecastWeather);
    });
}
////////////////////////////////////////
// this sets the currentWeather div only, and is called from getWeather()
///////////////////////////////////
function currentWeather(weatherObj) {
  let city = weatherObj.city.name;
  let lat = weatherObj.city.coord.lat;
  let long = weatherObj.city.coord.lon;
  let fahrTemp = kelvToFahr(weatherObj.list[0].temp.day);
  let humidity = weatherObj.list[0].humidity;
  let wind = weatherObj.list[0].speed;
  let icon = "./images/" + weatherObj.list[0].weather[0].icon + ".png";
  let dateObj = new Date(weatherObj.list[0].dt * 1000);
  let day = dateObj.getDate();
  let month = dateObj.getMonth() + 1;
  let year = dateObj.getFullYear();

  $("#city").text(city);
  $("#date").text(month + "/" + day + "/" + year);
  $("#icon").attr("src", icon);
  $("#temp").html("Temperature: " + fahrTemp + " &#8457; ");
  $("#humidity").html("Humidity: " + humidity + "%");
  $("#wind").html("Wind Speed: " + wind + " MPH");
  //$("#uv").append("followUp");
  console.log(city + " " + lat + " " + long + " " + fahrTemp + " " + humidity + " " + month + "/" + day + "/" + year);
  let uvObj = getUv(lat, long);
  uvObj.done(uvIndex => {$("#uv").html(uvIndex.value);colorUv(uvIndex.value) });
  console.log(indexVal);
  //console.log(promis.then);
  //$("#uv").append(getUv(lat, long));
  return [lat, long];
}
//////////////////////////////////
//
function colorUv(uvValue){
  let uvColor = "uvGreen";

  if (uvValue > 7){
    uvColor = "uvRed";
  }
  else if (uvValue > 4){
    uvColor = "uvYellow";
  }
  $("#uv").removeClass();
  $("#uv").addClass(uvColor);
}
/////////////////////////////////////
//This returns the promise of the called uv site
function getUv(lat, lon) {
  let site = uvSite + "&lat=" + lat + "&lon=" + lon;
  console.log(site);
  return $.ajax({
    url: site,
    method: "GET"
  });
}
/////////////////////////////////////
//convert kelvin to Fahrenheit, and return to 1 decimal point
function kelvToFahr(kelvTemp) {
  fahrTemp = kelvTemp * 1.8 - 459.67;
  return fahrTemp.toFixed(1);
}
/////////////////////////////////////
//main function to get current weather
function getWeather(city) {
  let weather = $.ajax({
    url: weatherSite + city,
    method: "GET"
  })
    // We store all of the retrieved data inside of an object called "response"
    .then(function (response) {
      console.log(response);
      var latL = currentWeather(response);
    })

}