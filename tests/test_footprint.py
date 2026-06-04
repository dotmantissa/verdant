"""
Tests for VerdantFootprint contract.

Requires a running GenLayer Studio node. All tests are auto-skipped
when Studio is not reachable.

Run with:
  genlayer up && pytest tests/test_footprint.py -v

Covers:
- calculate_footprint returns valid JSON with correct structure
- all breakdown fields are non-negative
- zero-input edge case produces zero energy and transport
- high-meat diet has greater diet_kg_co2e than vegan
- EV produces less transport footprint than petrol car
- country code affects electricity intensity (CN > SE)
- year and label are preserved in the stored record
- invalid year clamps to a valid default
- record count increments on each call
- latest_footprint is a non-negative int
- footprint history is a valid JSON array
- history accumulates across multiple calls
- emission context contains expected reference fields
- Paris target and global average are within known ranges
- malformed JSON input is handled without crash
"""
from __future__ import annotations

import json

import pytest

from .conftest import (
    DIET_HIGH_MEAT,
    DIET_MEDIUM,
    DIET_VEGAN,
    ENERGY_SOLAR_EV,
    ENERGY_UK_TYPICAL,
    ENERGY_ZERO,
    TRANSPORT_CAR_FLIGHTS,
    TRANSPORT_EV,
    TRANSPORT_PETROL,
    TRANSPORT_ZERO,
    skip_no_studio,
)


def _parse(result: str | dict) -> dict:
    if isinstance(result, dict):
        return result
    return json.loads(result)


# ------------------------------------------------------------------ #
# Structure and field presence                                         #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_calculate_returns_json(footprint_contract) -> None:
    result = footprint_contract.calculate_footprint(
        [ENERGY_UK_TYPICAL, TRANSPORT_CAR_FLIGHTS, DIET_MEDIUM, "GB", 2024, "test"]
    )
    parsed = _parse(result)
    assert "total_kg_co2e" in parsed
    assert "breakdown" in parsed
    assert "data_sources" in parsed


@skip_no_studio
def test_breakdown_has_required_keys(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_UK_TYPICAL, TRANSPORT_CAR_FLIGHTS, DIET_MEDIUM, "GB", 2024, "test"]
        )
    )
    bd = result["breakdown"]
    assert "energy_kg_co2e" in bd
    assert "transport_kg_co2e" in bd
    assert "diet_kg_co2e" in bd
    assert "detail" in bd


@skip_no_studio
def test_data_sources_present(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_UK_TYPICAL, TRANSPORT_ZERO, DIET_VEGAN, "GB", 2024, "test"]
        )
    )
    ds = result["data_sources"]
    assert "electricity_factors" in ds
    assert "transport_factors" in ds
    assert "diet_factors" in ds


# ------------------------------------------------------------------ #
# Numeric correctness                                                  #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_total_is_non_negative(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_UK_TYPICAL, TRANSPORT_CAR_FLIGHTS, DIET_HIGH_MEAT, "GB", 2024, "test"]
        )
    )
    assert result["total_kg_co2e"] >= 0


@skip_no_studio
def test_all_breakdown_non_negative(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_UK_TYPICAL, TRANSPORT_CAR_FLIGHTS, DIET_MEDIUM, "GB", 2024, "test"]
        )
    )
    bd = result["breakdown"]
    assert bd["energy_kg_co2e"] >= 0
    assert bd["transport_kg_co2e"] >= 0
    assert bd["diet_kg_co2e"] >= 0


@skip_no_studio
def test_zero_inputs_energy_and_transport_are_zero(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_ZERO, TRANSPORT_ZERO, DIET_VEGAN, "GB", 2024, "test"]
        )
    )
    assert result["breakdown"]["energy_kg_co2e"] == 0.0
    assert result["breakdown"]["transport_kg_co2e"] == 0.0


@skip_no_studio
def test_high_meat_diet_greater_than_vegan(footprint_contract) -> None:
    vegan = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_ZERO, TRANSPORT_ZERO, DIET_VEGAN, "GB", 2024, "vegan"]
        )
    )
    meat = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_ZERO, TRANSPORT_ZERO, DIET_HIGH_MEAT, "GB", 2024, "meat"]
        )
    )
    assert meat["breakdown"]["diet_kg_co2e"] > vegan["breakdown"]["diet_kg_co2e"]


@skip_no_studio
def test_total_equals_sum_of_breakdown(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_UK_TYPICAL, TRANSPORT_CAR_FLIGHTS, DIET_MEDIUM, "GB", 2024, "test"]
        )
    )
    bd = result["breakdown"]
    expected = round(bd["energy_kg_co2e"] + bd["transport_kg_co2e"] + bd["diet_kg_co2e"], 2)
    assert abs(result["total_kg_co2e"] - expected) < 1.0


@skip_no_studio
def test_ev_lower_transport_than_petrol(footprint_contract) -> None:
    petrol = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_ZERO, TRANSPORT_PETROL, DIET_VEGAN, "GB", 2024, "petrol"]
        )
    )
    ev = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_ZERO, TRANSPORT_EV, DIET_VEGAN, "GB", 2024, "ev"]
        )
    )
    assert ev["breakdown"]["transport_kg_co2e"] < petrol["breakdown"]["transport_kg_co2e"]


