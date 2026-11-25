"""
Load station records from a JSON file.
"""

import json
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Station:
    id: str
    name: str
    latitude: float
    longitude: float
    temperatures: list[float] = field(default_factory=list)


def load_stations(path: str | Path) -> list[Station]:
    """
    Return the stations of a JSON file, in file order.
    """
    records = json.loads(Path(path).read_text(encoding="utf-8"))
    return [Station(**record) for record in records]
