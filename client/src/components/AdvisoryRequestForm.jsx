import React, { useState } from 'react';
import { Sparkles, Brain, Bug, Wheat, AlertCircle } from 'lucide-react';

export default function AdvisoryRequestForm({ farms, onGenerate, isGenerating = false, selectedFarmId = '' }) {
  const [targetFarmId, setTargetFarmId] = useState(selectedFarmId || (farms[0]?.id || ''));
  const [advisoryType, setAdvisoryType] = useState('Crop Selection');
  const [currentSeason, setCurrentSeason] = useState('Spring');
  const [userObservations, setUserObservations] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetFarmId) {
      setError('Please select a target farm plot.');
      return;
    }
    setError('');
    onGenerate({
      farm_id: targetFarmId,
      advisory_type: advisoryType,
      current_season: currentSeason,
      user_observations: userObservations
    });
  };

  const selectedFarm = farms.find(f => f.id === targetFarmId);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {isGenerating ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center" />
            <Brain className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Gemini 2.5 Flash is Reasoning...</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-4">
            Cross-referencing soil chemistry (pH {selectedFarm?.soil_ph}, NPK), regional climate ({selectedFarm?.climate_zone}), and agronomy disease models.
          </p>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Generating structured scientific advisory...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Farm Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Target Farm Plot *
            </label>
            {farms.length === 0 ? (
              <p className="text-sm text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                No farms registered yet. Please create a farm plot before generating an advisory.
              </p>
            ) : (
              <select
                value={targetFarmId}
                onChange={(e) => setTargetFarmId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.plot_name} — ({farm.acreage} acres, {farm.soil_type} soil, pH {farm.soil_ph}, {farm.climate_zone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Advisory Type Card Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Advisory Domain *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAdvisoryType('Crop Selection')}
                className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3.5 ${
                  advisoryType === 'Crop Selection'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${advisoryType === 'Crop Selection' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Crop Suitability & Rotation</div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Evaluates soil fertility, pH, and season to recommend optimal primary & cover crops.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAdvisoryType('Pest Management')}
                className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3.5 ${
                  advisoryType === 'Pest Management'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${advisoryType === 'Pest Management' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Pest & Disease Diagnostics</div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Analyzes crop symptoms, leaf discoloration, and rot to formulate targeted interventions.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Current Season Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Current Cultivation Season *
            </label>
            <select
              value={currentSeason}
              onChange={(e) => setCurrentSeason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Spring">Spring (Planting & early vegetative stage)</option>
              <option value="Summer">Summer (Peak growth, flowering, fruit setting)</option>
              <option value="Autumn">Autumn (Harvesting, soil amendment, post-harvest cover)</option>
              <option value="Winter">Winter (Dormancy, frost mitigation, greenhouse crops)</option>
            </select>
          </div>

          {/* User Observations Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Farmer Observations & Field Symptoms
            </label>
            <textarea
              rows={4}
              value={userObservations}
              onChange={(e) => setUserObservations(e.target.value)}
              placeholder={
                advisoryType === 'Crop Selection'
                  ? 'e.g. Planning for high-protein grain or legume rotation. Target market is local organic co-op.'
                  : 'e.g. Yellowing lower leaves with concentric dark rings on tomato plants after 3 days of continuous rain.'
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Include visible leaf discoloration, pest sightings, recent fertilization, or rainfall history.
            </p>
          </div>

          <button
            type="submit"
            disabled={farms.length === 0}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Scientific AI Advisory</span>
          </button>
        </form>
      )}
    </div>
  );
}
