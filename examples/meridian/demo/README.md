# solartime

A small library that tells when the Sun crosses the local meridian: the
moment of solar noon, for any place and any day of the year.

```python
from datetime import date
from solartime import solar_noon, load_places

paris = load_places()["Paris"]
print(solar_noon(date(2026, 6, 21), paris.longitude, paris.utc_offset))
```

## Layout

| Path | Content |
| --- | --- |
| `solartime/equation.py` | Equation of time and solar declination |
| `solartime/places.py` | Places read from `data/places.json` |
| `tests/test_equation.py` | Tests, run with `pytest` |
| `explore.ipynb` | A notebook that plots solar noon over a year |

## Run the tests

```bash
python -m pytest
```
