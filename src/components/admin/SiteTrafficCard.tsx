"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, Eye, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type Totals = { pageviews: number; visitors: number };
type DailyPoint = { date: string; pageviews: number; visitors: number };

type AnalyticsResponse =
  | { ok: true; totals: Totals; daily: DailyPoint[]; updatedAt: string }
  | { ok: false; error: string };

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; totals: Totals; daily: DailyPoint[]; updatedAt: string };

function fmtInt(n: number): string {
  return n.toLocaleString("vi-VN");
}

function fmtDay(iso: string): string {
  // "2026-07-21" -> "21/07"
  const [, m, d] = iso.split("-");
  return d && m ? `${d}/${m}` : iso;
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly { name?: string; value?: unknown; color?: string }[];
  label?: string | number;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-foreground">
        {label != null ? fmtDay(String(label)) : ""}
      </p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs text-muted-foreground">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
            style={{ backgroundColor: p.color }}
          />
          {p.name === "visitors" ? "Lượt truy cập" : "Lượt xem"}:{" "}
          <span className="font-semibold text-foreground">
            {fmtInt(Number(p.value ?? 0))}
          </span>
        </p>
      ))}
    </div>
  );
};

export function SiteTrafficCard() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      const res = await fetch("/api/admin/analytics", {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      const body = (await res.json()) as AnalyticsResponse;
      if (!res.ok || !body.ok) {
        const message = !body.ok
          ? body.error
          : `Lỗi ${res.status} khi tải số liệu.`;
        setState({ status: "error", message });
        return;
      }
      setState({
        status: "ready",
        totals: body.totals,
        daily: body.daily,
        updatedAt: body.updatedAt,
      });
    } catch {
      setState({
        status: "error",
        message: "Không kết nối được tới máy chủ số liệu.",
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Lượt truy cập website
            </h2>
            <p className="text-xs text-muted-foreground">
              Nguồn: Vercel Analytics · chỉ admin xem, không công khai
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={refreshing}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      <div className="p-5 sm:p-6">
        {state.status === "loading" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 animate-pulse rounded-xl bg-muted" />
              <div className="h-20 animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="h-40 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : state.status === "error" ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">
                Chưa tải được số liệu
              </p>
              <p className="mt-0.5 text-muted-foreground">{state.message}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Tổng lượt truy cập
                </div>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {fmtInt(state.totals.visitors)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  Tổng lượt xem trang
                </div>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {fmtInt(state.totals.pageviews)}
                </p>
              </div>
            </div>

            {state.daily.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  7 ngày gần nhất
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart
                    data={state.daily}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={fmtDay}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={(props) => (
                        <ChartTooltip
                          active={props.active}
                          payload={
                            props.payload as
                              | readonly { name?: string; value?: unknown; color?: string }[]
                              | undefined
                          }
                          label={props.label as string | number | undefined}
                        />
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#visGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Chưa có dữ liệu theo ngày (số liệu Analytics cần thời gian tích luỹ
                sau khi bật).
              </p>
            )}

            <p className="text-right text-[11px] text-muted-foreground">
              Cập nhật lúc{" "}
              {new Date(state.updatedAt).toLocaleTimeString("vi-VN")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
