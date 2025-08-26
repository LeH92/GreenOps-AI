"use client";

import { Dot, Line, LineChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

const chartData = [
  { browser: "chrome", visitors: 100, fill: "var(--chart-1)" },
  { browser: "safari", visitors: 200, fill: "var(--chart-2)" },
  { browser: "firefox", visitors: 150, fill: "var(--chart-3)" },
  { browser: "edge", visitors: 250, fill: "var(--chart-4)" },
  { browser: "other", visitors: 110, fill: "var(--chart-5)" }
];

const chartConfig = {
  visitors: {
    label: "Revenue",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig;

export function TotalRevenueCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-display text-3xl leading-6">$15,231.89</div>
        <p className="text-muted-foreground mt-1.5 text-xs">
          <span className="text-green-600">+20.1%</span> from last month
        </p>
        <ChartContainer className="mt-4 h-[100px] w-full" config={chartConfig}>
          <LineChart
            data={chartData}
            accessibilityLayer
            margin={{
              top: 8,
              right: 8,
              left: 8
            }}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" nameKey="visitors" hideLabel />}
            />
            <Line
              dataKey="visitors"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={({ payload, ...props }) => {
                return (
                  <Dot
                    key={payload.browser}
                    r={5}
                    cx={props.cx}
                    cy={props.cy}
                    fill="var(--background)"
                    stroke={payload.fill}
                  />
                );
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