@skip_no_studio
def test_cn_grid_higher_than_se(footprint_contract) -> None:
    import json as _json
    energy = _json.dumps({"electricity_kwh": 5000, "heating_type": "gas", "heating_kwh": 0})
    cn = _parse(
        footprint_contract.calculate_footprint(
            [energy, TRANSPORT_ZERO, DIET_VEGAN, "CN", 2024, "cn"]
        )
    )
    se = _parse(
        footprint_contract.calculate_footprint(
            [energy, TRANSPORT_ZERO, DIET_VEGAN, "SE", 2024, "se"]
        )
    )
    assert cn["breakdown"]["energy_kg_co2e"] > se["breakdown"]["energy_kg_co2e"]


# ------------------------------------------------------------------ #
# Metadata persistence                                                 #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_year_persisted(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_UK_TYPICAL, TRANSPORT_ZERO, DIET_MEDIUM, "GB", 2023, "test"]
        )
    )
    assert result["year"] == 2023


@skip_no_studio
def test_label_persisted(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_UK_TYPICAL, TRANSPORT_ZERO, DIET_MEDIUM, "GB", 2024, "my label"]
        )
    )
    assert result.get("label") == "my label"


@skip_no_studio
def test_invalid_year_clamps_to_default(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            [ENERGY_UK_TYPICAL, TRANSPORT_ZERO, DIET_MEDIUM, "GB", 1800, "test"]
        )
    )
    assert result["year"] == 2024


# ------------------------------------------------------------------ #
# Storage                                                              #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_record_count_increments(footprint_contract, account) -> None:
    footprint_contract.calculate_footprint(
        [ENERGY_UK_TYPICAL, TRANSPORT_ZERO, DIET_MEDIUM, "GB", 2024, "first"]
    )
    count_one = footprint_contract.get_record_count([account.address])
    footprint_contract.calculate_footprint(
        [ENERGY_SOLAR_EV, TRANSPORT_ZERO, DIET_VEGAN, "GB", 2024, "second"]
    )
    count_two = footprint_contract.get_record_count([account.address])
    assert int(count_two) == int(count_one) + 1


@skip_no_studio
def test_latest_footprint_is_non_negative_int(footprint_contract, account) -> None:
    footprint_contract.calculate_footprint(
        [ENERGY_UK_TYPICAL, TRANSPORT_CAR_FLIGHTS, DIET_MEDIUM, "GB", 2024, "test"]
    )
    latest = footprint_contract.get_latest_footprint([account.address])
    assert isinstance(int(latest), int)
    assert int(latest) >= 0


@skip_no_studio
def test_footprint_history_is_json_array(footprint_contract, account) -> None:
    footprint_contract.calculate_footprint(
        [ENERGY_UK_TYPICAL, TRANSPORT_CAR_FLIGHTS, DIET_MEDIUM, "GB", 2024, "test"]
    )
    raw = footprint_contract.get_footprint_history([account.address])
    history = json.loads(raw)
    assert isinstance(history, list)
    assert len(history) >= 1


@skip_no_studio
def test_history_accumulates(footprint_contract, account) -> None:
    footprint_contract.calculate_footprint(
        [ENERGY_UK_TYPICAL, TRANSPORT_ZERO, DIET_MEDIUM, "GB", 2024, "first"]
    )
    footprint_contract.calculate_footprint(
        [ENERGY_SOLAR_EV, TRANSPORT_ZERO, DIET_VEGAN, "DE", 2023, "second"]
    )
    history = json.loads(footprint_contract.get_footprint_history([account.address]))
    assert len(history) >= 2


# ------------------------------------------------------------------ #
# Emission context                                                     #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_emission_context_has_required_fields(footprint_contract) -> None:
    ctx = _parse(footprint_contract.get_emission_context([]))
    assert "global_average_t_co2e" in ctx
    assert "paris_target_t_co2e" in ctx
    assert "country_averages" in ctx


@skip_no_studio
def test_paris_target_in_range(footprint_contract) -> None:
    ctx = _parse(footprint_contract.get_emission_context([]))
    assert 1.0 <= ctx["paris_target_t_co2e"] <= 3.0


@skip_no_studio
def test_global_average_in_range(footprint_contract) -> None:
    ctx = _parse(footprint_contract.get_emission_context([]))
    assert 3.0 <= ctx["global_average_t_co2e"] <= 8.0


# ------------------------------------------------------------------ #
# Malformed input resilience                                           #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_malformed_energy_json_does_not_crash(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(
            ["not valid json", TRANSPORT_ZERO, DIET_VEGAN, "GB", 2024, "test"]
        )
    )
    assert "total_kg_co2e" in result
    assert result["breakdown"]["energy_kg_co2e"] == 0.0


@skip_no_studio
def test_empty_dicts_handled(footprint_contract) -> None:
    result = _parse(
        footprint_contract.calculate_footprint(["{}", "{}", "{}", "GB", 2024, "test"])
    )
    assert result["total_kg_co2e"] >= 0
