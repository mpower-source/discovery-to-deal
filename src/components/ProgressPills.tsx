import { Lead } from '../lib/supabase';

interface ProgressPillsProps {
  lead: Lead;
}

interface PillProps {
  active: boolean;
  label: string;
}

function Pill({ active, label }: PillProps) {
  return (
    <div
      className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        active
          ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
          : 'bg-gray-700/30 text-gray-500 border border-gray-700/50'
      }`}
      title={label}
    >
      {label}
    </div>
  );
}

export function ProgressPills({ lead }: ProgressPillsProps) {
  const leadMagnetSteps = [
    { active: lead.lm_started, label: 'Started' },
    { active: lead.lm_contact_profile_scraped, label: 'Contact' },
    { active: lead.lm_company_profile_scraped, label: 'Company' },
    { active: lead.lm_website_scraped, label: 'Website' },
    { active: lead.lm_brief_generated, label: 'Brief' },
    { active: lead.lm_doc_uploaded, label: 'Doc' },
  ];

  const discoverySteps = [
    { active: lead.dc_started, label: 'Started' },
    { active: lead.dc_generated, label: 'Generated' },
    { active: lead.dc_doc_uploaded, label: 'Doc' },
  ];

  const proposalSteps = [
    { active: lead.pr_started, label: 'Started' },
    { active: lead.pr_generated, label: 'Generated' },
    { active: lead.pr_doc_uploaded, label: 'Doc' },
  ];

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-medium text-gray-400 mb-2">Lead Magnet</div>
        <div className="flex flex-wrap gap-2">
          {leadMagnetSteps.map((step, i) => (
            <Pill key={i} active={step.active} label={step.label} />
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-gray-400 mb-2">Discovery Call</div>
        <div className="flex flex-wrap gap-2">
          {discoverySteps.map((step, i) => (
            <Pill key={i} active={step.active} label={step.label} />
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-gray-400 mb-2">Proposal</div>
        <div className="flex flex-wrap gap-2">
          {proposalSteps.map((step, i) => (
            <Pill key={i} active={step.active} label={step.label} />
          ))}
        </div>
      </div>
    </div>
  );
}
