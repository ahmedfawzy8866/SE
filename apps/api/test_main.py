"""
Tests for the Sierra Estates Python API (apps/api/main.py).

Run with:
    cd apps/api && pytest -v

These tests use FastAPI's TestClient (backed by httpx) so they exercise the
real ASGI app end-to-end without needing a live server.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Make sure apps/api is on the path so we can import main + property_finder_sync
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from main import app, PortfolioAsset  # noqa: E402
from property_finder_sync import PropertyFinderSyncHub  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


# ──────────────────────────────────────────────────────────────────────────────
# Health endpoint
# ──────────────────────────────────────────────────────────────────────────────
class TestHealth:
    def test_health_returns_ok(self, client: TestClient):
        resp = client.get("/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["service"] == "apps/api"

    def test_health_is_get_only(self, client: TestClient):
        for method in ("post", "put", "delete", "patch"):
            resp = client.request(method, "/health")
            assert resp.status_code in (405, 404), (
                f"{method.upper()} /health should not be allowed: got {resp.status_code}"
            )


# ──────────────────────────────────────────────────────────────────────────────
# /property-finder/format
# ──────────────────────────────────────────────────────────────────────────────
class TestFormatAsset:
    def test_format_asset_happy_path(self, client: TestClient):
        payload = {
            "id": "SB-UIPT-001",
            "title_en": "Golf Uptown Cairo Penthouse",
            "title_ar": "بنتهاوس أبتاون كايرو المطل على الجولف",
            "price": 45000000,
            "location": "Uptown Cairo",
        }
        resp = client.post("/property-finder/format", json=payload)
        assert resp.status_code == 200
        body = resp.json()
        assert body == {
            "reference": "SB-UIPT-001",
            "title_en": "Golf Uptown Cairo Penthouse",
            "title_ar": "بنتهاوس أبتاون كايرو المطل على الجولف",
            "offering_type": "investment",
            "price": 45000000,
            "location": "Uptown Cairo",
        }

    def test_format_asset_requires_id(self, client: TestClient):
        # Missing required field "id" → Pydantic 422
        resp = client.post("/property-finder/format", json={"title_en": "No ID"})
        assert resp.status_code == 422

    def test_format_asset_accepts_partial_fields(self, client: TestClient):
        # Only id is required; everything else is optional
        resp = client.post("/property-finder/format", json={"id": "X-1"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["reference"] == "X-1"
        assert body["title_en"] is None
        assert body["title_ar"] is None
        assert body["price"] is None
        assert body["location"] is None
        # offering_type is hard-coded by the hub
        assert body["offering_type"] == "investment"

    def test_format_asset_rejects_non_object_body(self, client: TestClient):
        # Sending a JSON array instead of object → 422
        resp = client.post("/property-finder/format", json=[{"id": "X"}])
        assert resp.status_code == 422

    def test_format_asset_rejects_wrong_type_for_id(self, client: TestClient):
        # id must be a string
        resp = client.post("/property-finder/format", json={"id": 123})
        assert resp.status_code == 422


# ──────────────────────────────────────────────────────────────────────────────
# /property-finder/sync
# ──────────────────────────────────────────────────────────────────────────────
class TestSyncAssets:
    def test_sync_single_asset(self, client: TestClient):
        resp = client.post(
            "/property-finder/sync",
            json={"assets": [{"id": "A1", "title_en": "Villa"}]},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["sync_status"] == "success"
        assert body["synced_count"] == 1
        assert body["errors"] == []

    def test_sync_multiple_assets(self, client: TestClient):
        assets = [{"id": f"A{i}"} for i in range(5)]
        resp = client.post("/property-finder/sync", json={"assets": assets})
        assert resp.status_code == 200
        body = resp.json()
        assert body["synced_count"] == 5

    def test_sync_empty_list_is_allowed(self, client: TestClient):
        # Pydantic accepts empty list — sync_hub will report 0 synced
        resp = client.post("/property-finder/sync", json={"assets": []})
        assert resp.status_code == 200
        assert resp.json()["synced_count"] == 0

    def test_sync_requires_assets_field(self, client: TestClient):
        resp = client.post("/property-finder/sync", json={})
        assert resp.status_code == 422

    def test_sync_rejects_malformed_asset(self, client: TestClient):
        # Missing required "id" on one of the assets
        resp = client.post(
            "/property-finder/sync",
            json={"assets": [{"id": "OK"}, {"title_en": "no id"}]},
        )
        assert resp.status_code == 422


# ──────────────────────────────────────────────────────────────────────────────
# PropertyFinderSyncHub unit tests (no FastAPI, no network)
# ──────────────────────────────────────────────────────────────────────────────
class TestPropertyFinderSyncHub:
    def test_format_portfolio_asset_returns_all_fields(self):
        hub = PropertyFinderSyncHub()
        out = hub.format_portfolio_asset(
            {
                "id": "X",
                "title_en": "EN",
                "title_ar": "AR",
                "price": 100,
                "location": "Cairo",
            }
        )
        assert out == {
            "reference": "X",
            "title_en": "EN",
            "title_ar": "AR",
            "offering_type": "investment",
            "price": 100,
            "location": "Cairo",
        }

    def test_format_portfolio_asset_handles_missing_keys(self):
        hub = PropertyFinderSyncHub()
        out = hub.format_portfolio_asset({})
        assert out["reference"] is None
        assert out["title_en"] is None
        assert out["price"] is None
        # offering_type is always set
        assert out["offering_type"] == "investment"

    def test_trigger_batch_sync_returns_success_shape(self):
        hub = PropertyFinderSyncHub()
        out = hub.trigger_batch_sync([{"id": "1"}, {"id": "2"}, {"id": "3"}])
        assert out["sync_status"] == "success"
        assert out["synced_count"] == 3
        assert isinstance(out["errors"], list)
        assert out["errors"] == []

    def test_trigger_batch_sync_zero_assets(self):
        hub = PropertyFinderSyncHub()
        out = hub.trigger_batch_sync([])
        assert out["synced_count"] == 0

    def test_endpoint_is_set_to_propertyfinder_ae(self):
        hub = PropertyFinderSyncHub()
        assert "propertyfinder.ae" in hub.api_endpoint


# ──────────────────────────────────────────────────────────────────────────────
# Pydantic model contract
# ──────────────────────────────────────────────────────────────────────────────
class TestPortfolioAssetModel:
    def test_id_is_required(self):
        with pytest.raises(Exception):
            PortfolioAsset()  # type: ignore[call-arg]

    def test_id_must_be_string(self):
        with pytest.raises(Exception):
            PortfolioAsset(id=123)  # type: ignore[arg-type]

    def test_optional_fields_default_to_none(self):
        a = PortfolioAsset(id="X")
        assert a.title_en is None
        assert a.title_ar is None
        assert a.price is None
        assert a.location is None

    def test_price_accepts_int_or_float(self):
        PortfolioAsset(id="X", price=100)
        PortfolioAsset(id="X", price=99.99)
