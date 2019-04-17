import { publish, subscribe } from "./helpers/pub_sub";
import WeatherAPI from "./helpers/weather_api";
import API_KEY from "../keystore";
import MainView from "./views/main_view/MainView";
import SearchBar from "./components/SearchBar/SearchBar";
import CrossButton from "./components/CrossButton/CrossButton";
import SingleDayForecast from "./models/single_day_forecast";
import CurrentWeather from "./models/current_weather";

export default class SinglePageApp {
  constructor() {
    this.root = document.getElementById("root");
    document.body.appendChild(this.root);
    this.bindEvents();
    this.weather = new WeatherAPI({ apiKey: API_KEY });
    this.mainView = new MainView({ root: this.root });
    this.crossButton = new CrossButton({ root: this.root });
    this.searchBar = new SearchBar({ root: this.root });
  }

  locationSearch = data => {
    this.weather.search(data.detail.location, response => {
      publish("App:locations-ready", { locations: response });
    });
  };

  getWeatherForecast = location => {
    console.log("getting weather");
    this.weather.forecast(location, 7, response => {
      const { current, forecast } = response.data;
      const currentWeather = new CurrentWeather(response.data);
      const forecastDays = [];
      for (const day of forecast.forecastday) {
        console.log(day);
        forecastDays.push(new SingleDayForecast(day));
      }
      publish("App:weather-ready", {
        current: currentWeather,
        forecast: forecastDays
      });
    });
  };

  bindEvents = () => {
    subscribe("SearchBar:search", data => {
      this.locationSearch(data);
    });
    subscribe("SearchBar:location-selected", data => {
      this.getWeatherForecast(data.detail.location);
    });
    subscribe("App:clear", () => {
      const e = document.getElementById("forecast");
      e.innerHTML = "";
      e.classList.remove("blue");
    });
  };
}
