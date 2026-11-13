import React, { useState } from 'react';
import { z } from 'zod';
import { Sprout, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const FarmClientSchema = z.object({
  plot_name: z.string().min(1, 'Plot name is required'),
  acreage: z.coerce.number().positive('Acreage must be a positive number'),
  climate_zone: z.enum(['Tropical', 'Arid', 'Temperate', 'Continental']),
  soil_type: z.enum(['Clay', 'Sandy', 'Loamy', 'Silt', 'Peat']),
  soil_ph: z.coerce.number().min(1, 'Min pH is 1.0').max(14, 'Max pH is 14.0'),
  nitrogen_level: z.enum(['Low', 'Medium', 'High']),
  phosphorus_level: z.enum(['Low', 'Medium', 'High']),
  potassium_level: z.enum(['Low', 'Medium', 'High'])
});

export default function FarmForm({ onSubmit, initialData = null, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    plot_name: initialData?.plot_name || '',
    acreage: initialData?.acreage || '',
    climate_zone: initialData?.climate_zone || 'Temperate',
    soil_type: initialData?.soil_type || 'Loamy',
    soil_ph: initialData?.soil_ph || '6.5',
    nitrogen_level: initialData?.nitrogen_level || 'Medium',
    phosphorus_level: initialData?.phosphorus_level || 'Medium',
    potassium_level: initialData?.potassium_level || 'Medium'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = FarmClientSchema.parse(formData);
      setErrors({});
      onSubmit(parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          fieldErrors[e.path[0]] = e.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Plot Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Plot Name / Identifier *
          </label>
          <input
            type="text"
            name="plot_name"
            value={formData.plot_name}
            onChange={handleChange}
            placeholder="e.g. North Orchard, Valley Plot B"
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              errors.plot_name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
          {errors.plot_name && <p className="text-xs text-rose-400 mt-1">{errors.plot_name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Acreage (Acres) *
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            name="acreage"
            value={formData.acreage}
            onChange={handleChange}
            placeholder="e.g. 12.5"
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              errors.acreage ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
          {errors.acreage && <p className="text-xs text-rose-400 mt-1">{errors.acreage}</p>}
        </div>
      </div>

      {/* Climate & Soil Classification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Climate Zone *
          </label>
          <select
            name="climate_zone"
            value={formData.climate_zone}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="Tropical">Tropical (Warm, humid year-round)</option>
            <option value="Arid">Arid (Dry, low precipitation)</option>
            <option value="Temperate">Temperate (Moderate, seasonal rainfall)</option>
            <option value="Continental">Continental (Hot summers, cold winters)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Primary Soil Type *
          </label>
          <select
            name="soil_type"
            value={formData.soil_type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="Clay">Clay (Heavy, moisture-retentive)</option>
            <option value="Sandy">Sandy (Light, fast drainage)</option>
            <option value="Loamy">Loamy (Fertile, balanced)</option>
            <option value="Silt">Silt (Smooth, fertile sediment)</option>
            <option value="Peat">Peat (High organic matter, acidic)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            <span>Soil pH Level (1 - 14) *</span>
            <span className="text-emerald-400 font-bold">{formData.soil_ph}</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="14"
            name="soil_ph"
            value={formData.soil_ph}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              errors.soil_ph ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
          {errors.soil_ph && <p className="text-xs text-rose-400 mt-1">{errors.soil_ph}</p>}
        </div>
      </div>

      {/* Soil Chemistry (NPK Nutrient Levels) */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center space-x-2">
          <span>Soil Chemistry: NPK Nutrient Concentration</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Nitrogen (N)</label>
            <select
              name="nitrogen_level"
              value={formData.nitrogen_level}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Low">Low (&lt; 20 ppm)</option>
              <option value="Medium">Medium (20 - 40 ppm)</option>
              <option value="High">High (&gt; 40 ppm)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Phosphorus (P)</label>
            <select
              name="phosphorus_level"
              value={formData.phosphorus_level}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Low">Low (&lt; 15 ppm)</option>
              <option value="Medium">Medium (15 - 30 ppm)</option>
              <option value="High">High (&gt; 30 ppm)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Potassium (K)</label>
            <select
              name="potassium_level"
              value={formData.potassium_level}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Low">Low (&lt; 100 ppm)</option>
              <option value="Medium">Medium (100 - 200 ppm)</option>
              <option value="High">High (&gt; 200 ppm)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            <span>Saving Farm Profile...</span>
          </>
        ) : (
          <>
            <Sprout className="w-4 h-4" />
            <span>Save & Register Farm Plot</span>
          </>
        )}
      </button>
    </form>
  );
}
