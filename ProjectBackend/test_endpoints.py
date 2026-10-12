"""
Production-accurate integration tests.
Starts uvicorn as a real subprocess (same as prod), then hits it via httpx.
This avoids the Motor event-loop / SSL-context mismatch of in-process ASGI tests.
"""
import asyncio
import subprocess
import sys
import os
import time
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

PYTHON  = sys.executable
HOST    = "127.0.0.1"
PORT    = 8765          # Use a test port so we don't collide with prod
BASE    = f"http://{HOST}:{PORT}"


async def wait_for_server(url: str, timeout: float = 30.0) -> bool:
    """Poll until the server responds or timeout."""
    deadline = time.monotonic() + timeout
    async with httpx.AsyncClient() as client:
        while time.monotonic() < deadline:
            try:
                r = await client.get(url, timeout=2.0)
                if r.status_code < 500:
                    return True
            except Exception:
                pass
            await asyncio.sleep(0.5)
    return False


async def run_tests():
    print("=== STARTING PRODUCTION-ACCURATE END-TO-END VERIFICATION ===\n")

    # --- Start uvicorn subprocess ---
    proc = subprocess.Popen(
        [PYTHON, "-m", "uvicorn", "src.main:app",
         "--host", HOST, "--port", str(PORT), "--log-level", "warning"],
        cwd=os.path.dirname(__file__),
    )
    print(f"Waiting for uvicorn to start on {BASE} ...")
    ready = await wait_for_server(f"{BASE}/")
    if not ready:
        proc.kill()
        print("FATAL: uvicorn did not start within 30s")
        sys.exit(1)
    print("uvicorn is up!\n")

    try:
        async with httpx.AsyncClient(base_url=BASE, timeout=120.0) as client:

            # 1. Root route
            print("--- 1. Root Route ---")
            res = await client.get("/")
            assert res.status_code == 200, f"Root failed: {res.text}"
            print("OK:", res.json(), "\n")

            # 2. Generate single floor plan
            print("--- 2. Generate Floor Plan (POST /plans/generate) ---")
            payload = {
                "plot": "30x40", "floors": 2, "bedrooms": 4, "bathrooms": 3,
                "style": "Modern luxury", "kitchen": "Open",
                "parking": "1 car", "extras": ["Pooja room", "Balcony"],
                "variants": 1,
            }
            res = await client.post("/plans/generate", json=payload)
            if res.status_code != 200:
                print("FAILED:", res.text); sys.exit(1)
            plan = res.json()["variants"][0]
            print(f"OK  title={plan['meta']['title']!r}  "
                  f"rooms={len(plan['rooms'])}  openings={len(plan['openings'])}\n")

            # 3. Save plan to MongoDB
            print("--- 3. Save Plan (POST /plans/) ---")
            save_payload = {
                "title": plan["meta"]["title"],
                "sessionId": "ci-test-session-prod-99999",
                "planJson": plan,
                "chatHistory": [
                    {"role": "user",      "content": "Generate a modern luxury duplex"},
                    {"role": "assistant", "content": "Done — layout generated."},
                ],
            }
            res = await client.post("/plans/", json=save_payload)
            assert res.status_code == 200, f"Save failed: {res.text}"
            plan_id = res.json()["id"]
            print(f"OK  plan_id={plan_id}\n")

            # 4. Load plan
            print("--- 4. Load Plan (GET /plans/{id}) ---")
            res = await client.get(f"/plans/{plan_id}")
            assert res.status_code == 200, f"Load failed: {res.text}"
            loaded = res.json()
            assert loaded["_id"] == plan_id
            print(f"OK  title={loaded['title']!r}  chat_msgs={len(loaded['chatHistory'])}\n")

            # 5. Refine plan
            print("--- 5. Refine Plan (POST /plans/refine) ---")
            res = await client.post("/plans/refine", json={
                "currentPlan":  plan,
                "userMessage":  "Move kitchen to the southeast corner",
                "chatHistory":  save_payload["chatHistory"],
            })
            if res.status_code != 200:
                print("FAILED:", res.text); sys.exit(1)
            refined = res.json()
            print(f"OK  rooms={len(refined['rooms'])}\n")

            # 6. List plans by session
            print("--- 6. List Plans by Session (GET /plans?session=...) ---")
            res = await client.get("/plans/", params={"session": "ci-test-session-prod-99999"})
            assert res.status_code == 200, f"List failed: {res.text}"
            plans = res.json()
            assert len(plans) >= 1
            print(f"OK  {len(plans)} plan(s) in session\n")

            # 7. Public share link
            print("--- 7. Public Share Link (GET /plans/{id}/public) ---")
            res = await client.get(f"/plans/{plan_id}/public")
            assert res.status_code == 200, f"Public failed: {res.text}"
            print(f"OK  title={res.json()['title']!r}\n")

            # 8. Delete (cleanup)
            print("--- 8. Delete Plan (DELETE /plans/{id}) ---")
            res = await client.delete(f"/plans/{plan_id}")
            assert res.status_code == 200, f"Delete failed: {res.text}"
            print("OK:", res.json()["message"], "\n")

            print("=" * 55)
            print("ALL 8 ENDPOINTS PASSED - BACKEND IS PRODUCTION READY")
            print("=" * 55)

    finally:
        proc.terminate()
        proc.wait()
        print("\nuvicorn subprocess stopped.")


if __name__ == "__main__":
    asyncio.run(run_tests())
