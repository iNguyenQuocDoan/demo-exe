"""Test phần còn lại: withdraw, admin process, user block, approve/reject, completion timing."""
import json, subprocess, sys
from datetime import datetime, timedelta
try: sys.stdout.reconfigure(encoding="utf-8")
except Exception: pass

BE = "https://liflow-be.onrender.com/api"; PW = "12345"
def curl(method, path, token=None, body=None, params=None):
    url = BE + path
    if params: url += "?" + "&".join(f"{k}={v}" for k,v in params.items())
    a = ["curl","-s","-X",method,url,"--max-time","60","-w","\n__H__%{http_code}"]
    if token: a += ["-H",f"Authorization: Bearer {token}"]
    if body is not None: a += ["-H","Content-Type: application/json","-d",json.dumps(body)]
    o = subprocess.run(a,capture_output=True,text=True,encoding="utf-8").stdout
    b,_,c = o.rpartition("__H__")
    try: return int(c.strip() or 0), json.loads(b.strip())
    except Exception: return int(c.strip() or 0), b.strip()
def login(e):
    _,d = curl("POST","/auth/login",body={"email":e,"password":PW})
    return d.get("accessToken") if isinstance(d,dict) else None
def U(d): return d.get("data",d) if isinstance(d,dict) and "success" in d else d
res=[]
def ck(n,ok,det=""): res.append(ok); print(f"  [{'PASS' if ok else 'FAIL'}] {n} {('— '+str(det)[:170]) if det else ''}")

admin=login("admin@tutor.com"); tutor=login("tutor1@tutor.com"); parent=login("parent1@tutor.com")
_,me_t=curl("GET","/auth/me",token=tutor); tutor_id=me_t.get("id")
_,me_p=curl("GET","/auth/me",token=parent); parent_id=me_p.get("id")
_,users=curl("GET","/users",token=admin,params={"page":1,"size":50})
ulist=(U(users) or {}).get("data",[])
# tìm 1 parent khác để test block (không block chính mình)
victim=next((u for u in ulist if u.get("email")=="parent3@tutor.com"), None)

print("== A) WITHDRAW: tutor tạo yêu cầu rút ==")
c,wb=curl("GET","/wallet/me",token=tutor); print(f"  tutor available={wb.get('availableBalance') if isinstance(wb,dict) else wb}")
c,d=curl("POST","/wallet/withdraw",token=tutor,body={"amount":100000,"bankName":"Vietcombank","bankAccountNumber":"0123456789","bankAccountName":"NGUYEN GIA SU ONE"})
ck(f"tutor withdraw (HTTP {c})", c in (200,201), U(d) if c not in (200,201) else "ok")

print("== B) ADMIN xem & duyệt withdraw ==")
c,pend=curl("GET","/wallet/withdraw/pending",token=admin)
plist=(U(pend) or {}).get("data",[]) if isinstance(U(pend),dict) else (U(pend) if isinstance(U(pend),list) else [])
ck("admin thấy withdraw pending", len(plist)>0, f"{len(plist)} pending")
if plist:
    wid=plist[0].get("id")
    c,d=curl("POST",f"/wallet/withdraw/{wid}/process",token=admin,body={"approve":True,"adminNote":"OK test"})
    ck(f"admin process withdraw (HTTP {c})", c in (200,201), U(d) if c not in (200,201) else "ok")

print("== C) ADMIN block/unblock user (PUT /users/{id}/status?isBlocked=) ==")
if victim:
    vid=victim.get("id")
    c,d=curl("PUT",f"/users/{vid}/status",token=admin,params={"isBlocked":"true"})
    ck(f"block user (HTTP {c})", c in (200,201), U(d) if c not in (200,201) else "ok")
    c,d=curl("PUT",f"/users/{vid}/status",token=admin,params={"isBlocked":"false"})
    ck(f"unblock user (HTTP {c})", c in (200,201), U(d) if c not in (200,201) else "ok")
else:
    ck("tìm user để block", False, "no parent3")

print("== D) ADMIN approve/reject tutor (pending) ==")
c,pt=curl("GET","/tutors/pending",token=admin,params={"pageNo":1,"pageSize":10})
ptl=(U(pt) or {}).get("data",[]) if isinstance(U(pt),dict) else []
ck("get pending tutors (endpoint sống)", c==200, f"{len(ptl)} pending (BE chưa có hồ sơ chờ)")

print("== E) Completion timing: tạo slot QUÁ KHỨ → book → accept → tutor-complete ==")
past = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
c,d=curl("POST","/bookings/slots",token=tutor,body={"startTime":"08:00:00","endTime":"10:00:00","startDate":past,"numberOfWeeks":1})
print(f"  create past slot HTTP {c}: {U(d) if c not in (200,201) else 'ok'}")
c,slots=curl("GET",f"/tutors/slots/{tutor_id}",token=parent)
past_slot=next((s for s in (slots if isinstance(slots,list) else []) if str(s.get("status","")).upper()=="AVAILABLE" and s.get("startTime","")<datetime.now().isoformat()), None)
if past_slot:
    c,d=curl("POST",f"/bookings/book/{past_slot['id']}",token=parent); bid=(U(d) or {}).get("bookingId")
    print(f"  book past slot HTTP {c} bid={bid}: {U(d) if c not in (200,201) else 'ok'}")
    if bid:
        c1,_=curl("POST",f"/bookings/{bid}/accept",token=tutor)
        c2,d2=curl("POST",f"/bookings/{bid}/tutor-complete",token=tutor)
        c3,d3=curl("POST",f"/bookings/{bid}/complete",token=parent)
        ck(f"accept past (HTTP {c1})", c1 in (200,201))
        ck(f"tutor-complete past (HTTP {c2})", c2 in (200,201), U(d2) if c2 not in (200,201) else "ok")
        ck(f"parent complete past (HTTP {c3})", c3 in (200,201), U(d3) if c3 not in (200,201) else "ok")
        if c2 in (200,201) and c3 in (200,201):
            c,d=curl("POST","/feedback/review",token=parent,body={"bookingId":bid,"rating":5,"comment":"Tốt"})
            ck(f"review sau hoàn thành (HTTP {c})", c in (200,201), U(d) if c not in (200,201) else "ok")
else:
    print("  (BE không cho tạo/đặt slot quá khứ — bỏ qua)")

print(f"\n===== PASS {sum(res)}/{len(res)} =====")
