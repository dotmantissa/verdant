"""
Tests for VerdantOffsets contract.

Requires a running GenLayer Studio node. All tests are auto-skipped
when Studio is not reachable.

Run with:
  genlayer up && pytest tests/test_offsets.py -v

Covers:
- submit_project returns JSON with verification result
- project record is retrievable after submission
- get_project_status returns a valid status code
- get_project returns empty string for unknown IDs
- get_project_status returns -1 for unknown IDs
- retire_offsets against a non-existent project raises
- retire_offsets with zero or negative tonnes raises
- retirement record has all required fields
- retirement history accumulates
- total_retired tracks correctly
- empty address has zero total retired and empty array
"""
from __future__ import annotations

import json

import pytest

from .conftest import skip_no_studio


def _parse(result: str | dict) -> dict:
    if isinstance(result, dict):
        return result
    if isinstance(result, str) and result:
        return json.loads(result)
    return {}


SAMPLE = {
    "project_id": "VCS-TEST-001",
    "name": "Kariba REDD+ Forest Protection",
    "description": "Protecting 785,000 hectares of forest in Zimbabwe from deforestation.",
    "url": "https://registry.verra.org/app/projectDetail/VCS/934",
    "registry": "verra",
    "country": "ZW",
    "project_type": "forestry",
    "price": "12.50",
}


def _args(d: dict) -> list:
    return [
        d["project_id"], d["name"], d["description"],
        d["url"], d["registry"], d["country"], d["project_type"], d["price"],
    ]


# ------------------------------------------------------------------ #
# Submission structure                                                 #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_submit_project_returns_json(offsets_contract) -> None:
    result = offsets_contract.submit_project(_args(SAMPLE))
    parsed = _parse(result)
    assert "project_id" in parsed
    assert "verification" in parsed


@skip_no_studio
def test_submit_project_id_matches(offsets_contract) -> None:
    result = _parse(offsets_contract.submit_project(_args(SAMPLE)))
    assert result["project_id"] == SAMPLE["project_id"]


@skip_no_studio
def test_submit_project_status_code_is_valid(offsets_contract) -> None:
    result = _parse(offsets_contract.submit_project(_args(SAMPLE)))
    assert result["verification"]["status_code"] in (0, 1, 2)


@skip_no_studio
def test_submit_project_has_ai_assessment(offsets_contract) -> None:
    result = _parse(offsets_contract.submit_project(_args(SAMPLE)))
    assert "ai_assessment" in result["verification"]


@skip_no_studio
def test_submit_project_name_stored(offsets_contract) -> None:
    result = _parse(offsets_contract.submit_project(_args(SAMPLE)))
    assert result["name"] == SAMPLE["name"]


@skip_no_studio
def test_submit_project_price_stored(offsets_contract) -> None:
    result = _parse(offsets_contract.submit_project(_args(SAMPLE)))
    assert abs(result["price_usd_per_tonne"] - float(SAMPLE["price"])) < 0.01


@skip_no_studio
def test_submit_project_registry_stored(offsets_contract) -> None:
    result = _parse(offsets_contract.submit_project(_args(SAMPLE)))
    assert result["registry"] == "verra"


@skip_no_studio
def test_submit_project_has_submitted_at(offsets_contract) -> None:
    result = _parse(offsets_contract.submit_project(_args(SAMPLE)))
    assert "submitted_at" in result
    assert result["submitted_at"]  # non-empty


# ------------------------------------------------------------------ #
# Retrieval                                                            #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_get_project_after_submit(offsets_contract) -> None:
    offsets_contract.submit_project(_args(SAMPLE))
    fetched = offsets_contract.get_project([SAMPLE["project_id"]])
    assert isinstance(fetched, str) and len(fetched) > 0
    parsed = _parse(fetched)
    assert parsed["project_id"] == SAMPLE["project_id"]


@skip_no_studio
def test_get_project_unknown_returns_empty(offsets_contract) -> None:
    result = offsets_contract.get_project(["DOES_NOT_EXIST_XXXX"])
    assert result == ""


@skip_no_studio
def test_get_project_status_after_submit(offsets_contract) -> None:
    offsets_contract.submit_project(_args(SAMPLE))
    status = offsets_contract.get_project_status([SAMPLE["project_id"]])
    assert int(status) in (0, 1, 2)


@skip_no_studio
def test_get_project_status_unknown_is_minus_one(offsets_contract) -> None:
    status = offsets_contract.get_project_status(["GHOST-PROJECT-XXXX-9999"])
    assert int(status) == -1


