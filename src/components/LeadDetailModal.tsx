import { X, Mail, Phone, ExternalLink, Copy, Rocket, CheckCircle, FileText, Building, User, Globe, Calendar, AlertCircle } from 'lucide-react';
import { Lead } from '../lib/supabase';
import { ProgressJourney } from './ProgressJourney';
import { StatusBadge } from './StatusBadge';
import { useEffect, useState } from 'react';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onTriggerWorkflow: (leadId: string, workflow: 'leadMagnet' | 'discoveryCall' | 'proposal') => void;
  loadingStates: Record<string, boolean>;
}

export function LeadDetailModal({ lead, onClose, onTriggerWorkflow, loadingStates }: LeadDetailModalProps) {
  const [currentLead, setCurrentLead] = useState<Lead>(lead);

  // Update local state when lead prop changes (from parent's real-time subscription)
  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  // Handle updates from ProgressJourney component
  const handleLeadUpdate = (updatedLead: Lead) => {
    setCurrentLead(updatedLead);
  };
  const initials = currentLead.contact_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-cyan-500/30 shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gray-900/50 backdrop-blur-xl rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{currentLead.contact_name}</h2>
              <p className="text-gray-400 flex items-center gap-2">
                <Building className="w-4 h-4" />
                {currentLead.company_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={currentLead.last_error ? 'Error' : currentLead.deal_closed ? 'Completed' : 'In Progress'} errorMessage={currentLead.last_error} />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 lg:w-[60%] overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <section className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/40">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Contact Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <a
                    href={`mailto:${currentLead.contact_email}`}
                    className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{currentLead.contact_email}</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(currentLead.contact_email, 'Email')}
                    className="p-1.5 hover:bg-gray-700/50 rounded text-gray-400 hover:text-cyan-400 transition-colors"
                    title="Copy email"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <a
                    href={`tel:${currentLead.contact_phone}`}
                    className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{currentLead.contact_phone}</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(currentLead.contact_phone, 'Phone')}
                    className="p-1.5 hover:bg-gray-700/50 rounded text-gray-400 hover:text-cyan-400 transition-colors"
                    title="Copy phone"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {currentLead.contact_linkedin && (
                  <a
                    href={currentLead.contact_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </section>

            <section className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/40">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Company Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Company Name</span>
                  <p className="text-white font-medium">{currentLead.company_name}</p>
                </div>
                {currentLead.company_website && (
                  <a
                    href={currentLead.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Company Website</span>
                  </a>
                )}
                {currentLead.company_linkedin && (
                  <a
                    href={currentLead.company_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Company LinkedIn</span>
                  </a>
                )}
              </div>
            </section>

            <section className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/40">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Workflow Actions</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => onTriggerWorkflow(currentLead.lead_id, 'leadMagnet')}
                  disabled={loadingStates[`${currentLead.lead_id}-leadMagnet`]}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {loadingStates[`${currentLead.lead_id}-leadMagnet`] ? (
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      <span>Lead Magnet</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onTriggerWorkflow(currentLead.lead_id, 'discoveryCall')}
                  disabled={loadingStates[`${currentLead.lead_id}-discoveryCall`]}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {loadingStates[`${currentLead.lead_id}-discoveryCall`] ? (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Discovery Call</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onTriggerWorkflow(currentLead.lead_id, 'proposal')}
                  disabled={loadingStates[`${currentLead.lead_id}-proposal`]}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {loadingStates[`${currentLead.lead_id}-proposal`] ? (
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {currentLead.last_error && (
              <section className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
                    <p className="text-red-300 text-sm">{currentLead.last_error}</p>
                  </div>
                </div>
              </section>
            )}

            <section className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/40">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">Timeline</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-gray-300">{formatDate(currentLead.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-gray-300">{formatDate(currentLead.updated_at)}</span>
                </div>
                {currentLead.closed_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Closed</span>
                    <span className="text-green-400 font-medium">{formatDate(currentLead.closed_date)}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/40">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400">Lead ID</h3>
                <button
                  onClick={() => copyToClipboard(currentLead.lead_id, 'Lead ID')}
                  className="p-1.5 hover:bg-gray-700/50 rounded text-gray-400 hover:text-cyan-400 transition-colors"
                  title="Copy Lead ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <code className="text-xs text-gray-500 break-all">{currentLead.lead_id}</code>
            </section>
          </div>

          <div className="hidden lg:block lg:w-[40%] border-l border-cyan-500/20 bg-gray-900/30 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <ProgressJourney lead={currentLead} onLeadUpdate={handleLeadUpdate} />
          </div>
        </div>

        <div className="lg:hidden border-t border-cyan-500/20 bg-gray-900/30 overflow-y-auto px-6 py-6 max-h-[40vh] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <ProgressJourney lead={currentLead} onLeadUpdate={handleLeadUpdate} />
        </div>
      </div>
    </div>
  );
}
