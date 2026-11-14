"""
Small statistics on monthly temperatures.
"""

from collections.abc import Sequence


def mean(values: Sequence[float]) -> float:
    if not values:
        raise ValueError("mean() needs at least one value")
    return sum(values) / len(values)


def amplitude(values: Sequence[float]) -> float:
    return max(values) - min(values)


def summary(values: Sequence[float]) -> dict[str, float]:
    """
    Return the mean, the minimum, the maximum and the amplitude.
    """
    return {
        "mean": round(mean(values), 2),
        "min": min(values),
        "max": max(values),
        "amplitude": round(amplitude(values), 2),
    }


def median(values: Sequence[float]) -> float:
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2
