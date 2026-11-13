import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getFarms, generateAdvisory } from '../lib/api';
import AdvisoryRequestForm from '../components/AdvisoryRequestForm';
import { Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AdvisoryGeneratePage() {
  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedFarmId = searchParams.get('farmId') || '';

  useEffect(() => {
    async function loadFarms() {
      try {
        setLoadingFarms(true);
        const data = await getFarms();
        setFarms(data);
      } catch (err) {
        console.error('Failed to load farms:', err);
        setError(err.message || 'Failed to load farm plots');
      } finally {
        setLoadingFarms(false);
      }
    }
    loadFarms();
  }, []);

  const handleGenerate = async (payload) => {
    setIsGenerating(true);
    setError('');

    try {
      const result = await generateAdvisory(payload);
      if (result && result.id) {
        navigate(`/advisory/${result.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('AI Advisory generation error:', err);
      setError(err.message || 'AI generation failed. Please verify API key configuration.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="flex items-center space-x-3 pb-6 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Crop Advisory Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by Google Gemini 2.5 Flash • Structured scientific agronomic reasoning
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loadingFarms ? (
        <div className="p-12 text-center text-slate-400">Loading your farm plots...</div>
      ) : (
        <AdvisoryRequestForm
          farms={farms}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          selectedFarmId={preselectedFarmId}
        />
      )}
    </div>
  );
}
