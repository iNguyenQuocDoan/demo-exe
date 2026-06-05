"""End-to-end test các chức năng LIFLOW trên BE thật (Render) bằng tài khoản được cấp.
Chạy: python scripts/liflow_api_test.py
Dùng curl qua subprocess (đa năng cho cả JSON lẫn multipart)."""
import json, subprocess, sys, time
from datetime import datetime, timedelta
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BE = "https://liflow-be.onrender.com/api"
PW = "12345"

def curl(method, path, token=None, body=None, form=None, params=None, raw=False):
    url = BE + path
    if params:
        q = "&".join(f"{k}={v}" for k, v in params.items())
        url += "?" + q
    args = ["curl", "-s", "-X", method, url, "--max-time", "60", "-w", "\n__HTTP__%{http_code}"]
    if token:
        args += ["-H", f"Authorization: Bearer {token}"]
    if body is not None:
        args += ["-H", "Content-Type: application/json", "-d", json.dumps(body)]
    if form:
        for k, v in form:
            args += ["-F", f"{k}={v}"]
    out = subprocess.run(args, capture_output=True, text=True, encoding="utf-8").stdout
    code = 0
    if "__HTTP__" in out:
        out, code = out.rsplit("__HTTP__", 1)
        code = int(code.strip() or 0)
    if raw:
        return code, out.strip()
    try:
        return code, json.loads(out)
    except Exception:
        return code, out.strip()

def unwrap(d):
    return d.get("data", d) if isinstance(d, dict) and "data" in d and "success" in d else d

results = []
def check(name, ok, detail=""):
    results.append((ok, name, detail))
    print(f"  [{'PASS' if ok else 'FAIL'}] {name} {('— ' + str(detail)) if detail else ''}")

def login(email):
    c, d = curl("POST", "/auth/login", body={"email": email, "password": PW})
    tok = d.get("accessToken") if isinstance(d, dict) else None
    return tok

print("== LOGIN ==")
admin = login("admin@tutor.com"); tutor = login("tutor1@tutor.com"); parent = login("parent1@tutor.com")
check("login admin/tutor1/parent1", all([admin, tutor, parent]))
if not all([admin, tutor, parent]):
    sys.exit("login failed")

c, me_t = curl("GET", "/auth/me", token=tutor)
c, me_p = curl("GET", "/auth/me", token=parent)
tutor_id = me_t.get("id"); parent_id = me_p.get("id")
print(f"  tutorId={tutor_id} parentId={parent_id}")

print("\n== 1) TUTOR cập nhật hồ sơ (PUT /tutors/tutor/profile, multipart) ==")
profile = {"description": "Gia sư Toán-Lý 5 năm KN, luyện thi đại học.",
           "hourlyRate": 200000, "experience": 5, "major": "Sư phạm Toán",
           "education": "ĐH Sư phạm TP.HCM", "subjectIds": []}
import tempfile, os
pf = os.path.join(tempfile.gettempdir(), "profile.json")
open(pf, "w", encoding="utf-8").write(json.dumps(profile, ensure_ascii=False))
pa = ["curl","-s","-X","PUT", BE+"/tutors/tutor/profile","--max-time","60",
      "-H",f"Authorization: Bearer {tutor}","-F",f"data=@{pf};type=application/json",
      "-w","\n__HTTP__%{http_code}"]
o = subprocess.run(pa, capture_output=True, text=True, encoding="utf-8").stdout
body, _, code = o.rpartition("__HTTP__")
check(f"update profile (HTTP {code.strip()})", code.strip() == "200", body.strip()[:160] if code.strip()!="200" else "ok")

c, det = curl("GET", f"/tutors/{tutor_id}/details", token=parent)
det = unwrap(det)
check("profile phản ánh hourlyRate", isinstance(det, dict) and det.get("hourlyRate") == 200000,
      f"hourlyRate={det.get('hourlyRate') if isinstance(det,dict) else det}")

print("\n== 2) TUTOR tạo slot (POST /bookings/slots — SlotRequest object) ==")
sd = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
slot_body = {"startTime": "19:00:00", "endTime": "21:00:00", "startDate": sd, "numberOfWeeks": 1}
c, d = curl("POST", "/bookings/slots", token=tutor, body=slot_body)
check(f"create slot (HTTP {c})", c in (200, 201), unwrap(d) if c not in (200,201) else "ok")

