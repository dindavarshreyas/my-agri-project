import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FarmForm from '../components/FarmForm';
import { createFarm } from '../lib/api';
import { ArrowLeft, Sprout, AlertCircle } from 'lucide-react';

export default function NewFarmPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateFarm = async (farmData) => {
    setIsSubmitting(true);
    setError('');

    try {
      await createFarm(farmData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create farm:', err);
      setError(err.message || 'Failed to register farm plot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Register New Farm Plot</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Record soil chemistry, pH, climate classification, and acreage for localized AI advisories.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <FarmForm onSubmit={handleCreateFarm} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
