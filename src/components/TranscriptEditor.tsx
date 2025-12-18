import { useState } from 'react';
import { supabase, Lead, uploadTranscriptFile, cleanTranscriptText } from '../lib/supabase';
import { Edit2, Check, X, FileText, Download } from 'lucide-react';

interface TranscriptEditorProps {
  lead: Lead;
  onLeadUpdate: (updatedLead: Lead) => void;
}

export function TranscriptEditor({ lead, onLeadUpdate }: TranscriptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(lead.dc_call_transcript || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveTranscript = async () => {
    const cleanedTranscript = cleanTranscriptText(editedTranscript);

    if (cleanedTranscript === lead.dc_call_transcript?.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('dcf_leads')
        .update({
          dc_call_transcript: cleanedTranscript || null,
        })
        .eq('lead_id', lead.lead_id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating transcript:', error);
        alert('Failed to update transcript');
      } else if (data) {
        onLeadUpdate(data as Lead);
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadTranscriptFile(lead.lead_id, file);

      if (result.error) {
        alert(`Upload failed: ${result.error}`);
      } else {
        setEditedTranscript(result.transcript);
        const { data, error } = await supabase
          .from('dcf_leads')
          .select()
          .eq('lead_id', lead.lead_id)
          .maybeSingle();

        if (!error && data) {
          onLeadUpdate(data as Lead);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setEditedTranscript(lead.dc_call_transcript || '');
    setIsEditing(false);
  };

  const handleDownloadTranscript = () => {
    if (!lead.dc_call_transcript) return;

    const cleanedText = cleanTranscriptText(lead.dc_call_transcript);
    const blob = new Blob([cleanedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${lead.contact_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasTranscript = !!lead.dc_call_transcript;

  return (
    <section className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Discovery Call Transcript</h3>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              handleCancel();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={isUploading}
          className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
            isEditing
              ? 'text-red-400 hover:bg-red-500/20'
              : 'text-blue-400 hover:bg-gray-700/50'
          }`}
          title={isEditing ? 'Cancel' : 'Edit'}
        >
          {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Upload New Transcript (Optional)</label>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-500/20 file:text-blue-400
                hover:file:bg-blue-500/30
                disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Transcript Text</label>
            <textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              placeholder="Enter or paste transcript text here..."
              rows={12}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              disabled={isSaving || isUploading}
              className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTranscript}
              disabled={isSaving || isUploading}
              className="px-3 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      ) : hasTranscript ? (
        <div className="space-y-3">
          <button
            onClick={handleDownloadTranscript}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download Transcript
          </button>
          <div className="bg-gray-700/30 rounded-lg p-4 max-h-96 overflow-y-auto">
            <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {cleanTranscriptText(lead.dc_call_transcript || '')}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No transcript available</p>
          <p className="text-gray-500 text-sm">Click edit to upload or add a transcript</p>
        </div>
      )}
    </section>
  );
}
