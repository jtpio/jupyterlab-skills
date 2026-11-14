import pytest

from weather.stats import amplitude, mean, summary


def test_mean():
    assert mean([1.0, 2.0, 3.0]) == 2.0


def test_mean_empty():
    with pytest.raises(ValueError):
        mean([])


def test_summary():
    result = summary([10.0, 20.0, 15.0])
    assert result == {"mean": 15.0, "min": 10.0, "max": 20.0, "amplitude": 10.0}
    assert amplitude([4.0, -1.0]) == 5.0
