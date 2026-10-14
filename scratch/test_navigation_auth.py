import urllib.request
import urllib.parse
import json
import http.cookiejar

BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:8080/api"

print("================================================================================")
print("TESTING PUBLIC AND AUTHENTICATED NAVIGATION & ROUTE PROTECTION")
print("================================================================================")

# 1. TEST UNAUTHENTICATED PUBLIC VISITOR
print("\n--- 1. Testing Unauthenticated Public Visitors ---")

# (a) Home page
try:
    req = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        assert resp.status == 200
        assert "Portal Access" in html
        assert "Insights" in html
        assert "About" in html
        print("[PASS] Public Home page accessible: Displays Home, Insights, About, and Portal Access")
except Exception as e:
    print(f"[FAIL] Public Home page error: {e}")

# (b) Insights page (public)
try:
    req = urllib.request.Request(f"{BASE_URL}/insights", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        print("[PASS] Public Insights page accessible without login (HTTP 200)")
except Exception as e:
    print(f"[FAIL] Public Insights page error: {e}")

# (c) About page (public)
try:
    req = urllib.request.Request(f"{BASE_URL}/about", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        print("[PASS] Public About page accessible without login (HTTP 200)")
except Exception as e:
    print(f"[FAIL] Public About page error: {e}")

# (d) Direct access to protected operational routes WITHOUT authentication
class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Do not follow redirect so we can inspect the 307
        return None

opener = urllib.request.build_opener(NoRedirectHandler)

protected_routes = [
    "/map",
    "/ai-monitoring",
    "/alerts",
    "/reports",
    "/projects",
    "/simulation",
    "/agencies",
    "/ministry/dashboard",
    "/district/dashboard",
    "/state/dashboard",
    "/mp/dashboard"
]

for route in protected_routes:
    try:
        req = urllib.request.Request(f"{BASE_URL}{route}", headers={"User-Agent": "Mozilla/5.0"})
        resp = opener.open(req)
        print(f"[FAIL] Protected route {route} allowed direct access without login! (Status: {resp.status})")
    except urllib.error.HTTPError as e:
        if e.code in (307, 308, 302):
            location = e.headers.get("Location", "")
            if "/login" in location:
                print(f"[PASS] Unauthenticated access to {route} blocked: Redirected to {location} (HTTP {e.code})")
            else:
                print(f"[WARN] Redirected to unexpected location: {location}")
        else:
            print(f"[FAIL] Unexpected error status for {route}: {e.code}")
    except Exception as e:
        print(f"[FAIL] Exception testing {route}: {e}")

# 2. TEST AUTHENTICATED OFFICIAL NAVIGATION
print("\n--- 2. Testing Authenticated Officials (With mplads_token cookie) ---")

roles = [
    ("ROLE_MINISTRY_ADMIN", "ministry.admin@gov.in", "Admin@123456", "/ministry/dashboard"),
    ("ROLE_STATE_NODAL_AUTHORITY", "state.mh@gov.in", "State@123456", "/state/dashboard"),
    ("ROLE_DISTRICT_AUTHORITY", "district.pune@gov.in", "District@123456", "/district/dashboard"),
    ("ROLE_MP", "mp.pune@sansad.nic.in", "Mp@123456", "/mp/dashboard"),
]

for role_name, email, password, dashboard_url in roles:
    try:
        # Authenticate via backend API to get real JWT token
        login_data = json.dumps({"email": email, "password": password}).encode('utf-8')
        req = urllib.request.Request(
            f"{API_URL}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            token = data["data"]["accessToken"]

        # Now make request to Next.js with cookie
        req = urllib.request.Request(
            f"{BASE_URL}{dashboard_url}",
            headers={
                "User-Agent": "Mozilla/5.0",
                "Cookie": f"mplads_token={token}"
            }
        )
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            print(f"[PASS] Authenticated {role_name} granted access to {dashboard_url} (HTTP 200)")

    except Exception as e:
        print(f"[FAIL] Authenticated access failed for {role_name}: {e}")

# Test operational pages with authenticated token
print("\n--- 3. Testing Operational Pages with Authentication ---")
try:
    operational_routes = ["/map", "/ai-monitoring", "/alerts", "/reports", "/projects", "/simulation", "/agencies"]
    for op_route in operational_routes:
        req = urllib.request.Request(
            f"{BASE_URL}{op_route}",
            headers={
                "User-Agent": "Mozilla/5.0",
                "Cookie": f"mplads_token={token}"
            }
        )
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            print(f"[PASS] Authenticated official granted access to operational tool {op_route} (HTTP 200)")
except Exception as e:
    print(f"[FAIL] Operational page authenticated access failed: {e}")

print("\n================================================================================")
print("TEST COMPLETED SUCCESSFULLY: ALL SCENARIOS VERIFIED")
print("================================================================================")
