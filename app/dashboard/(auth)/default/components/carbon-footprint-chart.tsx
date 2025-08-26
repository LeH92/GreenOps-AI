"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Leaf, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Données fictives pour l'empreinte carbone
const carbonData = [
  { month: "Jan", carbon: 2.4, renewable: 65, efficiency: 78 },
  { month: "Fév", carbon: 2.6, renewable: 68, efficiency: 80 },
  { month: "Mar", carbon: 2.8, renewable: 72, efficiency: 82 },
  { month: "Avr", carbon: 3.1, renewable: 70, efficiency: 79 },
  { month: "Mai", carbon: 2.9, renewable: 75, efficiency: 83 },
  { month: "Juin", carbon: 3.2, renewable: 73, efficiency: 81 },
  { month: "Juil", carbon: 3.4, renewable: 71, efficiency: 80 },
  { month: "Août", carbon: 3.6, renewable: 69, efficiency: 78 },
  { month: "Sep", carbon: 3.3, renewable: 74, efficiency: 82 },
  { month: "Oct", carbon: 3.0, renewable: 77, efficiency: 85 },
  { month: "Nov", carbon: 2.7, renewable: 80, efficiency: 87 },
  { month: "Déc", carbon: 2.5, renewable: 82, efficiency: 89 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name === 'carbon' ? 'Empreinte carbone' : 
             entry.name === 'renewable' ? 'Énergie renouvelable' : 'Efficacité'}: {entry.value}
            {entry.name === 'carbon' ? ' tCO2e' : '%'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CarbonFootprintChart() {
  const currentMonth = carbonData[carbonData.length - 1];
  const previousMonth = carbonData[carbonData.length - 2];
  
  const carbonChange = ((currentMonth.carbon - previousMonth.carbon) / previousMonth.carbon) * 100;
  const renewableChange = ((currentMonth.renewable - previousMonth.renewable) / previousMonth.renewable) * 100;
  const efficiencyChange = ((currentMonth.efficiency - previousMonth.efficiency) / previousMonth.efficiency) * 100;

  const totalCarbon = carbonData.reduce((sum, item) => sum + item.carbon, 0);
  const averageCarbon = totalCarbon / carbonData.length;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Empreinte Carbone</CardTitle>
          <p className="text-sm text-muted-foreground">Émissions CO2 et efficacité énergétique</p>
        </div>
        <div className="flex items-center space-x-2">
          <Leaf className="h-4 w-4 text-green-600" />
          <Badge variant={carbonChange < 0 ? "default" : "destructive"}>
            {carbonChange > 0 ? "+" : ""}{carbonChange.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Métriques rapides */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">{currentMonth.carbon.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">tCO2e/mois</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">{currentMonth.renewable}%</div>
              <div className="text-xs text-muted-foreground">Renouvelable</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="text-lg font-bold text-purple-600">{currentMonth.efficiency}%</div>
              <div className="text-xs text-muted-foreground">Efficacité</div>
            </div>
          </div>

          {/* Graphique principal - Empreinte carbone */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={carbonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  tickFormatter={(value) => `${value}t`}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="carbon" 
                  stroke="#10B981" 
                  fill="url(#carbonGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Indicateurs de performance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Objectif carbone mensuel</span>
              <span className="text-sm font-medium">2.0 tCO2e</span>
            </div>
            <Progress 
              value={(currentMonth.carbon / 2.0) * 100} 
              className="h-2"
              color={currentMonth.carbon > 2.0 ? "bg-red-500" : "bg-green-500"}
            />
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span>Émissions réduites de 15% vs 2023</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-3 w-3 text-yellow-600" />
                <span>Économies: 2.3 tCO2e/an</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
