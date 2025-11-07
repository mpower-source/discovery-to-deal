import { Mail, Phone, ExternalLink, Copy, Rocket, FileText, CheckCircle } from 'lucide-react';
import { Lead, getLeadStatus, computeOverallProgress } from '../lib/supabase';
import { StatusBadge } from './StatusBadge';
import { ProgressPills } from './ProgressPills';

interface LeadCardProps {
  lead: Lead;
  onTriggerWorkflow: (leadId: string, workflow: 'leadMagnet' | 'discoveryCall' | 'proposal') => void;
  loadingStates: Record<string, boolean>;
  onLeadClick: (lead: Lead) => void;
}

export function LeadCard({ lead, onTriggerWorkflow, loadingStates, onLeadClick }: LeadCardProps) {
  const status = getLeadStatus(lead);
  const progress = computeOverallProgress(lead);
  const initials = lead.contact_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20 shadow-xl hover:border-cyan-500/40 transition-all group cursor-pointer"
      onClick={() => onLeadClick(lead)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-lg">
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-white">{lead.contact_name}</h3>
              <p className="text-sm text-gray-400">{lead.company_name}</p>
            </div>
          </div>
          <StatusBadge status={status} errorMessage={lead.last_error} />
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-3 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              {progress}%
            </span>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <a
            href={`mailto:${lead.contact_email}`}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors"
          >
            <Mail className="w-4 h-4" />
            {lead.contact_email}
          </a>
          <a
            href={`tel:${lead.contact_phone}`}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {lead.contact_phone}
          </a>
          {lead.contact_linkedin && (
            <a
              href={lead.contact_linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Contact LinkedIn
            </a>
          )}
          {lead.company_linkedin && (
            <a
              href={lead.company_linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Company LinkedIn
            </a>
          )}
          {lead.company_website && (
            <a
              href={lead.company_website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Website
            </a>
          )}
        </div>

        <div className="mb-4 pt-4 border-t border-gray-700/50">
          <ProgressPills lead={lead} />
        </div>

        <div className="flex gap-2 mb-4">
          {lead.lm_doc_url && (
            <a
              href={lead.lm_doc_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium text-center"
            >
              Lead Magnet
            </a>
          )}
          {lead.dc_doc_url && (
            <a
              href={lead.dc_doc_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium text-center"
            >
              Discovery
            </a>
          )}
          {lead.pr_doc_url && (
            <a
              href={lead.pr_doc_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm font-medium text-center"
            >
              Proposal
            </a>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(lead.lead_id);
            }}
            className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium"
            title="Copy Lead ID"
          >
            <Copy className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTriggerWorkflow(lead.lead_id, 'leadMagnet');
            }}
            disabled={loadingStates[`${lead.lead_id}-leadMagnet`]}
            className="flex-1 py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            title="Create Lead Magnet"
          >
            {loadingStates[`${lead.lead_id}-leadMagnet`] ? (
              <div className="w-4 h-4 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Rocket className="w-4 h-4 mx-auto" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTriggerWorkflow(lead.lead_id, 'discoveryCall');
            }}
            disabled={loadingStates[`${lead.lead_id}-discoveryCall`]}
            className="flex-1 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            title="Create Discovery Call"
          >
            {loadingStates[`${lead.lead_id}-discoveryCall`] ? (
              <div className="w-4 h-4 mx-auto border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mx-auto" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTriggerWorkflow(lead.lead_id, 'proposal');
            }}
            disabled={loadingStates[`${lead.lead_id}-proposal`]}
            className="flex-1 py-2 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            title="Create Proposal"
          >
            {loadingStates[`${lead.lead_id}-proposal`] ? (
              <div className="w-4 h-4 mx-auto border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mx-auto" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
