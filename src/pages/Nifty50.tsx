import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Sparkline } from '../components/Sparkline';

interface NiftyStock {
  rank: number;
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  weight: number;
  marketCap: number;
  price: number;
  change: number;
  changePercent: number;
  pe: number;
  divYield: number;
  high52: number;
  low52: number;
  avgVolume: number;
}

// Generate mock intraday price history for sparklines (30 data points = ~6.5 hours of trading)
function generateSparkline(basePrice: number, changePercent: number): number[] {
  const points = 30;
  const trend = changePercent / 100;
  const volatility = basePrice * 0.008; // 0.8% intraday volatility
  const data: number[] = [];
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const trendComponent = basePrice * trend * progress;
    const noise = (Math.random() - 0.5) * volatility * 2;
    data.push(basePrice + trendComponent + noise);
  }
  
  // Ensure last point matches current price
  data[data.length - 1] = basePrice;
  return data;
}

// NIFTY 50 constituents with weights (approximate)
const NIFTY_STOCKS: NiftyStock[] = [
  { rank: 1, symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', industry: 'Oil & Gas', weight: 10.29, marketCap: 1500000, price: 2450.50, change: 12.30, changePercent: 0.50, pe: 22.5, divYield: 0.42, high52: 2600.00, low52: 2100.00, avgVolume: 8500000 },
  { rank: 2, symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Financials', industry: 'Banking', weight: 8.95, marketCap: 900000, price: 1420.75, change: -5.20, changePercent: -0.36, pe: 18.2, divYield: 1.12, high52: 1550.00, low52: 1250.00, avgVolume: 6200000 },
  { rank: 3, symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Financials', industry: 'Banking', weight: 7.68, marketCap: 500000, price: 1020.30, change: 8.50, changePercent: 0.84, pe: 16.8, divYield: 0.85, high52: 1100.00, low52: 850.00, avgVolume: 7800000 },
  { rank: 4, symbol: 'INFY', name: 'Infosys', sector: 'Technology', industry: 'IT Services', weight: 6.42, marketCap: 600000, price: 1450.60, change: -3.40, changePercent: -0.23, pe: 24.1, divYield: 2.10, high52: 1600.00, low52: 1300.00, avgVolume: 5200000 },
  { rank: 5, symbol: 'TCS', name: 'Tata Consultancy', sector: 'Technology', industry: 'IT Services', weight: 5.87, marketCap: 1200000, price: 3250.25, change: 15.80, changePercent: 0.49, pe: 26.3, divYield: 1.45, high52: 3500.00, low52: 2800.00, avgVolume: 3200000 },
  { rank: 6, symbol: 'ITC', name: 'ITC Limited', sector: 'Consumer', industry: 'FMCG', weight: 4.52, marketCap: 450000, price: 360.40, change: 2.10, changePercent: 0.59, pe: 24.8, divYield: 3.20, high52: 400.00, low52: 300.00, avgVolume: 9500000 },
  { rank: 7, symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'Consumer', industry: 'FMCG', weight: 3.98, marketCap: 550000, price: 2340.80, change: -12.50, changePercent: -0.53, pe: 52.1, divYield: 1.65, high52: 2500.00, low52: 2000.00, avgVolume: 1800000 },
  { rank: 8, symbol: 'SBIN', name: 'State Bank of India', sector: 'Financials', industry: 'Banking', weight: 3.45, marketCap: 400000, price: 450.20, change: 5.30, changePercent: 1.19, pe: 8.5, divYield: 2.80, high52: 500.00, low52: 380.00, avgVolume: 15000000 },
  { rank: 9, symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Communication', industry: 'Telecom', weight: 3.12, marketCap: 450000, price: 850.60, change: -2.80, changePercent: -0.33, pe: 28.5, divYield: 0.55, high52: 900.00, low52: 700.00, avgVolume: 4500000 },
  { rank: 10, symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Financials', industry: 'Banking', weight: 2.98, marketCap: 350000, price: 1780.40, change: 9.20, changePercent: 0.52, pe: 20.1, divYield: 0.12, high52: 1900.00, low52: 1500.00, avgVolume: 2800000 },
  { rank: 11, symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Financials', industry: 'NBFC', weight: 2.85, marketCap: 210000, price: 3450.60, change: -25.40, changePercent: -0.73, pe: 28.9, divYield: 0.45, high52: 3800.00, low52: 2800.00, avgVolume: 1200000 },
  { rank: 12, symbol: 'LICI', name: 'LIC India', sector: 'Financials', industry: 'Insurance', weight: 2.65, marketCap: 380000, price: 650.30, change: 3.50, changePercent: 0.54, pe: 14.2, divYield: 2.10, high52: 720.00, low52: 550.00, avgVolume: 3800000 },
  { rank: 13, symbol: 'LT', name: 'Larsen & Toubro', sector: 'Industrials', industry: 'Construction', weight: 2.48, marketCap: 300000, price: 2150.80, change: 18.90, changePercent: 0.89, pe: 25.6, divYield: 1.15, high52: 2300.00, low52: 1800.00, avgVolume: 2100000 },
  { rank: 14, symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'Technology', industry: 'IT Services', weight: 2.32, marketCap: 200000, price: 1380.40, change: -8.60, changePercent: -0.62, pe: 21.8, divYield: 3.80, high52: 1500.00, low52: 1100.00, avgVolume: 2800000 },
  { rank: 15, symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Financials', industry: 'Banking', weight: 2.15, marketCap: 240000, price: 780.50, change: 6.20, changePercent: 0.80, pe: 12.5, divYield: 0.65, high52: 850.00, low52: 650.00, avgVolume: 6800000 },
  { rank: 16, symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Consumer', industry: 'Automobiles', weight: 2.08, marketCap: 250000, price: 8250.60, change: 45.30, changePercent: 0.55, pe: 22.8, divYield: 1.25, high52: 9000.00, low52: 7000.00, avgVolume: 850000 },
  { rank: 17, symbol: 'SUNPHARMA', name: 'Sun Pharma', sector: 'Healthcare', industry: 'Pharmaceuticals', weight: 1.95, marketCap: 230000, price: 960.40, change: -4.20, changePercent: -0.44, pe: 28.5, divYield: 0.95, high52: 1050.00, low52: 800.00, avgVolume: 2200000 },
  { rank: 18, symbol: 'TITAN', name: 'Titan Company', sector: 'Consumer', industry: 'Jewelry', weight: 1.88, marketCap: 220000, price: 2480.30, change: 12.80, changePercent: 0.52, pe: 65.2, divYield: 0.35, high52: 2800.00, low52: 2000.00, avgVolume: 950000 },
  { rank: 19, symbol: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'Materials', industry: 'Cement', weight: 1.75, marketCap: 180000, price: 6250.80, change: 35.60, changePercent: 0.57, pe: 32.5, divYield: 0.65, high52: 6800.00, low52: 5200.00, avgVolume: 450000 },
  { rank: 20, symbol: 'ADANIENT', name: 'Adani Enterprises', sector: 'Conglomerate', industry: 'Diversified', weight: 1.68, marketCap: 120000, price: 2150.40, change: 18.50, changePercent: 0.87, pe: 85.6, divYield: 0.05, high52: 2800.00, low52: 1500.00, avgVolume: 2800000 },
  { rank: 21, symbol: 'WIPRO', name: 'Wipro', sector: 'Technology', industry: 'IT Services', weight: 1.52, marketCap: 190000, price: 350.60, change: -1.80, changePercent: -0.51, pe: 15.8, divYield: 3.20, high52: 420.00, low52: 300.00, avgVolume: 5200000 },
  { rank: 22, symbol: 'NESTLEIND', name: 'Nestle India', sector: 'Consumer', industry: 'FMCG', weight: 1.45, marketCap: 150000, price: 1560.80, change: 8.40, changePercent: 0.54, pe: 72.5, divYield: 1.80, high52: 1700.00, low52: 1300.00, avgVolume: 650000 },
  { rank: 23, symbol: 'POWERGRID', name: 'Power Grid Corp', sector: 'Utilities', industry: 'Power', weight: 1.38, marketCap: 140000, price: 245.60, change: 1.20, changePercent: 0.49, pe: 10.2, divYield: 5.80, high52: 270.00, low52: 200.00, avgVolume: 8500000 },
  { rank: 24, symbol: 'NTPC', name: 'NTPC', sector: 'Utilities', industry: 'Power', weight: 1.32, marketCap: 135000, price: 138.40, change: 0.80, changePercent: 0.58, pe: 8.5, divYield: 4.20, high52: 155.00, low52: 115.00, avgVolume: 12000000 },
  { rank: 25, symbol: 'JSWSTEEL', name: 'JSW Steel', sector: 'Materials', industry: 'Steel', weight: 1.25, marketCap: 125000, price: 520.30, change: 4.50, changePercent: 0.87, pe: 12.8, divYield: 1.15, high52: 580.00, low52: 420.00, avgVolume: 3800000 },
  { rank: 26, symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Consumer', industry: 'Automobiles', weight: 1.18, marketCap: 160000, price: 1280.60, change: 9.80, changePercent: 0.77, pe: 18.5, divYield: 0.95, high52: 1400.00, low52: 1050.00, avgVolume: 3200000 },
  { rank: 27, symbol: 'GRASIM', name: 'Grasim Industries', sector: 'Materials', industry: 'Cement/Textiles', weight: 1.12, marketCap: 115000, price: 1720.40, change: 7.60, changePercent: 0.44, pe: 15.2, divYield: 0.85, high52: 1850.00, low52: 1500.00, avgVolume: 1200000 },
  { rank: 28, symbol: 'ADANIPORTS', name: 'Adani Ports', sector: 'Industrials', industry: 'Ports', weight: 1.08, marketCap: 170000, price: 780.50, change: 5.20, changePercent: 0.67, pe: 22.5, divYield: 0.85, high52: 850.00, low52: 620.00, avgVolume: 4500000 },
  { rank: 29, symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Consumer', industry: 'Automobiles', weight: 1.02, marketCap: 110000, price: 320.80, change: 3.40, changePercent: 1.07, pe: 8.5, divYield: 0.45, high52: 380.00, low52: 250.00, avgVolume: 25000000 },
  { rank: 30, symbol: 'TECHM', name: 'Tech Mahindra', sector: 'Technology', industry: 'IT Services', weight: 0.98, marketCap: 85000, price: 860.40, change: -5.20, changePercent: -0.60, pe: 18.2, divYield: 3.50, high52: 950.00, low52: 720.00, avgVolume: 2800000 },
  { rank: 31, symbol: 'DRREDDY', name: "Dr Reddy's Labs", sector: 'Healthcare', industry: 'Pharmaceuticals', weight: 0.92, marketCap: 65000, price: 3680.60, change: 22.40, changePercent: 0.61, pe: 18.5, divYield: 0.75, high52: 4100.00, low52: 3200.00, avgVolume: 850000 },
  { rank: 32, symbol: 'BRITANNIA', name: 'Britannia Industries', sector: 'Consumer', industry: 'FMCG', weight: 0.88, marketCap: 50000, price: 4580.80, change: -18.60, changePercent: -0.40, pe: 45.2, divYield: 1.65, high52: 4900.00, low52: 3800.00, avgVolume: 520000 },
  { rank: 33, symbol: 'CIPLA', name: 'Cipla', sector: 'Healthcare', industry: 'Pharmaceuticals', weight: 0.85, marketCap: 60000, price: 740.50, change: 4.20, changePercent: 0.57, pe: 22.1, divYield: 0.95, high52: 820.00, low52: 580.00, avgVolume: 2800000 },
  { rank: 34, symbol: 'EICHERMOT', name: 'Eicher Motors', sector: 'Consumer', industry: 'Automobiles', weight: 0.82, marketCap: 55000, price: 2010.40, change: 12.80, changePercent: 0.64, pe: 28.5, divYield: 1.15, high52: 2200.00, low52: 1650.00, avgVolume: 650000 },
  { rank: 35, symbol: 'SHREECEM', name: 'Shree Cement', sector: 'Materials', industry: 'Cement', weight: 0.78, marketCap: 48000, price: 13200.60, change: 85.40, changePercent: 0.65, pe: 32.8, divYield: 0.45, high52: 14500.00, low52: 10500.00, avgVolume: 120000 },
  { rank: 36, symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', sector: 'Consumer', industry: 'Automobiles', weight: 0.75, marketCap: 45000, price: 2250.80, change: 15.60, changePercent: 0.70, pe: 16.2, divYield: 3.80, high52: 2500.00, low52: 1850.00, avgVolume: 950000 },
  { rank: 37, symbol: 'COALINDIA', name: 'Coal India', sector: 'Energy', industry: 'Mining', weight: 0.72, marketCap: 130000, price: 212.40, change: 1.80, changePercent: 0.85, pe: 5.2, divYield: 10.50, high52: 240.00, low52: 170.00, avgVolume: 15000000 },
  { rank: 38, symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', sector: 'Healthcare', industry: 'Hospitals', weight: 0.68, marketCap: 75000, price: 5200.60, change: 35.80, changePercent: 0.69, pe: 45.2, divYield: 0.35, high52: 5800.00, low52: 4200.00, avgVolume: 450000 },
  { rank: 39, symbol: 'BPCL', name: 'BPCL', sector: 'Energy', industry: 'Oil & Gas', weight: 0.65, marketCap: 35000, price: 285.40, change: 2.10, changePercent: 0.74, pe: 4.8, divYield: 6.80, high52: 320.00, low52: 210.00, avgVolume: 6500000 },
  { rank: 40, symbol: 'INDUSINDBK', name: 'IndusInd Bank', sector: 'Financials', industry: 'Banking', weight: 0.62, marketCap: 80000, price: 1020.80, change: 8.60, changePercent: 0.85, pe: 10.5, divYield: 1.25, high52: 1150.00, low52: 800.00, avgVolume: 3800000 },
  { rank: 41, symbol: 'DIVISLAB', name: 'Divis Labs', sector: 'Healthcare', industry: 'Pharmaceuticals', weight: 0.58, marketCap: 42000, price: 1580.40, change: -8.20, changePercent: -0.52, pe: 35.2, divYield: 1.15, high52: 1800.00, low52: 1200.00, avgVolume: 850000 },
  { rank: 42, symbol: 'HINDALCO', name: 'Hindalco', sector: 'Materials', industry: 'Aluminum', weight: 0.55, marketCap: 30000, price: 450.60, change: 3.80, changePercent: 0.85, pe: 8.2, divYield: 1.45, high52: 520.00, low52: 350.00, avgVolume: 8500000 },
  { rank: 43, symbol: 'ONGC', name: 'ONGC', sector: 'Energy', industry: 'Oil & Gas', weight: 0.52, marketCap: 200000, price: 168.80, change: 1.20, changePercent: 0.72, pe: 5.8, divYield: 7.50, high52: 195.00, low52: 135.00, avgVolume: 12000000 },
  { rank: 44, symbol: 'TATACONSUM', name: 'Tata Consumer', sector: 'Consumer', industry: 'FMCG', weight: 0.48, marketCap: 55000, price: 580.40, change: 3.20, changePercent: 0.55, pe: 52.1, divYield: 1.45, high52: 650.00, low52: 480.00, avgVolume: 1800000 },
  { rank: 45, symbol: 'MCDOWELL-N', name: 'United Spirits', sector: 'Consumer', industry: 'Beverages', weight: 0.45, marketCap: 42000, price: 580.60, change: 4.80, changePercent: 0.83, pe: 38.5, divYield: 0.65, high52: 650.00, low52: 480.00, avgVolume: 1200000 },
  { rank: 46, symbol: 'AMBUJACEM', name: 'Ambuja Cements', sector: 'Materials', industry: 'Cement', weight: 0.42, marketCap: 35000, price: 385.80, change: 2.60, changePercent: 0.68, pe: 22.5, divYield: 1.05, high52: 430.00, low52: 320.00, avgVolume: 3800000 },
  { rank: 47, symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', sector: 'Consumer', industry: 'Automobiles', weight: 0.38, marketCap: 100000, price: 3520.40, change: 18.50, changePercent: 0.53, pe: 18.5, divYield: 3.80, high52: 3900.00, low52: 3000.00, avgVolume: 650000 },
  { rank: 48, symbol: 'UPL', name: 'UPL Limited', sector: 'Materials', industry: 'Chemicals', weight: 0.35, marketCap: 28000, price: 380.60, change: -2.40, changePercent: -0.63, pe: 12.5, divYield: 1.95, high52: 450.00, low52: 300.00, avgVolume: 2800000 },
  { rank: 49, symbol: 'SBILIFE', name: 'SBI Life Insurance', sector: 'Financials', industry: 'Insurance', weight: 0.32, marketCap: 100000, price: 1220.80, change: 6.40, changePercent: 0.53, pe: 48.5, divYield: 0.35, high52: 1350.00, low52: 980.00, avgVolume: 1200000 },
  { rank: 50, symbol: 'HDFCLIFE', name: 'HDFC Life', sector: 'Financials', industry: 'Insurance', weight: 0.28, marketCap: 105000, price: 485.60, change: 2.80, changePercent: 0.58, pe: 52.1, divYield: 0.35, high52: 540.00, low52: 400.00, avgVolume: 2800000 },
];

const SECTOR_COLORS: Record<string, string> = {
  'Energy': '#ef4444',
  'Technology': '#3b82f6',
  'Financials': '#10b981',
  'Consumer': '#f59e0b',
  'Healthcare': '#ec4899',
  'Industrials': '#8b5cf6',
  'Materials': '#6366f1',
  'Communication': '#14b8a6',
  'Utilities': '#f97316',
  'Conglomerate': '#84cc16',
};

export const Nifty50Page: React.FC = () => {
  const [sortBy, setSortBy] = useState<'weight' | 'change' | 'pe'>('weight');

  // Add sparkline data
  const stocksWithSparklines = useMemo(() => {
    return NIFTY_STOCKS.map(s => ({
      ...s,
      sparklineData: generateSparkline(s.price, s.changePercent),
    }));
  }, []);

  const sortedStocks = useMemo(() => {
    const stocks = [...stocksWithSparklines];
    switch (sortBy) {
      case 'weight':
        return stocks.sort((a, b) => b.weight - a.weight);
      case 'change':
        return stocks.sort((a, b) => b.changePercent - a.changePercent);
      case 'pe':
        return stocks.sort((a, b) => a.pe - b.pe);
      default:
        return stocks;
    }
  }, [sortBy]);

  // Sector allocation
  const sectorAllocation = useMemo(() => {
    const allocation: Record<string, number> = {};
    NIFTY_STOCKS.forEach(s => {
      allocation[s.sector] = (allocation[s.sector] || 0) + s.weight;
    });
    return Object.entries(allocation).sort((a, b) => b[1] - a[1]);
  }, []);

  // Top gainers/losers
  const topGainers = useMemo(() => {
    return [...NIFTY_STOCKS].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  }, []);

  const topLosers = useMemo(() => {
    return [...NIFTY_STOCKS].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  }, []);

  // Stats
  const totalMarketCap = NIFTY_STOCKS.reduce((s, stock) => s + stock.marketCap, 0);
  const avgPE = NIFTY_STOCKS.reduce((s, stock) => s + stock.pe, 0) / NIFTY_STOCKS.length;
  const avgDivYield = NIFTY_STOCKS.reduce((s, stock) => s + stock.divYield, 0) / NIFTY_STOCKS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f0e6d8] flex items-center gap-3">
              <Activity className="w-8 h-8 text-[#c9a86c]" />
              NIFTY 50 Index
            </h1>
            <p className="text-[#9c9588] mt-1">
              India's benchmark stock market index • 50 companies across 13 sectors
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-[#c9a86c]">22,450.80</div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <TrendingUp className="w-5 h-5 text-[#7a9e7e]" />
              <span className="text-[#7a9e7e] font-semibold">+125.60 (+0.56%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-4">
          <div className="text-[#7a7569] text-sm mb-1">Total Market Cap</div>
          <div className="text-2xl font-bold text-[#f0e6d8]">₹{(totalMarketCap / 100000).toFixed(1)}T</div>
        </div>
        <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-4">
          <div className="text-[#7a7569] text-sm mb-1">Average P/E</div>
          <div className="text-2xl font-bold text-[#f0e6d8]">{avgPE.toFixed(1)}x</div>
        </div>
        <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-4">
          <div className="text-[#7a7569] text-sm mb-1">Avg Div Yield</div>
          <div className="text-2xl font-bold text-[#f0e6d8]">{avgDivYield.toFixed(2)}%</div>
        </div>
        <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-4">
          <div className="text-[#7a7569] text-sm mb-1">Constituents</div>
          <div className="text-2xl font-bold text-[#f0e6d8]">50</div>
        </div>
      </div>

      {/* Sparkline Cards - Top 8 by Weight */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sortedStocks.slice(0, 8).map(stock => (
          <div
            key={stock.symbol}
            className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-4 hover:border-[#c9a86c]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#c9a86c] font-mono text-sm font-semibold">{stock.symbol}</span>
              <span
                className={`text-xs font-medium flex items-center gap-0.5 ${
                  stock.changePercent > 0 ? 'text-[#7a9e7e]' : 'text-[#c45b5a]'
                }`}
              >
                {stock.changePercent > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stock.changePercent).toFixed(2)}%
              </span>
            </div>
            <div className="text-[#f0e6d8] font-medium text-sm mb-1 truncate">{stock.name}</div>
            <div className="text-[#7a7569] text-xs mb-3">₹{stock.price.toFixed(2)}</div>
            <Sparkline
              data={stock.sparklineData}
              width={200}
              height={50}
              strokeWidth={2}
            />
          </div>
        ))}
      </div>

      {/* Gainers/Losers + Sector Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#f0e6d8] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#7a9e7e]" />
            Top Gainers
          </h3>
          <div className="space-y-3">
            {topGainers.map(stock => (
              <div key={stock.symbol} className="flex items-center justify-between p-2 rounded hover:bg-[#1c1c1f] transition-colors">
                <div>
                  <div className="text-[#f0e6d8] text-sm font-medium">{stock.symbol}</div>
                  <div className="text-[#7a7569] text-xs">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#7a9e7e] text-sm font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +{stock.changePercent.toFixed(2)}%
                  </div>
                  <div className="text-[#7a7569] text-xs">₹{stock.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#f0e6d8] mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#c45b5a]" />
            Top Losers
          </h3>
          <div className="space-y-3">
            {topLosers.map(stock => (
              <div key={stock.symbol} className="flex items-center justify-between p-2 rounded hover:bg-[#1c1c1f] transition-colors">
                <div>
                  <div className="text-[#f0e6d8] text-sm font-medium">{stock.symbol}</div>
                  <div className="text-[#7a7569] text-xs">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#c45b5a] text-sm font-medium flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" />
                    {stock.changePercent.toFixed(2)}%
                  </div>
                  <div className="text-[#7a7569] text-xs">₹{stock.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#f0e6d8] mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#c9a86c]" />
            Sector Allocation
          </h3>
          <div className="space-y-3">
            {sectorAllocation.map(([sector, weight]) => (
              <div key={sector} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: SECTOR_COLORS[sector] || '#c9a86c' }}
                    />
                    <span className="text-[#f0e6d8] text-sm">{sector}</span>
                  </div>
                  <span className="text-[#9c9588] text-sm">{weight.toFixed(2)}%</span>
                </div>
                <div className="w-full h-2 bg-[#0c0c0e] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${weight}%`,
                      backgroundColor: SECTOR_COLORS[sector] || '#c9a86c',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Constituents Table */}
      <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f0e6d8] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#c9a86c]" />
            All 50 Constituents
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[#7a7569] text-sm">Sort by:</span>
            {(['weight', 'change', 'pe'] as const).map(option => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  sortBy === option
                    ? 'bg-[#c9a86c] text-[#0c0c0e] font-medium'
                    : 'bg-[#0c0c0e] text-[#9c9588] hover:text-[#f0e6d8] border border-[#f4f0e8]/10'
                }`}
              >
                {option === 'weight' ? 'Index Weight' : option === 'change' ? 'Change %' : 'P/E Ratio'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f4f0e8]/10">
                <th className="text-left py-3 px-4 text-[#9c9588] text-sm font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-[#9c9588] text-sm font-medium">Symbol</th>
                <th className="text-left py-3 px-4 text-[#9c9588] text-sm font-medium">Company</th>
                <th className="text-left py-3 px-4 text-[#9c9588] text-sm font-medium">Sector</th>
                <th className="text-right py-3 px-4 text-[#9c9588] text-sm font-medium">Weight</th>
                <th className="text-right py-3 px-4 text-[#9c9588] text-sm font-medium">Price</th>
                <th className="text-right py-3 px-4 text-[#9c9588] text-sm font-medium">Change</th>
                <th className="text-right py-3 px-4 text-[#9c9588] text-sm font-medium">P/E</th>
                <th className="text-right py-3 px-4 text-[#9c9588] text-sm font-medium">Div Yield</th>
              </tr>
            </thead>
            <tbody>
              {sortedStocks.map((stock) => (
                <tr
                  key={stock.symbol}
                  className="border-b border-[#f4f0e8]/5 hover:bg-[#1c1c1f] transition-colors"
                >
                  <td className="py-3 px-4 text-[#7a7569] text-sm">{stock.rank}</td>
                  <td className="py-3 px-4">
                    <span className="text-[#c9a86c] font-mono text-sm">{stock.symbol}</span>
                  </td>
                  <td className="py-3 px-4 text-[#f0e6d8] text-sm">{stock.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${SECTOR_COLORS[stock.sector] || '#c9a86c'}20`,
                        color: SECTOR_COLORS[stock.sector] || '#c9a86c',
                      }}
                    >
                      {stock.sector}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#f0e6d8] text-sm font-medium">
                    {stock.weight.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right text-[#f0e6d8] text-sm">
                    ₹{stock.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-medium flex items-center justify-end gap-1 ${
                      stock.changePercent > 0 ? 'text-[#7a9e7e]' : 
                      stock.changePercent < 0 ? 'text-[#c45b5a]' : 'text-[#9c9588]'
                    }`}>
                      {stock.changePercent > 0 ? <ArrowUpRight className="w-3 h-3" /> : 
                       stock.changePercent < 0 ? <ArrowDownRight className="w-3 h-3" /> : 
                       <Minus className="w-3 h-3" />}
                      {Math.abs(stock.changePercent).toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#9c9588] text-sm">{stock.pe.toFixed(1)}x</td>
                  <td className="py-3 px-4 text-right text-[#9c9588] text-sm">{stock.divYield.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Nifty50Page;
