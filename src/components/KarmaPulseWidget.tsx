import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import GlassCard from './GlassCard';

interface Metric {
  id: string;
  name: string;
  value: number;
  prevValue: number;
  color: string;
  unit: string;
  icon: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  reputationImpact: number;
  metricTriggered: string;
}

const INITIAL_METRICS: Metric[] = [
  { id: 'conviction', name: 'Conviction holding', value: 87, prevValue: 87, color: '#fbbf24', unit: '%', icon: '🔥' },
  { id: 'liquidity', name: 'Liquidity Depth Ratio', value: 74, prevValue: 74, color: '#14F195', unit: 'x', icon: '⚔️' },
  { id: 'sybil', name: 'Sybil Resistance Score', value: 92, prevValue: 92, color: '#a78bfa', unit: '/100', icon: '🛡️' },
  { id: 'lending', name: 'Borrow Conviction Velocity', value: 68, prevValue: 68, color: '#38bdf8', unit: 'm/s', icon: '⚡' },
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: '1', timestamp: '12:44:02', message: 'Address 0x8a...e4f locked 10 ETH on debt booster', reputationImpact: 12, metricTriggered: 'conviction' },
  { id: '2', timestamp: '12:43:55', message: 'Sovereign ID validated by multi-sig oracle', reputationImpact: 15, metricTriggered: 'sybil' },
  { id: '3', timestamp: '12:43:12', message: 'Reputation rating synced with Lens namespace protocol', reputationImpact: 8, metricTriggered: 'sybil' },
  { id: '4', timestamp: '12:42:30', message: 'First-time lender consolidated custom debt ceiling', reputationImpact: 10, metricTriggered: 'lending' },
];

const SAMPLE_LOG_TEMPLATES = [
  { message: 'Holder signature verified for long-term vault custody', impact: 14, metric: 'conviction' },
  { message: 'Matched 3 debt proposals inside Wallet Arena successfully', impact: 18, metric: 'liquidity' },
  { message: 'Periodic validator audit returned clean zero-knowledge score', impact: 20, metric: 'sybil' },
  { message: 'Reputation multiplier raised after 14-day hold streak check', impact: 16, metric: 'conviction' },
  { message: 'Fast repayment recorded on Tier-A collateral proxy routing', impact: 22, metric: 'lending' },
  { message: 'Verified transaction signatures passed consensus health check', impact: 9, metric: 'sybil' },
];

