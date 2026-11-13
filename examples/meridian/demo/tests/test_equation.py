from datetime import date

import pytest

from solartime import declination, equation_of_time, solar_noon


def test_equation_of_time_is_small():
    for month in range(1, 13):
        assert abs(equation_of_time(date(2026, month, 1))) < 17


def test_declination_at_solstice():
    assert declination(date(2026, 6, 21)) == pytest.approx(23.44, abs=0.1)


def test_solar_noon_at_greenwich():
    noon = solar_noon(date(2026, 4, 15), longitude=0.0)
    assert noon.hour == 12
    assert noon.minute < 2
