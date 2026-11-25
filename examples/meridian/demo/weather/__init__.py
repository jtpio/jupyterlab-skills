"""
Read weather station data and compute statistics.
"""

from .io import Station, load_stations
from .stats import mean, summary

__all__ = ["Station", "load_stations", "mean", "summary"]
__version__ = "0.1.0"
