import { CheckCircle, Circle, Rocket, Search, Gift, Calendar, Handshake, FileText, Trophy, Upload } from 'lucide-react';
import { Lead, supabase, uploadTranscriptFile } from '../lib/supabase';
import { useState, useRef, useEffect } from 'react';

interface ProgressJourneyProps {
  lead: Lead;
  onLeadUpdate?: (updatedLead: Lead) => void;
}

interface Stage {
  id: number;
  title: string;
  icon: React.ReactNode;
  isComplete: boolean;
  isActive: boolean;
  description: string;
  timestamp?: string;
  docUrl?: string | null;
  manualToggle?: boolean;
  onToggle?: () => void;
}

export function ProgressJourney({ lead, onLeadUpdate }: ProgressJourneyProps) {
  const [currentLead, setCurrentLead] = useState<Lead>(lead);
  const [updating, setUpdating] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when lead prop changes
  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  // Subscribe to real-time updates for this specific lead
  useEffect(() => {
    const channel = supabase
      .channel(`lead-${lead.lead_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dcf_leads',
          filter: `lead_id=eq.${lead.lead_id}`,
        },
        (payload) => {
          console.log(`ProgressJourney: Real-time update for lead ${lead.lead_id}`, payload);
          const updatedLead = payload.new as Lead;
          setCurrentLead(updatedLead);
          if (onLeadUpdate) {
            onLeadUpdate(updatedLead);
          }
        }
      )
      .subscribe((status) => {
        console.log(`ProgressJourney: Subscription status for lead ${lead.lead_id}:`, status);
      });

    return () => {
      console.log(`ProgressJourney: Cleaning up subscription for lead ${lead.lead_id}`);
      supabase.removeChannel(channel);
    };
  }, [lead.lead_id, onLeadUpdate]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUpdating('transcript_upload');
    setUploadError(null);

    const result = await uploadTranscriptFile(currentLead.lead_id, file);

    if (result.error) {
      setUploadError(result.error);
      setUpdating(null);
      return;
    }

    // Optimistically update local state immediately
    const updatedLead = {
      ...currentLead,
      dc_call_transcript: result.transcript,
      dc_call_transcript_url: result.url
    };
    setCurrentLead(updatedLead);
    if (onLeadUpdate) {
      onLeadUpdate(updatedLead);
    }

    setUpdating(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleToggleCallCompleted = async () => {
    setUpdating('dc_call_completed');
    const newValue = !currentLead.dc_call_completed;

    const { error } = await supabase
      .from('dcf_leads')
      .update({ dc_call_completed: newValue })
      .eq('lead_id', currentLead.lead_id);

    if (error) {
      console.error('Error updating dc_call_completed:', error);
    } else {
      // Optimistically update local state immediately
      const updatedLead = { ...currentLead, dc_call_completed: newValue };
      setCurrentLead(updatedLead);
      if (onLeadUpdate) {
        onLeadUpdate(updatedLead);
      }
    }
    setUpdating(null);
  };

  const handleToggleDealClosed = async () => {
    setUpdating('deal_closed');
    const newValue = !currentLead.deal_closed;
    const updateData: any = { deal_closed: newValue };

    if (newValue && !currentLead.closed_date) {
      updateData.closed_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('dcf_leads')
      .update(updateData)
      .eq('lead_id', currentLead.lead_id);

    if (error) {
      console.error('Error updating deal_closed:', error);
    } else {
      // Optimistically update local state immediately
      const updatedLead = {
        ...currentLead,
        deal_closed: newValue,
        closed_date: updateData.closed_date || currentLead.closed_date
      };
      setCurrentLead(updatedLead);
      if (onLeadUpdate) {
        onLeadUpdate(updatedLead);
      }
    }
    setUpdating(null);
  };

  const researchComplete = currentLead.lm_contact_profile_scraped && currentLead.lm_company_profile_scraped && currentLead.lm_website_scraped;
  const researchInProgress = currentLead.lm_started && !researchComplete;

  const stages: Stage[] = [
    {
      id: 1,
      title: 'Lead Captured',
      icon: <Circle className="w-5 h-5" />,
      isComplete: true,
      isActive: false,
      description: 'Contact information collected',
      timestamp: currentLead.created_at,
    },
    {
      id: 2,
      title: 'Research & Intelligence',
      icon: <Search className="w-5 h-5" />,
      isComplete: researchComplete,
      isActive: researchInProgress,
      description: 'Profile and company data gathered',
      timestamp: researchComplete ? currentLead.updated_at : undefined,
    },
    {
      id: 3,
      title: 'Lead Magnet Created',
      icon: <Gift className="w-5 h-5" />,
      isComplete: !!currentLead.lm_doc_url,
      isActive: currentLead.lm_brief_generated && !currentLead.lm_doc_url,
      description: 'Personalized value document ready',
      timestamp: currentLead.lm_doc_url ? currentLead.updated_at : undefined,
      docUrl: currentLead.lm_doc_url,
    },
    {
      id: 4,
      title: 'Discovery Call Prepared',
      icon: <Calendar className="w-5 h-5" />,
      isComplete: !!currentLead.dc_doc_url,
      isActive: currentLead.dc_started && !currentLead.dc_doc_url,
      description: 'Strategic framework ready',
      timestamp: currentLead.dc_doc_url ? currentLead.updated_at : undefined,
      docUrl: currentLead.dc_doc_url,
    },
    {
      id: 5,
      title: 'Discovery Call Completed',
      icon: <Handshake className="w-5 h-5" />,
      isComplete: currentLead.dc_call_completed,
      isActive: !!currentLead.dc_doc_url && !currentLead.dc_call_completed,
      description: 'Needs identified, rapport built',
      manualToggle: true,
      onToggle: handleToggleCallCompleted,
    },
    {
      id: 6,
      title: 'Proposal Delivered',
      icon: <FileText className="w-5 h-5" />,
      isComplete: !!currentLead.pr_doc_url,
      isActive: currentLead.pr_started && !currentLead.pr_doc_url,
      description: 'Customized solution presented',
      timestamp: currentLead.pr_doc_url ? currentLead.updated_at : undefined,
      docUrl: currentLead.pr_doc_url,
    },
    {
      id: 7,
      title: 'Deal Closed',
      icon: <Trophy className="w-5 h-5" />,
      isComplete: currentLead.deal_closed,
      isActive: !!currentLead.pr_doc_url && !currentLead.deal_closed,
      description: 'Client signed and onboarded',
      timestamp: currentLead.closed_date || undefined,
      manualToggle: true,
      onToggle: handleToggleDealClosed,
    },
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
          Discovery to Deal Journey
        </h3>
        <p className="text-sm text-gray-400">Track progress from capture to closure</p>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="relative">
            {index < stages.length - 1 && (
              <div
                className={`absolute left-6 top-12 w-0.5 h-8 transition-all duration-500 ${
                  stage.isComplete
                    ? 'bg-gradient-to-b from-cyan-500 to-purple-500'
                    : 'bg-gray-700'
                }`}
              />
            )}

            <div
              className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                stage.isComplete
                  ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30'
                  : stage.isActive
                  ? 'bg-yellow-500/5 border-yellow-500/30 animate-pulse'
                  : 'bg-gray-800/30 border-gray-700/30'
              }`}
            >
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  stage.isComplete
                    ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                    : stage.isActive
                    ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50'
                    : 'bg-gray-700/50 text-gray-500 border-2 border-gray-700'
                }`}
              >
                {stage.isComplete ? <CheckCircle className="w-6 h-6" /> : stage.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4
                    className={`font-semibold transition-colors ${
                      stage.isComplete
                        ? 'text-cyan-400'
                        : stage.isActive
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {stage.title}
                  </h4>
                  {stage.timestamp && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDate(stage.timestamp)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-400 mb-2">{stage.description}</p>

                <div className="flex flex-wrap gap-2">
                  {stage.docUrl && (
                    <a
                      href={stage.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      View Document
                    </a>
                  )}

                  {stage.id === 5 && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {currentLead.dc_call_transcript_url && (
                        <a
                          href={currentLead.dc_call_transcript_url}
                          download
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          View Transcript
                        </a>
                      )}

                      {!currentLead.dc_call_transcript_url && (
                        <button
                          onClick={handleUploadClick}
                          disabled={updating === 'transcript_upload'}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {updating === 'transcript_upload' ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-3 h-3" />
                              Upload Transcript
                            </>
                          )}
                        </button>
                      )}

                      {uploadError && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium">
                          {uploadError}
                        </span>
                      )}
                    </>
                  )}

                  {stage.manualToggle && (
                    <button
                      onClick={stage.onToggle}
                      disabled={
                        (stage.id === 5 && !currentLead.dc_call_transcript_url) ||
                        updating === (stage.id === 5 ? 'dc_call_completed' : 'deal_closed')
                      }
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        stage.isComplete
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={stage.id === 5 && !currentLead.dc_call_transcript_url ? 'Upload transcript first' : ''}
                    >
                      {updating === (stage.id === 5 ? 'dc_call_completed' : 'deal_closed') ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {stage.isComplete ? 'Mark Incomplete' : 'Mark Complete'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Overall Progress</span>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {stages.filter((s) => s.isComplete).length} of {stages.length} Complete
          </span>
        </div>
        <div className="mt-2 h-2 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 relative overflow-hidden"
            style={{ width: `${(stages.filter((s) => s.isComplete).length / stages.length) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
