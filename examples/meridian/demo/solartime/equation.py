"""
Equation of time and solar declination, after the NOAA approximations.
"""

from __future__ import annotations

import math
from datetime import date, datetime, timedelta, timezone

MINUTES_PER_DEGREE = 4.0


def fractional_year(day: date) -> float:
    """
    Angle of the Earth on its orbit, in radians, at noon of `day`.
    """
    days_in_year = 366 if day.year % 4 == 0 else 365
    return 2 * math.pi / days_in_year * (day.timetuple().tm_yday - 1)


def equation_of_time(day: date) -> float:
    """
    Difference between apparent and mean solar time, in minutes.
    """
    g = fractional_year(day)
    return 229.18 * (
        0.000075
        + 0.001868 * math.cos(g)
        - 0.032077 * math.sin(g)
        - 0.014615 * math.cos(2 * g)
        - 0.040849 * math.sin(2 * g)
    )


def declination(day: date) -> float:
    """
    Declination of the Sun, in degrees.
    """
    g = fractional_year(day)
    radians = (
        0.006918
        - 0.399912 * math.cos(g)
        + 0.070257 * math.sin(g)
        - 0.006758 * math.cos(2 * g)
        + 0.000907 * math.sin(2 * g)
        - 0.002697 * math.cos(3 * g)
        + 0.00148 * math.sin(3 * g)
    )
    return math.degrees(radians)


def solar_noon(day: date, longitude: float, utc_offset: float = 0.0) -> datetime:
    """
    Local clock time at which the Sun crosses the meridian of `longitude`.
    """
    minutes = 720 - MINUTES_PER_DEGREE * longitude - equation_of_time(day)
    noon_utc = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
    noon_utc += timedelta(minutes=minutes)
    return noon_utc.astimezone(timezone(timedelta(hours=utc_offset)))
