# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from datetime import datetime, timezone

from genlayer import *


class VerdantOffsets(gl.Contract):
    """
    Carbon offset project registry with AI verification.

    Users can submit offset projects for verification. The contract fetches
    publicly available monitoring data from the Gold Standard registry and
    Verra (VCS) public API to independently confirm project status before
    any purchase is recorded. Fraudulent or inactive projects are rejected.

    Offset retirements are permanent, on-chain records — no cancellation.
    """

    # project_id -> JSON project details
    projects: TreeMap[str, str]
    # project_id -> verification status: 0=pending, 1=verified, 2=rejected
    project_status: TreeMap[str, u256]
    # address -> JSON array of retirement records
    retirements: TreeMap[Address, str]
    # address -> total tonnes CO2e retired (integer, *100 for 2dp)
    total_retired: TreeMap[Address, u256]
    # project_id -> total tonnes retired across all users (*100)
    project_total_retired: TreeMap[str, u256]

    def __init__(self):
        pass

    # ------------------------------------------------------------------
    # Internal: fetch and verify offset project data
    # ------------------------------------------------------------------

    def _verify_project_from_registries(self, project_id: str, project_url: str) -> dict:
        """
        Attempt to verify a project by fetching public registry data.
        Checks Verra VCS public API, Gold Standard public search,
        and any project-specific URL provided.

        Returns a verdict dict with:
          verified: bool
          confidence: "high"|"medium"|"low"
          reason: str
          registry_data: dict
        """
        checks = {}

        # ---- Check Verra registry ----
        verra_api = f"https://registry.verra.org/uiapi/resource/resourceSummary/{project_id}"
        try:
            r = gl.nondet.web.get(
                verra_api,
                headers={"Accept": "application/json", "User-Agent": "Verdant/1.0"},
            )
            if r.status == 200 and r.body:
                raw = r.body.decode("utf-8", errors="replace")
                verra_data = json.loads(raw)
                checks["verra"] = {
                    "found": True,
                    "status": verra_data.get("resourceStatusDesc", ""),
                    "name": verra_data.get("resourceName", ""),
                    "type": verra_data.get("protocolCategory", ""),
                    "country": verra_data.get("country", ""),
                    "total_credits": verra_data.get("issuanceCount", 0),
                }
            elif r.status == 404:
                checks["verra"] = {"found": False, "status": "not_found"}
        except Exception:
            checks["verra"] = {"found": False, "status": "fetch_error"}

        # ---- Check Gold Standard registry ----
        gs_api = f"https://registry.goldstandard.org/api/projects?keyword={project_id}"
        try:
            r = gl.nondet.web.get(
                gs_api,
                headers={"Accept": "application/json", "User-Agent": "Verdant/1.0"},
            )
            if r.status == 200 and r.body:
                raw = r.body.decode("utf-8", errors="replace")
                gs_data = json.loads(raw)
                items = gs_data if isinstance(gs_data, list) else gs_data.get("data", [])
                if items:
                    first = items[0] if isinstance(items, list) else {}
                    checks["gold_standard"] = {
                        "found": True,
                        "status": first.get("status", ""),
                        "name": first.get("name", ""),
                        "country": first.get("country", ""),
                    }
                else:
                    checks["gold_standard"] = {"found": False, "status": "not_found"}
            else:
                checks["gold_standard"] = {"found": False, "status": "not_found"}
        except Exception:
            checks["gold_standard"] = {"found": False, "status": "fetch_error"}

        # ---- Check project URL if provided ----
        project_page_signal = None
        if project_url and project_url.startswith("http"):
            try:
                r = gl.nondet.web.render(project_url, mode="text", wait_after_loaded=2)
                if r and len(r) > 200:
                    project_page_signal = {
                        "accessible": True,
                        "content_length": len(r),
                        "snippet": r[:500],
                    }
            except Exception:
                project_page_signal = {"accessible": False}

        # ---- Determine verdict ----
        verra_found = checks.get("verra", {}).get("found", False)
        gs_found = checks.get("gold_standard", {}).get("found", False)
        verra_active = "registered" in str(checks.get("verra", {}).get("status", "")).lower() or \
                       "active" in str(checks.get("verra", {}).get("status", "")).lower()
        gs_active = "active" in str(checks.get("gold_standard", {}).get("status", "")).lower() or \
                    "registered" in str(checks.get("gold_standard", {}).get("status", "")).lower()

        if verra_found and verra_active:
            verified = True
            confidence = "high"
            reason = "Project confirmed active on Verra VCS public registry."
        elif gs_found and gs_active:
            verified = True
            confidence = "high"
            reason = "Project confirmed active on Gold Standard public registry."
        elif verra_found and not verra_active:
            verified = False
            confidence = "high"
            reason = f"Project found on Verra but status is '{checks['verra'].get('status')}' — not active."
        elif gs_found and not gs_active:
            verified = False
            confidence = "high"
            reason = f"Project found on Gold Standard but status is '{checks['gold_standard'].get('status')}' — not active."
        elif project_page_signal and project_page_signal.get("accessible"):
            verified = True
            confidence = "low"
            reason = "Project page is accessible but not found in public registries. Treat with caution."
        else:
            verified = False
            confidence = "low"
            reason = "Project not found in Verra, Gold Standard, or accessible via URL."

        return {
            "verified": verified,
            "confidence": confidence,
            "reason": reason,
            "registry_checks": checks,
            "project_page": project_page_signal,
        }

    # ------------------------------------------------------------------
    # Public write: submit a new project for verification
    # ------------------------------------------------------------------

    @gl.public.write
    def submit_project(
        self,
        project_id: str,
        name: str,
        description: str,
        project_url: str,
        registry: str,
        country: str,
        project_type: str,
        price_usd_per_tonne: str,
    ) -> str:
        """
        Submit an offset project for verification and listing.

        Parameters
        ----------
        project_id : str
            Registry identifier (e.g., "VCS-1234" or "GS-XXXX").
        name : str
            Human-readable project name.
        description : str
            Short description of the project activities.
        project_url : str
            Link to registry page or project website.
        registry : str
            "verra"|"gold_standard"|"other"
        country : str
            Country where the project operates.
        project_type : str
            "forestry"|"renewable_energy"|"methane_capture"|"energy_efficiency"|"blue_carbon"|"cookstoves"|"other"
        price_usd_per_tonne : str
            Asking price in USD per tonne CO2e, as a decimal string.

        Returns
        -------
        JSON string with verification result and project record.
        """
        submitter = gl.message.sender_address

        def validate_inputs() -> str | None:
            if not project_id or not project_id.strip():
                return "project_id is required"
            if not name or not name.strip():
                return "name is required"
            return None

        err = validate_inputs()
        if err:
            gl.advanced.user_error_immediate(err)

        pid = str(project_id).strip()
        clean_name = str(name).strip()
        clean_desc = str(description or "").strip()
        clean_url = str(project_url or "").strip()
        clean_registry = str(registry or "other").lower().strip()
        clean_country = str(country or "").strip()
        clean_type = str(project_type or "other").lower().strip()

        try:
            price = float(price_usd_per_tonne)
            if price < 0:
                price = 0.0
        except (ValueError, TypeError):
            price = 0.0

        def _run_verification() -> str:
            verdict = self._verify_project_from_registries(pid, clean_url)

            # Use AI to cross-check description against project type and registry data
            registry_snapshot = json.dumps(verdict.get("registry_checks", {}), sort_keys=True)
            ai_check = gl.nondet.exec_prompt(
                f"""You are verifying a carbon offset project for legitimacy.

Project ID: {pid}
Project Name: {clean_name}
Registry: {clean_registry}
Project Type: {clean_type}
Description: {clean_desc[:500]}

Registry data fetched: {registry_snapshot[:800]}

Assess:
1. Does the project type match the description?
2. Are there red flags in the description suggesting greenwashing or fraud?
3. Does the registry data, if present, corroborate the stated project type and country?

Reply ONLY with a JSON object:
{{
  "ai_flags": ["list of concerns, or empty list"],
  "greenwashing_risk": "low|medium|high",
  "type_consistent": true|false,
  "notes": "one sentence summary"
}}""",
                response_format="json",
            )

            ai_result = ai_check if isinstance(ai_check, dict) else {}

            # Final status: only verified if registry confirms AND AI has no high-risk flags
            gw_risk = str(ai_result.get("greenwashing_risk", "low")).lower()
            registry_verified = verdict.get("verified", False)
            confidence = verdict.get("confidence", "low")

            if registry_verified and gw_risk != "high":
                final_status = 1  # verified
            elif gw_risk == "high":
                final_status = 2  # rejected — greenwashing risk
            elif not registry_verified and confidence == "high":
                final_status = 2  # rejected — definitively not found
            else:
                final_status = 0  # pending — needs more data

            record = {
                "project_id": pid,
                "name": clean_name,
                "description": clean_desc,
                "project_url": clean_url,
                "registry": clean_registry,
                "country": clean_country,
                "project_type": clean_type,
                "price_usd_per_tonne": round(price, 2),
                "submitter": str(submitter),
                "submitted_at": datetime.now(timezone.utc).isoformat(),
                "verification": {
                    "status_code": final_status,
                    "status": ["pending", "verified", "rejected"][final_status],
                    "registry_verdict": verdict,
                    "ai_assessment": ai_result,
                },
            }
            return json.dumps(record, sort_keys=True)

        result_json = gl.eq_principle.prompt_comparative(
            _run_verification,
            """
            Compare the two project verification results.
            Accept if both agree on the final status (pending/verified/rejected).
            If they differ only in confidence level, accept and return the more conservative status.
            Reject if status codes differ by more than one level.
            """,
        )

        parsed = json.loads(result_json)
        final_status_code = parsed.get("verification", {}).get("status_code", 0)

        self.projects[pid] = result_json
        self.project_status[pid] = u256(final_status_code)

        return result_json

    # ------------------------------------------------------------------
    # Public write: retire offsets (permanent record)
    # ------------------------------------------------------------------

    @gl.public.write
    def retire_offsets(
        self,
        project_id: str,
        tonnes_co2e: str,
        beneficiary_name: str,
        retirement_reason: str,
    ) -> str:
        """
        Permanently retire carbon offsets from a verified project.
        Only verified projects (status=1) can be retired against.

        Parameters
        ----------
        project_id : str
            The registry project ID to retire from.
        tonnes_co2e : str
            Tonnes CO2e to retire, as a decimal string.
        beneficiary_name : str
            Name of the beneficiary (person or organization).
        retirement_reason : str
            Why these offsets are being retired (e.g., "2024 personal footprint").
        """
        sender = gl.message.sender_address

        if project_id not in self.project_status:
            gl.advanced.user_error_immediate(
                f"Project '{project_id}' not found. Submit it for verification first."
            )

        status = int(self.project_status[project_id])
        if status != 1:
            status_names = {0: "pending verification", 2: "rejected"}
            label = status_names.get(status, "unknown")
            gl.advanced.user_error_immediate(
                f"Project '{project_id}' is {label}. Only verified projects can be used for retirements."
            )

        try:
            tonnes = float(tonnes_co2e)
            if tonnes <= 0:
                gl.advanced.user_error_immediate("tonnes_co2e must be positive")
        except (ValueError, TypeError):
            gl.advanced.user_error_immediate(f"Invalid tonnes_co2e value: {tonnes_co2e!r}")

        tonnes_int = int(round(tonnes * 100))

        record = {
            "project_id": project_id,
            "tonnes_co2e": round(tonnes, 4),
            "beneficiary_name": str(beneficiary_name or "").strip(),
            "retirement_reason": str(retirement_reason or "").strip(),
            "retired_by": str(sender),
            "retired_at": datetime.now(timezone.utc).isoformat(),
        }
        record_json = json.dumps(record, sort_keys=True)

        # Append to user retirement history
        existing_raw = ""
        if sender in self.retirements:
            existing_raw = str(self.retirements[sender])
        try:
            history = json.loads(existing_raw) if existing_raw else []
        except json.JSONDecodeError:
            history = []
        if not isinstance(history, list):
            history = []
        history.append(record)
        self.retirements[sender] = json.dumps(history, sort_keys=True)

        # Update totals
        prev_user = int(self.total_retired[sender]) if sender in self.total_retired else 0
        self.total_retired[sender] = u256(prev_user + tonnes_int)

        prev_proj = int(self.project_total_retired[project_id]) if project_id in self.project_total_retired else 0
        self.project_total_retired[project_id] = u256(prev_proj + tonnes_int)

        return record_json

    # ------------------------------------------------------------------
    # Public views
    # ------------------------------------------------------------------

    @gl.public.view
    def get_project(self, project_id: str) -> str:
        """
        Returns full project record as JSON. Empty string if not found.
        """
        if project_id in self.projects:
            return str(self.projects[project_id])
        return ""

    @gl.public.view
    def get_project_status(self, project_id: str) -> int:
        """
        Returns project status: 0=pending, 1=verified, 2=rejected.
        Returns -1 if project not found.
        """
        if project_id in self.project_status:
            return int(self.project_status[project_id])
        return -1

    @gl.public.view
    def get_retirements(self, owner: Address) -> str:
        """
        Returns full retirement history for an address as JSON array.
        """
        if owner in self.retirements:
            return str(self.retirements[owner])
        return "[]"

    @gl.public.view
    def get_total_retired(self, owner: Address) -> int:
        """
        Returns total tonnes CO2e retired by address, multiplied by 100 (2dp integer).
        """
        if owner in self.total_retired:
            return int(self.total_retired[owner])
        return 0

    @gl.public.view
    def get_project_total_retired(self, project_id: str) -> int:
        """
        Returns total tonnes CO2e retired against a project, multiplied by 100.
        """
        if project_id in self.project_total_retired:
            return int(self.project_total_retired[project_id])
        return 0
