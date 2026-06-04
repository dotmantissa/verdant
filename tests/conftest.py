"""
Shared test infrastructure for Verdant contract tests.

Tests run against a live GenLayer Studio node (http://127.0.0.1:4000/api).
All tests are automatically skipped when the node is not reachable.

Run locally:
  genlayer up             # start Studio
  pytest tests/ -v        # run all tests
"""
from __future__ import annotations

import json
import socket
from pathlib import Path
from typing import Any

import pytest

STUDIO_HOST = "127.0.0.1"
STUDIO_PORT = 4000
CONTRACTS_DIR = Path(__file__).resolve().parent.parent / "contracts"


def _studio_available() -> bool:
    try:
        sock = socket.create_connection((STUDIO_HOST, STUDIO_PORT), timeout=2)
        sock.close()
        return True
    except OSError:
        return False


STUDIO_UP = _studio_available()
skip_no_studio = pytest.mark.skipif(
    not STUDIO_UP,
    reason="GenLayer Studio not running (start with `genlayer up`)",
)


# ------------------------------------------------------------------
# Sample payloads
# ------------------------------------------------------------------

ENERGY_UK_TYPICAL = json.dumps({
    "electricity_kwh": 3100,
    "heating_type": "gas",
    "heating_kwh": 12500,
})

ENERGY_SOLAR_EV = json.dumps({
    "electricity_kwh": 1800,
    "heating_type": "heat_pump",
    "heating_kwh": 6000,
})

ENERGY_ZERO = json.dumps({
    "electricity_kwh": 0,
    "heating_type": "gas",
    "heating_kwh": 0,
})

TRANSPORT_CAR_FLIGHTS = json.dumps({
    "car_km": 12000,
    "car_type": "petrol",
    "domestic_flight_km": 0,
    "short_haul_flight_km": 3000,
    "long_haul_flight_km": 10000,
    "rail_km": 500,
    "bus_km": 200,
})

TRANSPORT_ZERO = json.dumps({
    "car_km": 0,
    "car_type": "average",
    "domestic_flight_km": 0,
    "short_haul_flight_km": 0,
    "long_haul_flight_km": 0,
    "rail_km": 0,
    "bus_km": 0,
})

TRANSPORT_EV = json.dumps({
    "car_km": 15000,
    "car_type": "ev",
    "domestic_flight_km": 0,
    "short_haul_flight_km": 0,
    "long_haul_flight_km": 0,
    "rail_km": 0,
    "bus_km": 0,
})

TRANSPORT_PETROL = json.dumps({
    "car_km": 15000,
    "car_type": "petrol",
    "domestic_flight_km": 0,
    "short_haul_flight_km": 0,
    "long_haul_flight_km": 0,
    "rail_km": 0,
    "bus_km": 0,
})

DIET_VEGAN = json.dumps({"diet_type": "vegan"})
DIET_HIGH_MEAT = json.dumps({"diet_type": "high_meat"})
DIET_MEDIUM = json.dumps({"diet_type": "medium_meat"})


# ------------------------------------------------------------------
# gltest imports with graceful degradation
# ------------------------------------------------------------------

try:
    from gltest import get_contract_factory, create_account  # type: ignore[attr-defined]
    _GLTEST_OK = True
except ImportError:
    _GLTEST_OK = False


# ------------------------------------------------------------------
# Fixtures
# ------------------------------------------------------------------

@pytest.fixture(scope="session")
def account():
    if not STUDIO_UP:
        pytest.skip("Studio not running")
    if not _GLTEST_OK:
        pytest.skip("gltest not installed")
    return create_account()


@pytest.fixture(scope="session")
def footprint_factory(account):
    factory = get_contract_factory("VerdantFootprint", account=account)
    return factory


@pytest.fixture(scope="session")
def offsets_factory(account):
    factory = get_contract_factory("VerdantOffsets", account=account)
    return factory


@pytest.fixture(scope="function")
def footprint_contract(footprint_factory, account):
    return footprint_factory.deploy(account=account)


@pytest.fixture(scope="function")
def offsets_contract(offsets_factory, account):
    return offsets_factory.deploy(account=account)
