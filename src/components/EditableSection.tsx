import { useState } from 'react';
import { supabase, Lead } from '../lib/supabase';
import { Edit2, Check, X } from 'lucide-react';

interface EditableSectionProps {
  lead: Lead;
  onLeadUpdate: (updatedLead: Lead) => void;
  title: string;
  icon: React.ReactNode;
  fields: Array<{
    key: keyof Lead;
    label: string;
    type?: 'text' | 'url';
    placeholder?: string;
  }>;
  accentColor?: string;
}

export function EditableSection({
  lead,
  onLeadUpdate,
  title,
  icon,
  fields,
  accentColor = 'cyan',
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.key]: lead[field.key] || '',
      }),
      {}
    )
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: Record<string, any> = {};
      fields.forEach((field) => {
        if (editValues[field.key] !== lead[field.key]) {
          updates[field.key] = editValues[field.key] || null;
        }
      });

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        setIsSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from('dcf_leads')
        .update(updates)
        .eq('lead_id', lead.lead_id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating lead:', error);
        alert('Failed to update lead');
      } else if (data) {
        onLeadUpdate(data as Lead);
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValues(
      fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.key]: lead[field.key] || '',
        }),
        {}
      )
    );
    setIsEditing(false);
  };

  const accentColorMap = {
    cyan: 'text-cyan-400 hover:text-cyan-300',
    purple: 'text-purple-400 hover:text-purple-300',
  };

  return (
    <section className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={accentColorMap[accentColor as keyof typeof accentColorMap]}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              handleCancel();
            } else {
              setIsEditing(true);
            }
          }}
          className={`p-1.5 rounded transition-colors ${
            isEditing
              ? 'text-red-400 hover:bg-red-500/20'
              : `${accentColorMap[accentColor as keyof typeof accentColorMap]} hover:bg-gray-700/50`
          }`}
          title={isEditing ? 'Cancel' : 'Edit'}
        >
          {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
              <input
                type={field.type || 'text'}
                value={editValues[field.key] || ''}
                onChange={(e) =>
                  setEditValues((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              />
            </div>
          ))}
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-2 text-sm bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => {
            const value = lead[field.key];
            const displayValue = value || '—';
            const isUrl = field.type === 'url' && value;

            return (
              <div key={field.key}>
                <span className="text-sm text-gray-400">{field.label}</span>
                {isUrl ? (
                  <a
                    href={value as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-gray-300 hover:${accentColor === 'purple' ? 'text-purple-400' : 'text-cyan-400'} transition-colors break-all`}
                  >
                    {displayValue}
                  </a>
                ) : (
                  <p className="text-white font-medium break-all">{displayValue}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
