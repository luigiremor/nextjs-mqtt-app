"use client";

import { useState, useEffect } from "react";
import {
  BarChart as BarChartIcon,
  Thermometer,
  TrendingUp,
  Menu,
} from "lucide-react";
import { Area, AreaChart } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const chartConfig = {
  temperature: {
    label: "Temperature",
    color: "hsl(var(--chart-1))",
  },
  humidity: {
    label: "Humidity",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(50);

  const [chartData, setChartData] = useState<
    Array<{ time: string; temperature: number; humidity: number }>
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate data updates
      const newTemp = Math.max(
        10,
        Math.min(40, temperature + (Math.random() - 0.5) * 2)
      );
      setTemperature(newTemp);
      setHumidity((prev) =>
        Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5))
      );

      setChartData((prev) =>
        [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            temperature: Number(newTemp.toFixed(1)),
            humidity: Number(humidity.toFixed(1)),
          },
        ].slice(-6)
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [temperature, humidity]);

  const Sidebar = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-foreground">IOT Dashboard</h1>
      <nav className="space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          Dashboard
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
        >
          Devices
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
        >
          Settings
        </Button>
      </nav>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      <aside className="hidden md:block w-64 border-r border-border">
        <Sidebar />
      </aside>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden absolute top-4 left-4"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      <main className="flex-1 p-6 pt-16 md:pt-6">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="col-span-2 row-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Temperature
                </CardTitle>
                <Thermometer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {temperature.toFixed(1)}°C
                </div>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    data={chartData}
                    margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    height={150}
                  >
                    <Area
                      dataKey="temperature"
                      type="natural"
                      fill="var(--color-temperature)"
                      fillOpacity={0.4}
                      stroke="var(--color-temperature)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                      Current temperature: {temperature.toFixed(1)}°C
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 leading-none text-muted-foreground">
                      Last 6 readings
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            <Card className="col-span-2 row-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Humidity</CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {humidity.toFixed(1)}%
                </div>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    data={chartData}
                    margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    height={150}
                  >
                    <Area
                      dataKey="humidity"
                      type="natural"
                      fill="var(--color-humidity)"
                      fillOpacity={0.4}
                      stroke="var(--color-humidity)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                      Current humidity: {humidity.toFixed(1)}%
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 leading-none text-muted-foreground">
                      Last 6 readings
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
