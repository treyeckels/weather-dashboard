var searchFormEl = document.querySelector("#search-form");
var searchFormCityInputEl = document.querySelector("#search-form-city-input");
var weatherDayCityEl = document.querySelector("#weather-day-city");
var weatherDayTempEl = document.querySelector("#weather-day-temp");
var weatherDayWindEl = document.querySelector("#weather-day-wind");
var weatherDayHumidityEl = document.querySelector("#weather-day-humidity");
var weatherDayUvIndexEl = document.querySelector("#weather-day-uv-index");
var forecastContainerEl = document.querySelector("#forecast-container");
var weatherDayIconEl = document.querySelector("#weather-day-icon");
var buttonContainerEl = document.querySelector("#button-container");
var weatherDayContainerEl = document.querySelector("#weather-day-container");
var outerForecastContainerEl = document.querySelector(
  "#outer-forecast-container"
);
var weatherDayDateEl = document.querySelector("#weather-day-date");

var baseUrl = "http://api.openweathermap.org/";
var apiKey = "54330efedf22e2ce54f6bbcee8ed5498";

function populate5day(data) {
  forecastContainerEl.innerHTML = "";
  data.forEach(function (day, index) {
    if (index === 0 || index > 5) {
      return;
    }
    var dt = day.dt;
    var date = moment(dt * 1000).format("L");
    var temp = day.temp.day;
    var windSpeed = day.wind_speed;
    var humidity = day.humidity;
    var icon = day.weather[0].icon;
    var div = document.createElement("div");
    var offsetClass = "";
    if (index === 1) {
      offsetClass = "col-lg-offset-1";
    }
    div.classList = `card-weather-container col-sm-12 ${offsetClass} col-lg-2 text-light`;
    div.innerHTML = `
        <div class="card-weather bg-dark p-3"> 
            <h4>${date}</h4>
            <img src="https://openweathermap.org/img/wn/${icon}.png" />
            <dl>
                <dt>Temp:</dt>
                <dd>${temp}</dd>
                <dt>Wind:</dt>
                <dd>${windSpeed} MPH</dd>
                <dt>Humidity</dt>
                <dd>${humidity}%</dd>
            </dl>
        </div>
    `;
    forecastContainerEl.appendChild(div);
  });
  outerForecastContainerEl.classList.remove("hide");
}

function getCityDayWeather(city) {
  var url = `${baseUrl}geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data.length) {
        window.alert("No city matches.");
        return;
      }

      storeCityLocation(city);
      populateButtons();

      var cityObject = data[0];
      var lat = cityObject.lat;
      var lon = cityObject.lon;

      var currentWeatherUrl = `${baseUrl}data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

      fetch(currentWeatherUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data);
          var date = moment(Date.now()).format("L");
          var current = data.current;
          var temp = current.temp;
          var windSpeed = current.wind_speed;
          var humidity = current.humidity;
          var uviIndex = current.uvi;
          var icon = current.weather[0].icon;

          weatherDayCityEl.textContent = city;
          weatherDayDateEl.textContent = date;
          weatherDayTempEl.textContent = temp;
          weatherDayWindEl.textContent = windSpeed;
          weatherDayTempEl.textContent = temp;
          weatherDayHumidityEl.textContent = humidity;
          weatherDayUvIndexEl.textContent = uviIndex;
          if (uviIndex < 3) {
            weatherDayUvIndexEl.classList.add("favorable");
          } else if (uviIndex < 7) {
            weatherDayUvIndexEl.classList.add("moderate");
          } else {
            weatherDayUvIndexEl.classList.add("severe");
          }

          weatherDayIconEl.src = `https://openweathermap.org/img/wn/${icon}.png`;
          weatherDayContainerEl.classList.remove("hide");
          populate5day(data.daily);
        });
    });
}

function populateButtons() {
  buttonContainerEl.innerHTML = "";
  var cities = window.localStorage.getItem("cities");
  if (cities) {
    cities = JSON.parse(cities);
  } else {
    cities = [];
  }

  cities.forEach(function (city) {
    var button = document.createElement("button");
    button.classList = "btn btn-secondary col-12";
    button.textContent = city;
    button.setAttribute("data-city", city);
    buttonContainerEl.appendChild(button);
  });
}

function storeCityLocation(city) {
  city = city.toLowerCase();
  var cities = window.localStorage.getItem("cities");
  if (cities) {
    cities = JSON.parse(cities);
  } else {
    cities = [];
  }
  if (cities.includes(city)) {
    return;
  } else {
    cities.push(city);
  }

  window.localStorage.setItem("cities", JSON.stringify(cities));
}

function handleFormSubmit(evt) {
  evt.preventDefault();
  var city = searchFormCityInputEl.value;
  getCityDayWeather(city);
}

function handleButtonClick(evt) {
  var target = evt.target;
  var city = target.getAttribute("data-city");
  getCityDayWeather(city);
}

function addEventListeners() {
  searchFormEl.addEventListener("submit", handleFormSubmit);
  buttonContainerEl.addEventListener("click", handleButtonClick);
}

function init() {
  addEventListeners();
  populateButtons();
}

init();