export default function KarmaPulseWidget() {
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [selectedMetricId, setSelectedMetricId] = useState<string>('conviction');
  const [vizType, setVizType] = useState<'bars' | 'wave' | 'nodes'>('bars');
  const [isLive, setIsLive] = useState<boolean>(true);
  const [lastBeat, setLastBeat] = useState<string>('Just now');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // function to trigger a single simulated on-chain pulse event
  const triggerPulse = () => {
    // 1. Pick a metric to update
    const randomMetricSeq = Math.floor(Math.random() * INITIAL_METRICS.length);
    const metricToUpdate = INITIAL_METRICS[randomMetricSeq];

    // 2. Compute randomized delta (-5 to +10 change)
    const delta = Math.floor(Math.random() * 15) - 4;
    
    setMetrics(prev => prev.map(m => {
      if (m.id === metricToUpdate.id) {
        const newValue = Math.max(25, Math.min(100, m.value + delta));
        return { ...m, prevValue: m.value, value: newValue };
      }
      return m;
    }));

    // 3. Prep dynamic transaction logs list
    const template = SAMPLE_LOG_TEMPLATES[Math.floor(Math.random() * SAMPLE_LOG_TEMPLATES.length)];
    const hexChars = '0123456789abcdef';
    let randHex = '';
    for (let j = 0; j < 4; j++) randHex += hexChars[Math.floor(Math.random() * 16)];
    
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newLog: ActivityLog = {
      id: Date.now().toString(),
      timestamp: timeStr,
      message: template.message.replace('Address', `Address 0x${randHex}...f3b`),
      reputationImpact: template.impact,
      metricTriggered: template.metric,
    };

    setLogs(prev => [newLog, ...prev.slice(0, 4)]);
    setLastBeat(timeStr);
  };

  // Setup periodic live update cycle
  useEffect(() => {
    if (isLive) {
      pulseIntervalRef.current = setInterval(() => {
        triggerPulse();
      }, 3400);
    } else {
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
      }
    }

    return () => {
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
      }
    };
  }, [isLive]);

  // D3 Rendering Logic inside hook
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 360;
    const height = 180;
    const margin = { top: 25, right: 25, bottom: 30, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%');

    // Create a container group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add glowing shadow filter
    const defs = svg.append('defs');
    
    // Gradients for each metric
    metrics.forEach(m => {
      const grad = defs.append('linearGradient')
        .attr('id', `grad-${m.id}`)
        .attr('x1', '0%').attr('y1', '100%')
        .attr('x2', '0%').attr('y2', '0%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', m.color).attr('stop-opacity', 0.05);
      grad.append('stop').attr('offset', '100%').attr('stop-color', m.color).attr('stop-opacity', 0.85);

      const filter = defs.append('filter')
        .attr('id', `glow-${m.id}`)
        .attr('x', '-20%').attr('y', '-20%')
        .attr('width', '140%').attr('height', '140%');
      filter.append('feGaussianBlur')
        .attr('stdDeviation', '4')
        .attr('result', 'blur');
      filter.append('feComposite')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'blur')
        .attr('operator', 'over');
    });

    if (vizType === 'bars') {
      // RENDERING TYPE A: Dynamic Multi-Indicator Pillar Chart with D3 Scales and Axes
      const xScale = d3.scaleBand()
        .domain(metrics.map(d => d.name.split(' ')[0]))
        .range([0, innerWidth])
        .padding(0.35);

      const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([innerHeight, 0]);

      // Gridlines
      g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.04)
        .attr('stroke', '#ffffff')
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
        );

      // X-Axis
      g.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale).tickSize(3))
        .attr('color', 'rgba(255,255,255,0.15)')
        .selectAll('text')
        .style('fill', '#94a3b8')
        .style('font-size', '8px')
        .style('font-family', 'monospace')
        .style('text-transform', 'uppercase');

      // Y-Axis
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(4).tickFormat(d => `${d}`))
        .attr('color', 'rgba(255,255,255,0.15)')
        .selectAll('text')
        .style('fill', '#64748b')
        .style('font-size', '8px')
        .style('font-family', 'monospace');

      // Draw the bars
      const bars = g.selectAll<any, Metric>('.pulse-bar-group')
        .data(metrics)
        .enter()
        .append('g')
        .attr('class', 'pulse-bar-group')
        .style('cursor', 'pointer')
        .on('click', (event, d: Metric) => {
          setSelectedMetricId(d.id);
        });

      // Background tracking pills
      bars.append('rect')
        .attr('x', (d: Metric) => xScale(d.name.split(' ')[0]) || 0)
        .attr('y', 0)
        .attr('width', xScale.bandwidth())
        .attr('height', innerHeight)
        .attr('rx', 5)
        .attr('fill', 'rgba(255, 255, 255, 0.02)')
        .attr('stroke', 'rgba(255, 255, 255, 0.03)')
        .attr('stroke-width', 1);

      // Main active foreground bar with dynamic transition
      bars.append('rect')
        .attr('x', (d: Metric) => xScale(d.name.split(' ')[0]) || 0)
        .attr('width', xScale.bandwidth())
        .attr('rx', 5)
        .attr('fill', (d: Metric) => `url(#grad-${d.id})`)
        .attr('stroke', (d: Metric) => d.color)
        .attr('stroke-width', (d: Metric) => selectedMetricId === d.id ? 1.5 : 0.5)
        .style('filter', (d: Metric) => selectedMetricId === d.id ? `url(#glow-${d.id})` : 'none')
        .attr('y', (d: Metric) => yScale(d.prevValue))
        .attr('height', (d: Metric) => innerHeight - yScale(d.prevValue))
        // Transition height to current value
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('y', (d: Metric) => yScale(d.value))
        .attr('height', (d: Metric) => innerHeight - yScale(d.value));

      // Animated overlay dots at top of bars
      bars.append('circle')
        .attr('cx', (d: Metric) => (xScale(d.name.split(' ')[0]) || 0) + xScale.bandwidth() / 2)
        .attr('r', (d: Metric) => selectedMetricId === d.id ? 4 : 2.5)
        .attr('fill', '#ffffff')
        .attr('stroke', (d: Metric) => d.color)
        .attr('stroke-width', 1.5)
        .attr('cy', (d: Metric) => yScale(d.prevValue))
        .transition()
        .duration(850)
        .ease(d3.easeCubicOut)
        .attr('cy', (d: Metric) => yScale(d.value));

    } else if (vizType === 'wave') {
      // RENDERING TYPE B: Dynamic Sine Wave Frequency Pulse
      const activeMetric = metrics.find(m => m.id === selectedMetricId) || metrics[0];
      
      const xScale = d3.scaleLinear()
        .domain([0, 20])
        .range([0, innerWidth]);

      const yScale = d3.scaleLinear()
        .domain([-1.5, 1.5])
        .range([innerHeight, 0]);

      // Calculate path coordinates for reactive wave
      const wavePoints = d3.range(0, 21).map(x => {
        const valueRatio = activeMetric.value / 100; // 0.25 to 1
        // Wavelength changes based on value; amplitude changes dynamically
        const angle = (x / 20) * Math.PI * 4.5;
        const amplitude = Math.sin(angle) * (1.2 * valueRatio);
        return { x: xScale(x), y: yScale(amplitude) };
      });

      const lineGen = d3.line<{x: number, y: number}>()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveMonotoneX);

      // Area fill underneath wave
      const areaGen = d3.area<{x: number, y: number}>()
        .x(d => d.x)
        .y0(innerHeight)
        .y1(d => d.y)
        .curve(d3.curveMonotoneX);

      // Draw horizontal baseline
      g.append('line')
        .attr('x1', 0)
        .attr('y1', innerHeight / 2)
        .attr('x2', innerWidth)
        .attr('y2', innerHeight / 2)
        .attr('stroke', 'rgba(255, 255, 255, 0.05)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3');

      // Gradient area fill
      const waveArea = g.append('path')
        .datum(wavePoints)
        .attr('d', areaGen)
        .attr('fill', `url(#grad-${activeMetric.id})`)
        .attr('opacity', 0.26);

      // Wave outline
      const waveLine = g.append('path')
        .datum(wavePoints)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', activeMetric.color)
        .attr('stroke-width', 2)
        .style('filter', `url(#glow-${activeMetric.id})`);

      // Draw node particles traveling on the wave path
      const travelNodes = [0.25, 0.5, 0.75];
      travelNodes.forEach((tRatio) => {
        const pointIdx = Math.round(tRatio * 20);
        const pt = wavePoints[pointIdx];

        if (pt) {
          const c = g.append('circle')
            .attr('cx', pt.x)
            .attr('cy', pt.y)
            .attr('r', 4.5)
            .attr('fill', '#ffffff')
            .attr('stroke', activeMetric.color)
            .attr('stroke-width', 1.5)
            .attr('cursor', 'pointer');
          
          c.append('title').text(`Resonance Node: ${activeMetric.value}%`);
        }
      });

    } else {
      // RENDERING TYPE C: Distributed Gravity Orbit Nodes
      // Generate radial node representation with specific weights
      const itemsCount = metrics.length;
      const center = { x: innerWidth / 2, y: innerHeight / 2 };
      
      const maxRadius = Math.min(innerWidth, innerHeight) / 2 - 10;
      
      // Horizontal orbit track
      g.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', maxRadius)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.03)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4, 4');

      // Draw planetary style nodes
      metrics.forEach((m, idx) => {
        const angle = (idx / itemsCount) * Math.PI * 2;
        const orbitRadius = maxRadius * (m.value / 100);
        const nodeX = center.x + Math.cos(angle) * orbitRadius;
        const nodeY = center.y + Math.sin(angle) * orbitRadius;

        const isSel = m.id === selectedMetricId;

        // Draw node line to center gravity point
        g.append('line')
          .attr('x1', center.x)
          .attr('y1', center.y)
          .attr('x2', nodeX)
          .attr('y2', nodeY)
          .attr('stroke', isSel ? m.color : 'rgba(255,255,255,0.06)')
          .attr('stroke-width', isSel ? 1.5 : 0.75)
          .attr('stroke-dasharray', isSel ? 'none' : '2, 2');

        const bgBubble = g.append('circle')
          .attr('cx', nodeX)
          .attr('cy', nodeY)
          .attr('r', isSel ? 20 : 12)
          .attr('fill', m.color)
          .attr('opacity', isSel ? 0.08 : 0.03)
          .style('cursor', 'pointer')
          .on('click', () => setSelectedMetricId(m.id));

        const coreDot = g.append('circle')
          .attr('cx', nodeX)
          .attr('cy', nodeY)
          .attr('r', isSel ? 6 : 4.5)
          .attr('fill', '#ffffff')
          .attr('stroke', m.color)
          .attr('stroke-width', 2)
          .style('filter', isSel ? `url(#glow-${m.id})` : 'none')
          .style('cursor', 'pointer')
          .on('click', () => setSelectedMetricId(m.id));
        
        // Add name text inside visualization bounds
        g.append('text')
          .attr('x', nodeX)
          .attr('y', nodeY - (isSel ? 10 : 8))
          .attr('text-anchor', 'middle')
          .attr('fill', isSel ? '#f8fafc' : '#64748b')
          .style('font-size', '7px')
          .style('font-family', 'monospace')
          .style('background', '#030308')
          .text(m.name.split(' ')[0].toUpperCase());
      });

      // Central Hub core
      g.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', 7)
        .attr('fill', '#05050e')
        .attr('stroke', 'rgba(255,255,255,0.25)')
        .attr('stroke-width', 1.5);
    }

  }, [metrics, selectedMetricId, vizType]);

  const activeMetric = metrics.find(m => m.id === selectedMetricId) || metrics[0];

  return (
    <GlassCard className="p-6 md:p-8" id="karma-pulse-parent">
      
      {/* Structural Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full inline-block animate-pulse bg-[#14F195] shadow-[0_0_8px_rgba(20,241,149,0.7)]" />
            <span className="text-[9px] font-mono tracking-widest text-[#14F195] uppercase font-bold">Real-Time Core Analytics</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#f1f5f9] select-none" style={{ fontFamily: "'Syne', sans-serif" }}>
            Karma Pulse
          </h3>
          <p className="text-slate-400 text-xs max-w-xl">
            Live Web3 ledger memory pool auditing tool. Visualizes dynamic network consensus logs using responsive D3 vector paths.
          </p>
        </div>

        {/* Live / Controls toggle states */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border font-bold cursor-pointer transition-all uppercase tracking-wider flex-1 sm:flex-initial text-center ${
              isLive 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-white/[0.02] border-white/[0.08] text-slate-500 hover:text-slate-400'
            }`}
          >
            {isLive ? '● Live Feed synced' : '○ Feed Frozen'}
          </button>
          
          <button
            onClick={triggerPulse}
            disabled={!isLive}
            className={`p-1.5 px-3 rounded-xl text-[10px] uppercase font-mono font-bold font-sans flex items-center justify-center gap-1 cursor-pointer transition-all ${
              isLive 
                ? 'bg-[#a78bfa]/10 border border-[#a78bfa]/35 hover:bg-[#a78bfa]/20 text-[#c084fc]' 
                : 'bg-white/[0.01] border border-white/[0.04] text-slate-600 cursor-not-allowed'
            }`}
            title="Inject simulated Web3 activity signature immediately"
          >
            ⚡ Manual Pulse
          </button>
        </div>
      </div>

      {/* Grid: Left D3 Visualization View / Right Dynamic Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Metric Pulse SVG Area */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          
          {/* Header Metric quick stats */}
          <div className="flex justify-between items-end p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] mb-4 select-none">
            <div className="flex items-center gap-3">
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{activeMetric.icon}</span>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">{activeMetric.name}</span>
                <span className="text-xl font-extrabold text-white leading-none font-mono tracking-tight">
                  {activeMetric.value}
                  <span className="text-sm font-normal text-slate-400 ml-1">{activeMetric.unit}</span>
                </span>
              </div>
            </div>

            <div className="text-right font-mono text-[9px] text-slate-500 space-y-0.5">
              <div className="flex items-center gap-1.5 justify-end">
                <span>RESONANCE VALUE:</span>
                <span className="font-bold text-slate-300">{(activeMetric.value * 1.48).toFixed(1)}Hz</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <span>COMPLEXITY RATIO:</span>
                <span className="text-emerald-400 font-bold">OPTIMIZED</span>
              </div>
            </div>
          </div>

          <div className="relative bg-[#020206]/85 rounded-2xl p-4 border border-white/[0.05] h-[220px] flex items-center justify-center overflow-hidden">
            <div className="absolute top-3 left-3 flex gap-1.5 z-10 bg-[#030308]/90 p-1 rounded-xl border border-white/[0.04]">
              {(['bars', 'wave', 'nodes'] as const).map((vt) => (
                <button
                  key={vt}
                  onClick={() => setVizType(vt)}
                  className="px-2.5 py-1 text-[8.5px] font-bold cursor-pointer rounded-lg transition-all border-none font-mono uppercase text-center select-none"
                  style={{
                    background: vizType === vt ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: vizType === vt ? '#f8fafc' : 'rgba(241, 245, 249, 0.4)'
                  }}
                >
                  {vt}
                </button>
              ))}
            </div>

            {/* D3 Target SVG Element */}
            <svg 
              ref={svgRef} 
              className="w-full h-full object-contain"
              style={{ minHeight: '180px' }}
            />
            
            {/* Subtle background reference label */}
            <span className="absolute bottom-3 right-4 text-[7.5px] font-mono text-slate-600 uppercase select-none tracking-widest font-bold">
              d3_reputation_matrix_mapping_active
            </span>
          </div>

          {/* Interactive tabs footer */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetricId(m.id)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                  selectedMetricId === m.id 
                    ? 'bg-slate-900/40 border-slate-500/20 shadow-lg' 
                    : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 justify-between">
                  <span className="text-xs">{m.icon}</span>
                  <span 
                    className="text-[7px] font-mono font-bold uppercase py-0.5 px-1 rounded-md"
                    style={{ backgroundColor: `${m.color}15`, color: m.color }}
                  >
                    {m.id === selectedMetricId ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>
                <span className="text-[8px] font-bold font-mono text-slate-500 block uppercase truncate">
                  {m.name.split(' ')[0]}
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-200 mt-1 block">
                  {m.value}{m.unit}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Dynamic Activity Log / Ledger Stream */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-[#030308]/60 rounded-2xl border border-white/[0.05] p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 select-none">
                <span className="text-[10px] font-mono tracking-widest text-[#a78bfa] uppercase font-bold">Recent Pulsing Signals</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Beat: {lastBeat}</span>
              </div>

              <div className="space-y-3 max-h-[290px] overflow-y-auto pr-0.5 scrollbar-none">
                {logs.map((log) => {
                  const m = metrics.find(metric => metric.id === log.metricTriggered) || metrics[0];
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-3 bg-slate-950/80 rounded-xl border border-white/[0.04] flex items-center justify-between gap-3 text-left hover:border-white/[0.08] transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg bg-white/[0.02] border border-white/[0.04] w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                          {m.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10.5px] text-slate-350 leading-snug truncate whitespace-nowrap overflow-hidden">
                            {log.message}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[8.5px] font-mono text-slate-500 uppercase">
                            <span className="text-slate-400 font-bold">{log.timestamp}</span>
                            <span>•</span>
                            <span style={{ color: m.color }}>{m.name.split(' ')[0]} Impact</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-emerald-400 font-bold text-xs font-mono tracking-tight block">
                          +{log.reputationImpact}
                        </span>
                        <span className="text-[7.5px] font-mono text-slate-500 uppercase block font-semibold leading-none mt-0.5">
                          REPUTATION
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-[9.5px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] block animate-ping" />
                D3 ENGINE V6
              </span>
              <span>MEMORY CAPACITY SYNCED</span>
            </div>
          </div>
        </div>

      </div>

    </GlassCard>
  );
}