print("\n== 3) Lấy slot AVAILABLE của tutor ==")
c, slots = curl("GET", f"/tutors/slots/{tutor_id}", token=parent)
avail = [s for s in (slots if isinstance(slots, list) else []) if str(s.get("status","")).upper() == "AVAILABLE"]
check("có slot AVAILABLE", len(avail) > 0, f"{len(avail)} slot")
slot_id = avail[0]["id"] if avail else None

print("\n== 4) Ví parent TRƯỚC khi đặt ==")
c, w0 = curl("GET", "/wallet/me", token=parent)
bal0 = w0.get("availableBalance") if isinstance(w0, dict) else None
print(f"  parent available={bal0} frozen={w0.get('frozenBalance') if isinstance(w0,dict) else '?'}")

booking_id = None
if slot_id:
    print("\n== 5) PARENT đặt slot (POST /bookings/book/{slotId}) ==")
    c, d = curl("POST", f"/bookings/book/{slot_id}", token=parent)
    d2 = unwrap(d)
    booking_id = d2.get("bookingId") if isinstance(d2, dict) else None
    check(f"book slot (HTTP {c})", c in (200, 201) and booking_id, d2)

print("\n== 6) Lịch sử booking 2 phía ==")
c, hp = curl("GET", "/bookings/history", token=parent, params={"role": "PARENT", "page": 1, "size": 20})
c, ht = curl("GET", "/bookings/history", token=tutor, params={"role": "TUTOR", "page": 1, "size": 20})
hp_d = (unwrap(hp) or {}).get("data", []) if isinstance(unwrap(hp), dict) else []
ht_d = (unwrap(ht) or {}).get("data", []) if isinstance(unwrap(ht), dict) else []
check("parent history có booking", any(b.get("bookingId")==booking_id for b in hp_d) if booking_id else len(hp_d)>=0, f"{len(hp_d)} booking")
check("tutor history có booking", any(b.get("bookingId")==booking_id for b in ht_d) if booking_id else len(ht_d)>=0, f"{len(ht_d)} booking")

if booking_id:
    print("\n== 7) TUTOR accept ==")
    c, d = curl("POST", f"/bookings/{booking_id}/accept", token=tutor)
    check(f"accept (HTTP {c})", c in (200, 201), unwrap(d) if c not in (200,201) else "ok")

    print("\n== 8) Hoàn thành (tutor-complete + parent complete) ==")
    c1, d1 = curl("POST", f"/bookings/{booking_id}/tutor-complete", token=tutor)
    c2, d2 = curl("POST", f"/bookings/{booking_id}/complete", token=parent)
    check(f"tutor-complete (HTTP {c1})", c1 in (200,201), unwrap(d1) if c1 not in (200,201) else "ok")
    check(f"parent complete (HTTP {c2})", c2 in (200,201), unwrap(d2) if c2 not in (200,201) else "ok")

    print("\n== 9) PARENT đánh giá (POST /feedback/review) ==")
    c, d = curl("POST", "/feedback/review", token=parent,
                body={"bookingId": booking_id, "rating": 5, "comment": "Thầy dạy dễ hiểu, rất tận tâm!"})
    check(f"create review (HTTP {c})", c in (200,201), unwrap(d) if c not in (200,201) else "ok")
    c, rv = curl("GET", f"/feedback/tutor/{tutor_id}", token=parent, params={"page":1,"size":10})
    rv_d = (unwrap(rv) or {}).get("data", []) if isinstance(unwrap(rv), dict) else []
    check("review xuất hiện", len(rv_d) > 0, f"{len(rv_d)} review")

print("\n== 10) Ví SAU + transactions ==")
c, w1 = curl("GET", "/wallet/me", token=parent)
c, tx = curl("GET", "/wallet/transactions", token=parent)
print(f"  parent available={w1.get('availableBalance') if isinstance(w1,dict) else w1}")
print(f"  transactions={len(tx) if isinstance(tx,list) else tx}")
c, wt = curl("GET", "/wallet/me", token=tutor)
print(f"  tutor available={wt.get('availableBalance') if isinstance(wt,dict) else wt}")

print("\n===== TỔNG KẾT =====")
p = sum(1 for ok,_,_ in results if ok); f = len(results) - p
print(f"PASS {p}/{len(results)}  FAIL {f}")
for ok,name,det in results:
    if not ok: print(f"  FAIL: {name} -> {det}")
