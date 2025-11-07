import { Mail, Phone, ExternalLink, Copy, Rocket, FileText, CheckCircle } from 'lucide-react';
import { Lead, getLeadStatus, computeOverallProgress } from '../lib/supabase';
import { StatusBadge } from './StatusBadge';

interface LeadsTableProps {
  leads: Lead[];
  onTriggerWorkflow: (leadId: string, workflow: 'leadMagnet' | 'discoveryCall' | 'proposal') => void;
  loadingStates: Record<string, boolean>;
  onLeadClick: (lead: Lead) => void;
}

export function LeadsTable({ leads, onTriggerWorkflow, loadingStates, onLeadClick }: LeadsTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700/50">
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Lead</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Contact</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Company</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Progress</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Documents</th>
            <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const status = getLeadStatus(lead);
            const progress = computeOverallProgress(lead);
            const initials = lead.contact_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <tr
                key={lead.lead_id}
                className="border-b border-gray-700/30 hover:bg-cyan-500/5 transition-colors group cursor-pointer"
                onClick={() => onLeadClick(lead)}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                      {initials}
                    </div>
                    <div>
                      <div className="font-medium text-white">{lead.contact_name}</div>
                      <div className="text-sm text-gray-400">{lead.company_name}</div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="space-y-1">
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
                        LinkedIn
                      </a>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="space-y-1">
                    {lead.company_linkedin && (
                      <a
                        href={lead.company_linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        LinkedIn
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
                </td>

                <td className="py-4 px-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-300 w-12">{progress}%</span>
                    </div>
                    <StatusBadge status={status} errorMessage={lead.last_error} />
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    {lead.lm_doc_url && (
                      <a
                        href={lead.lm_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        title="Lead Magnet"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    {lead.dc_doc_url && (
                      <a
                        href={lead.dc_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="Discovery Call"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    {lead.pr_doc_url && (
                      <a
                        href={lead.pr_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                        title="Proposal"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(lead.lead_id);
                      }}
                      className="p-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                      title="Copy Lead ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerWorkflow(lead.lead_id, 'leadMagnet');
                      }}
                      disabled={loadingStates[`${lead.lead_id}-leadMagnet`]}
                      className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors disabled:opacity-50"
                      title="Create Lead Magnet"
                    >
                      {loadingStates[`${lead.lead_id}-leadMagnet`] ? (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Rocket className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerWorkflow(lead.lead_id, 'discoveryCall');
                      }}
                      disabled={loadingStates[`${lead.lead_id}-discoveryCall`]}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50"
                      title="Create Discovery Call"
                    >
                      {loadingStates[`${lead.lead_id}-discoveryCall`] ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerWorkflow(lead.lead_id, 'proposal');
                      }}
                      disabled={loadingStates[`${lead.lead_id}-proposal`]}
                      className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50"
                      title="Create Proposal"
                    >
                      {loadingStates[`${lead.lead_id}-proposal`] ? (
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
