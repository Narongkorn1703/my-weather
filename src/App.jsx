import dayjs from "dayjs";
import { useEffect, useState } from "react";
import "./App.css";
const apiKey = "8dd515085e4e931cd61f5eb4a513884a";
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};
function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedValue = useDebounce(searchValue, 500);

  const [position, setPosition] = useState({
    lat: null,
    lon: null,
  });

  const getPosition = async () => {
    const curPosition = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    setPosition({
      lat: curPosition.coords.latitude,
      lon: curPosition.coords.longitude,
    });
  };
  useEffect(() => {
    getPosition();
  }, []);
  useEffect(() => {
    const onFetchBySearch = async () => {
      try {
        setLoading(true);
        const response = await fetch(`
        https://api.openweathermap.org/data/2.5/weather?lat=${position.lat}&lon=${position.lon}&appid=${apiKey}`);
        const data = await response.json();
        setData(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    if (position.lat && position.lon) {
      onFetchBySearch();
    }
  }, [position]);

  const onSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(`
      http://api.openweathermap.org/geo/1.0/direct?q=${debouncedValue}&appid=${apiKey}&limit=5`);
      const data = await response.json();
      if (data.length > 0) {
        setPosition({
          lat: data[0].lat,
          lon: data[0].lon,
        });
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (debouncedValue) {
      onSearch();
    }
  }, [debouncedValue]);

  console.log(data);
  return (
    <div className="container">
      <div className="container_img">
        <div className="row">
          <input
            className="input"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            value={searchValue}
          />
        </div>
        <div>
          {!!data ? (
            <>
              <h1>
                {data?.name} {data?.sys?.country.toString()}
              </h1>
              <h2>{dayjs().format("dddd, MMMM D, YYYY")}</h2>
              <div className="box-shadow">
                <h1>{Math.round(data?.main?.temp - 273.15)}°C</h1>
              </div>
              <h1>{data?.weather[0]?.main}</h1>
            </>
          ) : (
            <div>
              <h1>Weather</h1>
              <h2>Loading...</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
