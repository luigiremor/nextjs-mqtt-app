"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart as BarChartIcon,
  Thermometer,
  TrendingUp,
  Menu,
  Power,
  Lightbulb,
  Fan,
  Snowflake,
} from "lucide-react";
import { Area, AreaChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useWebSocket } from "@/services/websocketService";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { ENV } from "@/config/env-manager";

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

const relayToName = {
  relay1: "Heater",
  relay2: "Freezer",
  relay3: "Light",
  relay4: "Fan",
};

const relayToIcon = {
  relay1: <Thermometer className="h-4 w-4 text-muted-foreground" />,
  relay2: <Snowflake className="h-4 w-4 text-muted-foreground" />,
  relay3: <Lightbulb className="h-4 w-4 text-muted-foreground" />,
  relay4: <Fan className="h-4 w-4 text-muted-foreground" />,
};

export default function Dashboard() {
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(50);

  const [chartData, setChartData] = useState<
    Array<{
      id: number;
      timestamp: string;
      temperature: number;
      humidity: number;
    }>
  >([]);

  const [relayStatus, setRelayStatus] = useState({
    relay1: false,
    relay2: false,
    relay3: false,
    relay4: false,
  });

  useEffect(() => {
    const fetchRelayStatus = async () => {
      try {
        const response = await fetch(ENV.BACKEND_URL + "/relay/status");

        const data = await response.json();

        console.log("data", data);
        setRelayStatus(data);
      } catch (error) {
        console.error("Error fetching relay status:", error);
      }
    };

    fetchRelayStatus();
  }, []);

  const handleWebSocketMessage = useCallback((data: unknown) => {
    console.log("Received sensor data:", data);
    const sensorData = data as {
      id: number;
      temperature: number;
      humidity: number;
      timestamp: string;
    }[];

    sensorData.reverse();

    // Atualiza valores atuais
    const latestReading = sensorData[0];
    setTemperature(latestReading.temperature);
    setHumidity(latestReading.humidity);

    // Atualiza dados do gráfico
    setChartData((prev) => {
      const newData = [...prev, ...sensorData];
      // Mantém apenas os últimos N registros para o gráfico
      return newData.slice(-15); // ou outro número desejado
    });
  }, []);

  useWebSocket(ENV.BACKEND_URL + "/sensors", handleWebSocketMessage);

  const updateRelays = async (updatedRelayStatus: {
    relay1: boolean;
    relay2: boolean;
    relay3: boolean;
    relay4: boolean;
  }) => {
    try {
      console.log("updatedRelayStatus", updatedRelayStatus);

      const response = await fetch(ENV.BACKEND_URL + "/relay/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Add this line
        },
        body: JSON.stringify(updatedRelayStatus),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setRelayStatus(updatedRelayStatus);
    } catch (error) {
      console.error("Error updating relays:", error);
    }
  };

  const handleRelayToggle = (relay: keyof typeof relayStatus) => {
    // Atualiza o estado visual normalmente
    setRelayStatus((prev) => ({
      ...prev,
      [relay]: !prev[relay],
    }));

    console.log("relay", relayStatus);

    const backendStatus = {
      ...relayStatus,
      [relay]: !relayStatus[relay],
    };

    console.log("backendStatus", backendStatus);
    updateRelays(backendStatus);
  };

  const Sidebar = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-foreground">IOT Dashboard</h1>
      <nav className="space-y-2">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start"
          )}
        >
          Dashboard
        </Link>
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
                  {temperature?.toFixed(1)}°C
                </div>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    data={chartData}
                    margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    height={150}
                  >
                    <XAxis dataKey="timestamp" />
                    <Area
                      dataKey="temperature"
                      type="natural"
                      fill="var(--color-temperature)"
                      fillOpacity={0.4}
                      stroke="var(--color-temperature)"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                      Current temperature: {temperature?.toFixed(1)}°C
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
                  {humidity?.toFixed(1)}%
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
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                      Current humidity: {humidity?.toFixed(1)}%
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
          <Card className="col-span-2 sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Control Center</CardTitle>
              <Power className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(relayStatus).map(([relay, status]) => (
                  <div
                    key={relay}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
                  >
                    <div className="flex items-center gap-2">
                      {relayToIcon[relay as keyof typeof relayToIcon]}
                      <span className="text-sm font-medium">
                        {relayToName[relay as keyof typeof relayToName]}
                      </span>
                    </div>
                    <Switch
                      checked={!status}
                      onCheckedChange={() => {
                        console.log("relay sent", relay);
                        handleRelayToggle(relay as keyof typeof relayStatus);
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </main>
    </div>
  );
}
