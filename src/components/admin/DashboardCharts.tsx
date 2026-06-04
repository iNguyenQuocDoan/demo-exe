"use client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PieChartData = {
  name: string;
  value: number;
  color: string;
};

type BarChartData = {
  name: string;
  value: number;
  color?: string;
};

type TooltipPayloadItem = {
  name?: string;
  value?: unknown;
  payload?: {
    name?: string;
  };
};

type PieLabelProps = {
  cx?: number | string;
  cy?: number | string;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
};

interface DashboardPieChartProps {
  title: string;
  data: PieChartData[];
  loading?: boolean;
}

interface DashboardBarChartProps {
  title: string;
  data: BarChartData[];
  loading?: boolean;
  formatValue?: (v: number) => string;
}

const CustomTooltip = ({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  total: number;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = Number(data.value ?? 0);
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="text-sm font-semibold text-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {value} ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  formatValue: (v: number) => string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = Number(data.value ?? 0);
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="text-sm font-semibold text-foreground">{data.payload?.name}</p>
        <p className="text-sm text-muted-foreground">{formatValue(value)}</p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = (props: PieLabelProps) => {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent,
  } = props;
  if (!percent || percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function DashboardPieChart({
  title,
  data,
  loading = false,
}: DashboardPieChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center">
            <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  active={props.active}
                  payload={props.payload as readonly TooltipPayloadItem[] | undefined}
                  total={total}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Custom legend outside SVG — không bị cắt */}
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              {/* eslint-disable-next-line react/forbid-dom-props */}
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-foreground">
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardBarChart({
  title,
  data,
  loading = false,
  formatValue = (v) => v.toLocaleString("vi-VN"),
}: DashboardBarChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-end gap-3 px-2">
            {(["h-[60%]", "h-[90%]", "h-[40%]", "h-[70%]"] as const).map((cls, i) => (
              <div
                key={i}
                className={`flex-1 animate-pulse rounded-t bg-muted ${cls}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                return String(v);
              }}
              width={40}
            />
            <Tooltip
              content={(props) => (
                <BarTooltip
                  active={props.active}
                  payload={props.payload as readonly TooltipPayloadItem[] | undefined}
                  formatValue={formatValue}
                />
              )}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color ?? "var(--primary)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
