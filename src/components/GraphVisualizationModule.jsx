// ================================================================
// MODULE 6: Graph & Visualization Module
//
// All chart components used on the Results / Output page.
// Each chart is exported individually and also composed into
// a single GraphVisualizationModule default export.
//
// Charts:
//   PerformanceBarChart   — PB vs Optimistic vs Predicted vs Pessimistic
//   TimeProgressionChart  — PB → Current → Goal line chart
//   PerformanceRadarChart — 5-factor radar (Fitness, VO2, Track, Weather, Experience)
//   FactorImpactGrid      — 8 factor % deviation grid
// ================================================================

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const CHART_STYLE  = { borderRadius: "8px", backgroundColor: "#050505", border: "1px solid rgba(177,145,73,0.2)", color: "#f8d06b" };
const AXIS_TICK    = { fontSize: 11, fill: "#f8d06b" };
const GRID_STROKE  = "rgba(177,145,73,0.18)";
const LINE_COLOUR  = "#f8d06b";
const Y_AXIS_DOMAIN = ["dataMin - 0.2", "dataMax + 0.1"];

// ── Performance Comparison Bar Chart ─────────────────────────────
export const PerformanceBarChart = ({ data }) => (
  <div className="bg-[#090909] border border-[#b19149]/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6">
    <h3 className="text-lg font-bold mb-1 text-[#f8d06b]">Performance Comparison</h3>
    <p className="text-xs text-[#a78b3c] mb-4">
      Y-axis uses a dynamic scale (dataMin − 0.2s to dataMax + 0.1s) to highlight small differences between sprint times.
    </p>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
        <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false}/>
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={Y_AXIS_DOMAIN}/>
        <Tooltip contentStyle={CHART_STYLE} formatter={(v) => [`${v}s`, "Time"]}/>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f8d06b" stopOpacity={0.95}/>
            <stop offset="95%" stopColor="#b19149" stopOpacity={0.95}/>
          </linearGradient>
        </defs>
        <Bar dataKey="time" fill="url(#barGrad)" radius={[8, 8, 0, 0]}/>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// ── Time Progression Line Chart ───────────────────────────────────
export const TimeProgressionChart = ({ data }) => (
  <div className="bg-[#090909] border border-[#b19149]/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6">
    <h3 className="text-lg font-bold mb-1 text-[#f8d06b]">Time Progression</h3>
    <p className="text-xs text-[#a78b3c] mb-4">
      Shows PB → Predicted → Goal trajectory. Goal is set at PB − 0.1s.
    </p>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
        <XAxis dataKey="condition" tick={AXIS_TICK}/>
        <YAxis tick={AXIS_TICK} domain={Y_AXIS_DOMAIN}/>
        <Tooltip contentStyle={CHART_STYLE} formatter={(v) => [`${v}s`, "Time"]}/>
        <Line type="monotone" dataKey="time" stroke={LINE_COLOUR} strokeWidth={4} dot={{ r: 6, fill: LINE_COLOUR }}/>
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ── Performance Radar Chart ───────────────────────────────────────
export const PerformanceRadarChart = ({ data }) => (
  <div className="bg-[#090909] border border-[#b19149]/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6">
    <h3 className="text-lg font-bold mb-1 text-[#f8d06b]">Performance Radar</h3>
    <p className="text-xs text-[#a78b3c] mb-4">
      Visualises 5 performance dimensions on a 0–100 scale.
    </p>
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke={GRID_STROKE}/>
        <PolarAngleAxis dataKey="factor" tick={{ fontSize: 12, fill: "#f8d06b" }}/>
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#a78b3c" }}/>
        <Radar name="Performance" dataKey="value" stroke={LINE_COLOUR} fill={LINE_COLOUR} fillOpacity={0.6}/>
        <Tooltip contentStyle={CHART_STYLE}/>
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

// ── Factor Impact Grid ────────────────────────────────────────────
export const FactorImpactGrid = ({ factors }) => (
  <div className="bg-[#090909] border border-[#b19149]/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6">
    <h3 className="text-lg font-bold mb-2 text-[#f8d06b]">Factor Impact</h3>
    <p className="text-xs text-[#a78b3c] mb-4">
      Percentage deviation of each factor from its neutral baseline.
      Positive = adds time (slower). Negative = reduces time (faster).
    </p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(factors).map(([key, value]) => (
        <div key={key} className="p-4 bg-[#080808] rounded-lg border-2 border-[#b19149]/15">
          <div className="text-xs text-[#a78b3c] uppercase font-semibold mb-1">{key.replace(/([A-Z])/g, " $1").trim()}</div>
          <div className={`text-2xl font-bold ${parseFloat(value)>0?"text-[#f47315]":parseFloat(value)<0?"text-[#4ade80]":"text-[#a78b3c]"}`}>
            {parseFloat(value)>0?"+":""}{value}%
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Composite export: all charts together ─────────────────────────
const GraphVisualizationModule = ({ simulationResults }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PerformanceBarChart  data={simulationResults.chartData}/>
      <TimeProgressionChart data={simulationResults.lineData}/>
    </div>
    <PerformanceRadarChart data={simulationResults.radarData}/>
    <FactorImpactGrid      factors={simulationResults.factors}/>
  </div>
);

export default GraphVisualizationModule;