# ------------------------------------------------------------------ #
# Retirement error paths                                               #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_retire_unknown_project_raises(offsets_contract) -> None:
    with pytest.raises(Exception):
        offsets_contract.retire_offsets(["NO_SUCH_PROJECT", "1.0", "Alice", "test"])


@skip_no_studio
def test_retire_zero_tonnes_raises(offsets_contract) -> None:
    offsets_contract.submit_project(_args(SAMPLE))
    with pytest.raises(Exception):
        offsets_contract.retire_offsets([SAMPLE["project_id"], "0", "Alice", "test"])


@skip_no_studio
def test_retire_negative_tonnes_raises(offsets_contract) -> None:
    offsets_contract.submit_project(_args(SAMPLE))
    with pytest.raises(Exception):
        offsets_contract.retire_offsets([SAMPLE["project_id"], "-5.0", "Alice", "test"])


# ------------------------------------------------------------------ #
# Retirement happy path (requires project to be verified)             #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_retirement_record_structure(offsets_contract) -> None:
    """
    Submits a real VCS project and retires against it if it verifies.
    Skips gracefully if the AI does not verify the project in this run.
    """
    pid = "VCS-BIOGAS-001"
    result_raw = offsets_contract.submit_project([
        pid,
        "Biogas Digesters Rural India",
        "Agricultural biogas digesters replacing wood fuel. Verra VCS registered.",
        "https://registry.verra.org",
        "verra", "IN", "methane_capture", "7.00",
    ])
    status_code = _parse(result_raw)["verification"]["status_code"]
    if status_code != 1:
        pytest.skip(f"Project not verified by AI (status={status_code}) — skipping retirement test")

    record = _parse(offsets_contract.retire_offsets([pid, "1.5", "User A", "2024 footprint"]))
    assert "project_id" in record
    assert "tonnes_co2e" in record
    assert "beneficiary_name" in record
    assert "retired_at" in record
    assert "retired_by" in record
    assert abs(record["tonnes_co2e"] - 1.5) < 0.01


@skip_no_studio
def test_retirement_history_accumulates(offsets_contract) -> None:
    pid = "VCS-SOLAR-KE"
    result_raw = offsets_contract.submit_project([
        pid,
        "Olkaria Geothermal Expansion Kenya",
        "Geothermal power reducing grid emissions in Kenya. Gold Standard verified.",
        "https://registry.goldstandard.org",
        "gold_standard", "KE", "renewable_energy", "10.00",
    ])
    status_code = _parse(result_raw)["verification"]["status_code"]
    if status_code != 1:
        pytest.skip(f"Project not verified (status={status_code})")

    offsets_contract.retire_offsets([pid, "1.0", "Bob", "baseline"])
    offsets_contract.retire_offsets([pid, "0.5", "Bob", "extra"])

    retirements_raw = offsets_contract.get_retirements([None])
    retirements = json.loads(retirements_raw)
    assert len(retirements) >= 2


@skip_no_studio
def test_total_retired_tracks(offsets_contract, account) -> None:
    pid = "VCS-WIND-ZA"
    result_raw = offsets_contract.submit_project([
        pid,
        "Cookstoves Programme Ethiopia",
        "Clean cooking stoves reducing wood combustion. Verra VCS Gold Level.",
        "https://registry.verra.org",
        "verra", "ET", "cookstoves", "6.00",
    ])
    status_code = _parse(result_raw)["verification"]["status_code"]
    if status_code != 1:
        pytest.skip(f"Project not verified (status={status_code})")

    offsets_contract.retire_offsets([pid, "3.0", "Carol", "Q1 offset"])
    total = offsets_contract.get_total_retired([account.address])
    assert int(total) >= 300  # 3.0 tonnes * 100


# ------------------------------------------------------------------ #
# Empty state                                                          #
# ------------------------------------------------------------------ #

@skip_no_studio
def test_get_retirements_empty_returns_empty_array(offsets_contract, account) -> None:
    result = offsets_contract.get_retirements([account.address])
    assert result == "[]"


@skip_no_studio
def test_get_total_retired_empty_is_zero(offsets_contract, account) -> None:
    result = offsets_contract.get_total_retired([account.address])
    assert int(result) == 0


@skip_no_studio
def test_project_total_retired_empty_is_zero(offsets_contract) -> None:
    result = offsets_contract.get_project_total_retired(["NEVER_USED_PROJECT"])
    assert int(result) == 0
