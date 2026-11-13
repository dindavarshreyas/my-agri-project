import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdvisoryById } from '../lib/api';
import AdvisoryReportDisplay from '../components/AdvisoryReportDisplay';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

export default function AdvisoryDetailPage() {
  const { id } = useParams();
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdvisory() {
      try {
        setLoading(true);
        const data = await getAdvisoryById(id);
        setAdvisory(data);
      } catch (err) {
        console.error('Failed to load advisory:', err);
        setError(err.message || 'Advisory report not found');
      } finally {
        setLoading(false);
      }
    }
    loadAdvisory();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading AI Advisory Report...</div>;
  }

  if (error || !advisory) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-500/10 rounded-2xl border border-rose-500/20">
        {error || 'Advisory report not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {advisory.farm_id && (
          <Link
            to={`/farms/${advisory.farm_id}`}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            View Farm Plot Profile &rarr;
          </Link>
        )}
      </div>

      {/* Render Advisory Report Display */}
      <AdvisoryReportDisplay advisory={advisory} />
    </div>
  );
}
