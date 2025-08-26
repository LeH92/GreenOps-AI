"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ColorDemo() {
  const colors = [
    { name: "Primary", hex: "#10B981", description: "Modern green - Main brand color" },
    { name: "Secondary", hex: "#34D399", description: "Light green - Secondary elements" },
    { name: "Accent", hex: "#3B82F6", description: "Tech blue - Call-to-action elements" },
    { name: "Warning", hex: "#F59E0B", description: "Amber - Warning states" },
    { name: "Error", hex: "#EF4444", description: "Red - Error states" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>GreenOps AI Color Palette</CardTitle>
        <CardDescription>Our eco-tech focused color scheme</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {colors.map((color) => (
          <div key={color.name} className="flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded-lg border shadow-sm"
              style={{ backgroundColor: color.hex }}
            />
            <div>
              <h4 className="font-semibold">{color.name}</h4>
              <p className="text-sm text-muted-foreground">{color.hex}</p>
              <p className="text-xs text-muted-foreground">{color.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
