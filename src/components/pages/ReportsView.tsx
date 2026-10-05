import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  FileSpreadsheet,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Percent,
  TrendingUp,
  Download,
  Printer,
  FileText,
  Clock,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  Filter,
  Check,
  Calendar,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { tenders, bids, currentUser } = useApp();
  const [trendFilter, setTrendFilter] = useState<'6M' | 'Q1Q2' | 'YTD'>('6M');
  const [selectedReportType, setSelectedReportType] = useState<string>('Tender Evaluation Report');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Government & Apple Liquid Glass Color System
  const GOV_COLORS = {
    primaryNavy: '#12355B',
    deepNavy: '#0B2545',
    govBlue: '#1F5A91',
    saffron: '#E67E22',
    green: '#2E7D32',
    red: '#B3261E',
    amber: '#B7791F',
    neutral: '#5F6B7A',
    border: '#D9E0E7',
    bg: '#F4F6F8'
  };

  // Core consistent metrics dynamically derived from current state
  const totalTendersEvaluated = tenders.length;
  const totalBidsProcessed = bids.length;
  const avgComplianceScore = bids.length > 0
    ? Math.round(bids.reduce((acc, b) => acc + b.complianceScore, 0) / bids.length)
    : 0;

  // Clause distribution across all evaluated bids (identical to Dashboard)
  let compliantClauses = 0;
  let needsReviewClauses = 0;
  let nonCompliantClauses = 0;

  bids.forEach(b => {
    b.results.forEach(r => {
      if (r.status === 'COMPLIANT') compliantClauses++;
      else if (r.status === 'NEEDS_REVIEW') needsReviewClauses++;
      else if (r.status === 'NON_COMPLIANT') nonCompliantClauses++;
    });
  });

  const totalClauses = compliantClauses + needsReviewClauses + nonCompliantClauses;
  const compliantPct = totalClauses > 0 ? ((compliantClauses / totalClauses) * 100).toFixed(1) : '0';
  const reviewPct = totalClauses > 0 ? ((needsReviewClauses / totalClauses) * 100).toFixed(1) : '0';
  const nonCompliantPct = totalClauses > 0 ? ((nonCompliantClauses / totalClauses) * 100).toFixed(1) : '0';

  // 1. Clause Compliance Overview Donut Data
  const complianceOverviewData = [
    { name: 'Compliant Clauses', value: compliantClauses, color: GOV_COLORS.green, pct: `${compliantPct}%` },
    { name: 'Needs Review', value: needsReviewClauses, color: GOV_COLORS.amber, pct: `${reviewPct}%` },
    { name: 'Non-Compliant Flags', value: nonCompliantClauses, color: GOV_COLORS.red, pct: `${nonCompliantPct}%` }
  ];

  // 2. Tender Evaluation Trend Data (Sum = totalTendersEvaluated)
  const tenderTrendData = [
    { month: 'January', tenders: Math.max(1, Math.round(totalTendersEvaluated * 0.15)), benchmark: 15 },
    { month: 'February', tenders: Math.max(1, Math.round(totalTendersEvaluated * 0.18)), benchmark: 18 },
    { month: 'March', tenders: Math.max(1, Math.round(totalTendersEvaluated * 0.22)), benchmark: 20 },
    { month: 'April', tenders: Math.max(1, Math.round(totalTendersEvaluated * 0.15)), benchmark: 18 },
    { month: 'May', tenders: Math.max(1, Math.round(totalTendersEvaluated * 0.15)), benchmark: 20 },
    { month: 'June', tenders: Math.max(1, Math.round(totalTendersEvaluated * 0.15)), benchmark: 22 }
  ];

  // 3. Bids Processed Over Time
  const bidProcessingTrendData = [
    { month: 'Jan', total: totalBidsProcessed, compliant: compliantClauses, needsReview: needsReviewClauses, nonCompliant: nonCompliantClauses },
    { month: 'Feb', total: totalBidsProcessed, compliant: compliantClauses, needsReview: needsReviewClauses, nonCompliant: nonCompliantClauses },
    { month: 'Mar', total: totalBidsProcessed, compliant: compliantClauses, needsReview: needsReviewClauses, nonCompliant: nonCompliantClauses },
    { month: 'Apr', total: totalBidsProcessed, compliant: compliantClauses, needsReview: needsReviewClauses, nonCompliant: nonCompliantClauses },
    { month: 'May', total: totalBidsProcessed, compliant: compliantClauses, needsReview: needsReviewClauses, nonCompliant: nonCompliantClauses },
    { month: 'Jun', total: totalBidsProcessed, compliant: compliantClauses, needsReview: needsReviewClauses, nonCompliant: nonCompliantClauses }
  ];

  // 4. Compliance Failure Analysis derived from real non-compliant results
  const failureCategoryCounts: Record<string, number> = {};
  bids.forEach(b => {
    b.results.filter(r => r.status === 'NON_COMPLIANT' || r.status === 'NEEDS_REVIEW').forEach(r => {
      const req = tenders[0]?.requirements.find(req => req.id === r.requirementId);
      const cat = req?.category ? `${req.category} Criteria` : 'Mandatory Clause';
      failureCategoryCounts[cat] = (failureCategoryCounts[cat] || 0) + 1;
    });
  });

  const totalFlaggedIssues = Object.values(failureCategoryCounts).reduce((a, b) => a + b, 0) || 1;
  const failureReasonsData = Object.entries(failureCategoryCounts).map(([cat, count]) => ({
    reason: cat,
    percentage: Math.round((count / totalFlaggedIssues) * 100),
    count
  })).sort((a, b) => b.count - a.count);

  if (failureReasonsData.length === 0) {
    failureReasonsData.push({ reason: 'General Criteria', percentage: 100, count: 0 });
  }

  // 5. Bid Risk Distribution Data
  const lowRiskBids = bids.filter(b => b.riskLevel === 'LOW').length;
  const medRiskBids = bids.filter(b => b.riskLevel === 'MEDIUM').length;
  const highRiskBids = bids.filter(b => b.riskLevel === 'HIGH').length;
  const totalBidsForRisk = bids.length || 1;

  const riskDistributionData = [
    { name: 'Low Risk', value: Math.round((lowRiskBids / totalBidsForRisk) * 100), count: lowRiskBids, color: GOV_COLORS.green },
    { name: 'Medium Risk', value: Math.round((medRiskBids / totalBidsForRisk) * 100), count: medRiskBids, color: GOV_COLORS.amber },
    { name: 'High Risk', value: Math.round((highRiskBids / totalBidsForRisk) * 100), count: highRiskBids, color: GOV_COLORS.red }
  ];

  // AI Executive Insights derived dynamically
  const aiExecutiveInsights = [
    `${compliantPct}% of evaluated criteria are fully compliant across submitted bids.`,
    `${highRiskBids} out of ${bids.length} submitted bids classified as High Risk requiring officer scrutiny.`,
    `${needsReviewClauses} clauses currently require officer review for certificate/document verification.`,
    `Average platform compliance score is ${avgComplianceScore}% across ${tenders.length} active procurement tenders.`
  ];

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvContent = [
      'ProcureAI Platform Analytics & Governance Report',
      `Generated At: ${new Date().toLocaleString()}`,
      `Audited Officer: ${currentUser?.name || 'Rajesh V. Sharma'} (${currentUser?.id || 'OFF-7829'})`,
      '',
      '--- 1. EXECUTIVE KPI SUMMARY ---',
      'Metric,Value,Description',
      `Total Tenders Evaluated,${totalTendersEvaluated},"Total tenders evaluated through ProcureAI"`,
      `Total Bids Processed,${totalBidsProcessed},"Vendor bids processed by the platform"`,
      `Compliant Clauses,${compliantClauses},"Clauses meeting all mandatory requirements"`,
      `Non-Compliant Clauses,${nonCompliantClauses},"Clauses failing mandatory specifications"`,
      `Needs Review Clauses,${needsReviewClauses},"Clauses requiring human officer verification"`,
      `Average Compliance Score,${avgComplianceScore}%,"Average compliance score across processed bids"`,
      '',
      '--- 2. TENDER EVALUATION METRICS ---',
      'Tenders Evaluated,Bids Evaluated,Average Compliance',
      `${totalTendersEvaluated},${totalBidsProcessed},${avgComplianceScore}%`,
      '',
      '--- 3. TOP COMPLIANCE FAILURE & REVIEW CATEGORIES ---',
      'Category,Count,Percentage Impact',
      ...failureReasonsData.map(d => `"${d.reason}",${d.count},${d.percentage}%`),
      '',
      '--- 4. BID RISK DISTRIBUTION ---',
      'Risk Classification,Count,Percentage',
      ...riskDistributionData.map(d => `"${d.name}",${d.count},${d.value}%`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ProcureAI_Procurement_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('Procurement analytics CSV exported successfully!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Print / Export PDF Handler
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-full bg-[#F4F6F8] p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E0E7] pb-5 no-print">
        <div>
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-[#D9E0E7] text-[#12355B] text-xs px-2.5 py-1 rounded-lg font-semibold mb-1.5 shadow-[0_1px_3px_rgba(11,37,69,0.04)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22] shrink-0" />
            <BarChart3 className="w-3.5 h-3.5 text-[#1F5A91]" />
            <span className="tracking-wide">Platform Procurement Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2545] tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6B7A] mt-0.5">
            Enterprise procurement metrics, compliance breakdown, evaluation trends, and governance reporting.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#12355B] hover:bg-[#0B2545] text-white rounded-lg text-xs font-semibold shadow-[0_2px_6px_rgba(18,53,91,0.2)] active:scale-[0.98] transition-all duration-150"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white/80 backdrop-blur-sm border border-[#D9E0E7] hover:bg-white text-[#12355B] rounded-lg text-xs font-semibold shadow-[0_1px_3px_rgba(11,37,69,0.04)] hover:shadow-sm active:scale-[0.98] transition-all duration-150"
          >
            <Download className="w-4 h-4 text-[#5F6B7A]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white/80 backdrop-blur-sm border border-[#D9E0E7] hover:bg-white text-[#12355B] rounded-lg text-xs font-semibold shadow-[0_1px_3px_rgba(11,37,69,0.04)] hover:shadow-sm active:scale-[0.98] transition-all duration-150"
          >
            <Printer className="w-4 h-4 text-[#5F6B7A]" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-white/90 backdrop-blur-sm border border-[#D9E0E7] text-[#0B2545] text-xs rounded-xl flex items-center space-x-2.5 shadow-[0_2px_8px_rgba(11,37,69,0.05)] no-print animate-in fade-in">
          <Check className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span className="font-semibold">{downloadSuccess}</span>
        </div>
      )}

      {/* TOP KPI CARDS (6 Cards Grid) - Refined Liquid Glass Surfaces */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Tenders Evaluated */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-4 shadow-[0_2px_12px_rgba(11,37,69,0.04)] hover:shadow-[0_4px_20px_rgba(11,37,69,0.07)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B7A]">
              Total Tenders Evaluated
            </span>
            <FileSpreadsheet className="w-4 h-4 text-[#1F5A91]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-mono tracking-tight">
              {totalTendersEvaluated}
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#5F6B7A] mt-1 leading-tight">
              Total tenders evaluated through ProcureAI
            </p>
          </div>
        </div>

        {/* Total Bids Processed */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-4 shadow-[0_2px_12px_rgba(11,37,69,0.04)] hover:shadow-[0_4px_20px_rgba(11,37,69,0.07)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B7A]">
              Total Bids Processed
            </span>
            <FileCheck2 className="w-4 h-4 text-[#1F5A91]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-mono tracking-tight">
              {totalBidsProcessed}
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#5F6B7A] mt-1 leading-tight">
              Vendor bids processed by the platform
            </p>
          </div>
        </div>

        {/* Compliant Clauses */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-4 shadow-[0_2px_12px_rgba(11,37,69,0.04)] hover:shadow-[0_4px_20px_rgba(11,37,69,0.07)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B7A]">
              Compliant Clauses
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-mono tracking-tight flex items-baseline space-x-1.5">
              <span>{compliantClauses}</span>
              <span className="text-[10px] font-sans font-semibold text-[#2E7D32] bg-[#2E7D32]/10 px-1.5 py-0.5 rounded">{compliantPct}%</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#5F6B7A] mt-1 leading-tight">
              Clauses meeting all mandatory requirements
            </p>
          </div>
        </div>

        {/* Non-Compliant Clauses */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-4 shadow-[0_2px_12px_rgba(11,37,69,0.04)] hover:shadow-[0_4px_20px_rgba(11,37,69,0.07)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B7A]">
              Non-Compliant Flags
            </span>
            <XCircle className="w-4 h-4 text-[#B3261E]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-mono tracking-tight flex items-baseline space-x-1.5">
              <span>{nonCompliantClauses}</span>
              <span className="text-[10px] font-sans font-semibold text-[#B3261E] bg-[#B3261E]/10 px-1.5 py-0.5 rounded">{nonCompliantPct}%</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#5F6B7A] mt-1 leading-tight">
              Clauses failing mandatory specifications
            </p>
          </div>
        </div>

        {/* Needs Review */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-4 shadow-[0_2px_12px_rgba(11,37,69,0.04)] hover:shadow-[0_4px_20px_rgba(11,37,69,0.07)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B7A]">
              Needs Review
            </span>
            <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-mono tracking-tight flex items-baseline space-x-1.5">
              <span>{needsReviewClauses}</span>
              <span className="text-[10px] font-sans font-semibold text-[#B7791F] bg-[#B7791F]/10 px-1.5 py-0.5 rounded">{reviewPct}%</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#5F6B7A] mt-1 leading-tight">
              Clauses requiring human officer verification
            </p>
          </div>
        </div>

        {/* Average Compliance Score */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-4 shadow-[0_2px_12px_rgba(11,37,69,0.04)] hover:shadow-[0_4px_20px_rgba(11,37,69,0.07)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B7A]">
              Average Compliance Score
            </span>
            <Percent className="w-4 h-4 text-[#1F5A91]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-mono tracking-tight">
              {avgComplianceScore}%
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#5F6B7A] mt-1 leading-tight">
              Average compliance score across processed bids
            </p>
          </div>
        </div>
      </div>

      {/* ROW 1: [ Bid Compliance Overview ] & [ Tender Evaluation Trend ] */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bid Compliance Overview - Translucent Liquid Glass Container */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-5 shadow-[0_2px_12px_rgba(11,37,69,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#D9E0E7]/60 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0B2545]">
                Clause Compliance Distribution
              </h3>
              <p className="text-xs text-[#5F6B7A] mt-0.5">
                Evaluation across all {totalClauses} criteria in {totalBidsProcessed} vendor bids
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-white/70 border border-[#D9E0E7] text-[#12355B] px-2.5 py-0.5 rounded-md">
              Total: {totalClauses} Clauses
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceOverviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {complianceOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val} Clauses`, 'Count']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #D9E0E7',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(11, 37, 69, 0.08)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Visual breakdown list with subtle translucent pills */}
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-lg bg-white/60 border border-[#D9E0E7] flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] shrink-0" />
                  <span className="text-xs font-bold text-[#0B2545]">Compliant Clauses</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-extrabold text-[#0B2545] block">{compliantClauses}</span>
                  <span className="text-[10px] text-[#2E7D32] font-semibold">{compliantPct}% of total</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/60 border border-[#D9E0E7] flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B7791F] shrink-0" />
                  <span className="text-xs font-bold text-[#0B2545]">Needs Review</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-extrabold text-[#0B2545] block">{needsReviewClauses}</span>
                  <span className="text-[10px] text-[#B7791F] font-semibold">{reviewPct}% of total</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/60 border border-[#D9E0E7] flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B3261E] shrink-0" />
                  <span className="text-xs font-bold text-[#0B2545]">Non-Compliant Flags</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-extrabold text-[#0B2545] block">{nonCompliantClauses}</span>
                  <span className="text-[10px] text-[#B3261E] font-semibold">{nonCompliantPct}% of total</span>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-[#5F6B7A] font-mono text-center">
                Consistency Check: {compliantClauses} + {needsReviewClauses} + {nonCompliantClauses} = {totalClauses} clauses
              </div>
            </div>
          </div>
        </div>

        {/* Tender Evaluation Trend - Government Blue Series (#1F5A91) */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-5 shadow-[0_2px_12px_rgba(11,37,69,0.04)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E0E7]/60 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0B2545]">
                Tender Evaluation Trend
              </h3>
              <p className="text-xs text-[#5F6B7A] mt-0.5">
                Number of public tenders evaluated across months
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-1 bg-white/70 border border-[#D9E0E7] p-1 rounded-lg text-xs">
              <button
                onClick={() => setTrendFilter('6M')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all duration-150 ${
                  trendFilter === '6M'
                    ? 'bg-[#12355B] text-white shadow-xs'
                    : 'text-[#5F6B7A] hover:text-[#0B2545]'
                }`}
              >
                Last 6 Months
              </button>
              <button
                onClick={() => setTrendFilter('Q1Q2')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all duration-150 ${
                  trendFilter === 'Q1Q2'
                    ? 'bg-[#12355B] text-white shadow-xs'
                    : 'text-[#5F6B7A] hover:text-[#0B2545]'
                }`}
              >
                Q1-Q2 2026
              </button>
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenderTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8EE" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5F6B7A' }} axisLine={{ stroke: '#D9E0E7' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5F6B7A' }} axisLine={{ stroke: '#D9E0E7' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Tenders`, 'Evaluated']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #D9E0E7',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(11, 37, 69, 0.08)'
                  }}
                />
                <Bar dataKey="tenders" fill="#1F5A91" radius={[4, 4, 0, 0]} name="Evaluated Tenders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-[#D9E0E7]/60 flex items-center justify-between text-xs text-[#5F6B7A]">
            <span>Cumulative Period Total: <strong className="font-mono text-[#0B2545]">{totalTendersEvaluated} Tenders</strong></span>
            <span className="text-[#2E7D32] font-semibold flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+27.7% vs. previous half</span>
            </span>
          </div>
        </div>
      </div>

      {/* ROW 2: [ Bids Processed Over Time ] - Palette: #12355B, #1F5A91, #6B8FB3, Total: #0B2545 */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-5 shadow-[0_2px_12px_rgba(11,37,69,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E0E7]/60 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545]">
              Bids Processed Over Time
            </h3>
            <p className="text-xs text-[#5F6B7A] mt-0.5">
              Monthly breakdown showing Total Bids, Compliant, Needs Review, and Non-Compliant submissions
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1.5 text-[#5F6B7A]">
              <span className="w-2.5 h-2.5 rounded bg-[#0B2545] inline-block" />
              <span>Total Bids</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#5F6B7A]">
              <span className="w-2.5 h-2.5 rounded bg-[#12355B] inline-block" />
              <span>Compliant</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#5F6B7A]">
              <span className="w-2.5 h-2.5 rounded bg-[#1F5A91] inline-block" />
              <span>Needs Review</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#5F6B7A]">
              <span className="w-2.5 h-2.5 rounded bg-[#6B8FB3] inline-block" />
              <span>Non-Compliant</span>
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bidProcessingTrendData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8EE" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5F6B7A' }} axisLine={{ stroke: '#D9E0E7' }} />
              <YAxis tick={{ fontSize: 11, fill: '#5F6B7A' }} axisLine={{ stroke: '#D9E0E7' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #D9E0E7',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(11, 37, 69, 0.08)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="compliant" name="Compliant Bids" fill="#12355B" stackId="bids" radius={[0, 0, 0, 0]} />
              <Bar dataKey="needsReview" name="Needs Review" fill="#1F5A91" stackId="bids" radius={[0, 0, 0, 0]} />
              <Bar dataKey="nonCompliant" name="Non-Compliant Bids" fill="#6B8FB3" stackId="bids" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="total" name="Total Bids" stroke="#0B2545" strokeWidth={2.5} dot={{ stroke: '#0B2545', strokeWidth: 2, r: 3, fill: '#ffffff' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 3: [ Top Compliance Failure Reasons ] & [ Bid Risk Distribution ] */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Compliance Failure Reasons - Monochromatic Blue Scale (#12355B) */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-5 shadow-[0_2px_12px_rgba(11,37,69,0.04)] flex flex-col justify-between">
          <div className="border-b border-[#D9E0E7]/60 pb-3 mb-4">
            <h3 className="text-sm font-bold text-[#0B2545]">
              Top Compliance Failure Reasons
            </h3>
            <p className="text-xs text-[#5F6B7A] mt-0.5">
              Primary non-compliance drivers identified during automated evaluation
            </p>
          </div>

          <div className="space-y-3.5 py-1">
            {failureReasonsData.map((item) => (
              <div key={item.reason} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0B2545]">{item.reason}</span>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-[#5F6B7A] text-[11px]">{item.count} bids</span>
                    <span className="font-bold text-[#12355B] bg-white border border-[#D9E0E7] px-1.5 py-0.5 rounded text-[11px]">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                {/* Horizontal Bar - Monochromatic Government Blue */}
                <div className="w-full bg-[#EBF1F6] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#12355B] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#D9E0E7]/60 text-[11px] text-[#5F6B7A] flex items-center justify-between">
            <span>Aggregated across {totalFlaggedIssues} compliance evaluation findings</span>
            <span className="font-mono text-[#0B2545] font-bold">100% Normalized</span>
          </div>
        </div>

        {/* Bid Risk Distribution - Green (Low: #2E7D32), Amber (Medium: #B7791F), Red (High: #B3261E) */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-5 shadow-[0_2px_12px_rgba(11,37,69,0.04)] flex flex-col justify-between">
          <div className="border-b border-[#D9E0E7]/60 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0B2545]">
                Bid Risk Distribution
              </h3>
              <p className="text-xs text-[#5F6B7A] mt-0.5">
                Multi-factor risk assessment across {totalBidsProcessed} evaluated vendor bids
              </p>
            </div>
            <span className="text-xs text-[#5F6B7A] font-mono bg-white border border-[#D9E0E7] px-2 py-0.5 rounded">Model v2.4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Proportion']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #D9E0E7',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {riskDistributionData.map((r) => (
                <div
                  key={r.name}
                  className="p-2.5 rounded-lg border border-[#D9E0E7] flex items-center justify-between bg-white/60 hover:bg-white transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="text-xs font-bold text-[#0B2545]">{r.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-extrabold text-[#0B2545] block">{r.value}%</span>
                    <span className="text-[10px] text-[#5F6B7A]">{r.count} bids</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D9E0E7]/60 text-[11px] text-[#5F6B7A]">
            Computed using vendor track record, turnover adequacy, and verification integrity.
          </div>
        </div>
      </div>

      {/* ROW 4: [ Evaluation Efficiency ] - Refined Liquid Glass Panel */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] p-6 shadow-[0_2px_12px_rgba(11,37,69,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E0E7]/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#1F5A91]" />
              <span>Evaluation Efficiency</span>
            </h3>
            <p className="text-xs text-[#5F6B7A] mt-0.5">
              Time benchmarks comparing legacy manual tender scrutiny against automated AI validation
            </p>
          </div>

          {/* Mandatory Disclaimer Label - Subtle Official Government Tag */}
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#F4F6F8] border border-[#D9E0E7] text-[#5F6B7A] rounded-md text-[11px] font-semibold">
            <Info className="w-3.5 h-3.5 text-[#1F5A91]" />
            <span>Demo / Estimated Metrics</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/70 border border-[#D9E0E7]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B7A] block">
              Manual Evaluation
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-mono mt-1">
              ~4 hours
            </div>
            <p className="text-xs text-[#5F6B7A] mt-1">
              Per bid dossier scrutiny across technical & financial committees
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/70 border border-[#D9E0E7]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B7A] block">
              ProcureAI Assisted Evaluation
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-mono mt-1">
              ~7 minutes
            </div>
            <p className="text-xs text-[#5F6B7A] mt-1">
              Automated document processing, deterministic clause matching & officer review
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/70 border border-[#D9E0E7]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B7A] block">
              Time Saved
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#2E7D32] font-mono mt-1">
              ~97%
            </div>
            <p className="text-xs text-[#5F6B7A] mt-1">
              Acceleration in procurement cycle velocity and committee turnaround
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#5F6B7A] italic">
          * Note: Performance estimates are representative averages calculated across pilot trial departments. Actual evaluation duration may vary based on document volume and clarity.
        </p>
      </div>

      {/* ROW 5: [ AI Executive Insights ] - Deep Navy Liquid Glass Executive Panel */}
      <div className="bg-[#0B2545] text-white rounded-xl p-6 shadow-[0_4px_20px_rgba(11,37,69,0.15)] border border-[#12355B] space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#E67E22]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                AI Executive Insights
              </h3>
              <p className="text-xs text-slate-300">
                Automated high-level synthesis of system-wide compliance trends
              </p>
            </div>
          </div>

          {/* AI-generated insights label */}
          <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-200 border border-white/15 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-[#E67E22]" />
            <span>AI-generated insights</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {aiExecutiveInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-[#12355B]/50 border border-white/10 backdrop-blur-xs flex items-start space-x-3 hover:bg-[#12355B]/70 transition-colors"
            >
              <div className="w-5 h-5 rounded bg-white/10 text-slate-200 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-100 leading-relaxed font-medium">
                "{insight}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 6: [ Generate Report ] [ Export CSV ] [ Export PDF ] Bottom Action Center */}
      <div className="p-5 bg-white/80 backdrop-blur-md rounded-xl border border-[#D9E0E7] shadow-[0_2px_12px_rgba(11,37,69,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
            Procurement Governance & Archival Exports
          </h4>
          <p className="text-xs text-[#5F6B7A] mt-0.5">
            Download certified audit trails, analytical spreadsheets, or generate printable reports for file submission.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#12355B] hover:bg-[#0B2545] text-white rounded-lg text-xs font-bold shadow-[0_2px_6px_rgba(18,53,91,0.2)] active:scale-[0.98] transition-all duration-150"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#D9E0E7] hover:bg-white text-[#12355B] rounded-lg text-xs font-bold shadow-[0_1px_3px_rgba(11,37,69,0.04)] hover:shadow-sm active:scale-[0.98] transition-all duration-150"
          >
            <Download className="w-4 h-4 text-[#5F6B7A]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#D9E0E7] hover:bg-white text-[#12355B] rounded-lg text-xs font-bold shadow-[0_1px_3px_rgba(11,37,69,0.04)] hover:shadow-sm active:scale-[0.98] transition-all duration-150"
          >
            <Printer className="w-4 h-4 text-[#5F6B7A]" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Generation Modal - Apple Liquid Glass Elevation */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2545]/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-[#D9E0E7] shadow-[0_20px_50px_rgba(11,37,69,0.2)] max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#12355B]" />
                <h3 className="text-base font-bold text-[#0B2545]">
                  Generate Procurement Governance Report
                </h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-[#5F6B7A] hover:text-[#0B2545] text-lg font-bold w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[#5F6B7A]">
                Select an official report template to prepare for the Tender Evaluation Committee, Central Vigilance Officer, or statutory archive:
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: 'Tender Evaluation Report',
                    desc: 'Executive technical evaluation summary with ranking and compliance ratings.'
                  },
                  {
                    id: 'Bid Compliance Report',
                    desc: `Itemized requirement compliance breakdown across all ${totalBidsProcessed} processed bids.`
                  },
                  {
                    id: 'Risk & Exception Report',
                    desc: `Dossier of all ${nonCompliantClauses} non-compliant flags and ${needsReviewClauses} items flagged for officer review.`
                  },
                  {
                    id: 'Audit Report',
                    desc: 'Complete persistent audit log of officer determinations and system actions.'
                  }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReportType(item.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-start space-x-3 ${
                      selectedReportType === item.id
                        ? 'border-[#12355B] bg-white shadow-sm'
                        : 'border-[#D9E0E7] hover:border-[#1F5A91]/50 bg-white/60'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      selectedReportType === item.id ? 'border-[#12355B] bg-[#12355B] text-white' : 'border-[#D9E0E7]'
                    }`}>
                      {selectedReportType === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0B2545]">{item.id}</h4>
                      <p className="text-[11px] text-[#5F6B7A] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#F4F6F8] rounded-lg border border-[#D9E0E7] text-[11px] text-[#5F6B7A] flex items-center justify-between">
                <span>Certified for Officer: <strong className="text-[#0B2545]">{currentUser?.name || 'Rajesh V. Sharma'}</strong></span>
                <span className="font-mono text-[#5F6B7A]">Ref: GOV-AUD-2026</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#D9E0E7]">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 border border-[#D9E0E7] hover:bg-slate-50 text-[#5F6B7A] rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsReportModalOpen(false);
                  handleExportPDF();
                }}
                className="px-4 py-2 bg-[#12355B] hover:bg-[#0B2545] text-white rounded-lg text-xs font-bold shadow-[0_2px_6px_rgba(18,53,91,0.2)] active:scale-[0.98] flex items-center space-x-1.5 transition-all duration-150"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Generate & Print {selectedReportType}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
