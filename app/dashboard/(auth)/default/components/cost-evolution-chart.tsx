"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatChangePercentage } from "@/lib/format-utils";

// Données fictives pour l'évolution des coûts par fournisseur
const costData = [
  { month: "Jan", AWS: 420, Azure: 380, GCP: 290, OpenAI: 180 },
  { month: "Fév", AWS: 450, Azure: 410, GCP: 320, OpenAI: 220 },
  { month: "Mar", AWS: 480, Azure: 440, GCP: 350, OpenAI: 260 },
  { month: "Avr", AWS: 520, Azure: 470, GCP: 380, OpenAI: 300 },
  { month: "Mai", AWS: 490, Azure: 450, GCP: 360, OpenAI: 280 },
  { month: "Juin", AWS: 550, Azure: 500, GCP: 420, OpenAI: 340 },
  { month: "Juil", AWS: 580, Azure: 530, GCP: 450, OpenAI: 380 },
  { month: "Août", AWS: 620, Azure: 570, GCP: 480, OpenAI: 420 },
  { month: "Sep", AWS: 590, Azure: 540, GCP: 460, OpenAI: 400 },
  { month: "Oct", AWS: 650, Azure: 600, GCP: 520, OpenAI: 460 },
  { month: "Nov", AWS: 680, Azure: 630, GCP: 550, OpenAI: 500 },
  { month: "Déc", AWS: 720, Azure: 670, GCP: 580, OpenAI: 540 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CostEvolutionChart() {
  const currentMonth = costData[costData.length - 1];
  const previousMonth = costData[costData.length - 2];
  
  const totalCurrent = currentMonth.AWS + currentMonth.Azure + currentMonth.GCP + currentMonth.OpenAI;
  const totalPrevious = previousMonth.AWS + previousMonth.Azure + previousMonth.GCP + previousMonth.OpenAI;
  const percentageChange = ((totalCurrent - totalPrevious) / totalPrevious) * 100;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Évolution des Coûts</CardTitle>
          <p className="text-sm text-muted-foreground">Coûts mensuels par fournisseur cloud</p>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <Badge variant={percentageChange > 0 ? "destructive" : "default"}>
            {formatChangePercentage(percentageChange)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Métriques rapides */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-muted-foreground">Total ce mois:</span>
              <span className="font-semibold">{formatCurrency(totalCurrent)}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-muted-foreground">Moyenne/mois:</span>
              <span className="font-semibold">{formatCurrency(Math.round(totalCurrent / 12))}</span>
            </div>
          </div>

          {/* Graphique */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="AWS" fill="#FF9900" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Azure" fill="#0078D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="GCP" fill="#4285F4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="OpenAI" fill="#10A37F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Légende des fournisseurs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-[#FF9900]"></div>
              <span>AWS</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-[#0078D4]"></div>
              <span>Azure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-[#4285F4]"></div>
              <span>GCP</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-[#10A37F]"></div>
              <span>OpenAI</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
