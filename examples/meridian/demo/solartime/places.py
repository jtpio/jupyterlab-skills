"""
Places with their coordinates, read from `data/places.json`.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "places.json"


@dataclass(frozen=True)
class Place:
    """
    A named place on Earth.
    """

    name: str
    latitude: float
    longitude: float
    utc_offset: float


def load_places(path: Path = DATA_FILE) -> dict[str, Place]:
    """
    Read the places of a JSON file, by name.
    """
    with open(path, encoding="utf-8") as stream:
        records = json.load(stream)["places"]
    return {record["name"]: Place(**record) for record in records}
