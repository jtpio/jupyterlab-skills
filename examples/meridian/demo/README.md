# weather

A small package to read weather station data and compute statistics.

```python
from weather.io import load_stations
from weather.stats import summary

stations = load_stations("stations.json")
print(summary(stations[0].temperatures))
```

Run the tests with `python -m pytest`.
