import { useEffect, useState } from 'react';
import { Plus, Search, Grid, List, AlertCircle } from 'lucide-react';
import { supabase, Lead } from './lib/supabase';
import { postToWebhook, getWebhookUrls } from './lib/webhooks';
import { AddLeadDialog } from './components/AddLeadDialog';
import { LeadsTable } from './components/LeadsTable';
import { LeadCard } from './components/LeadCard';
import { LeadDetailModal } from './components/LeadDetailModal';
import { Logo } from './components/Logo';

type ViewMode = 'table' | 'grid';
type FilterStatus = 'all' | 'not-started' | 'in-progress' | 'completed' | 'error';

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [showEnvBanner, setShowEnvBanner] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const webhooks = getWebhookUrls();
    const hasEnv =
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY &&
      webhooks.leadMagnet &&
      webhooks.discoveryCall &&
      webhooks.proposal;
    setShowEnvBanner(!hasEnv);
  }, []);

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel('dcf-leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dcf_leads' }, (payload) => {
        console.log('Real-time event received:', payload.eventType, payload);
        if (payload.eventType === 'INSERT') {
          setLeads((prev) => [payload.new as Lead, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLeads((prev) =>
            prev.map((lead) => (lead.lead_id === payload.new.lead_id ? (payload.new as Lead) : lead))
          );
        } else if (payload.eventType === 'DELETE') {
          setLeads((prev) => prev.filter((lead) => lead.lead_id !== payload.old.lead_id));
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = [...leads];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.contact_name.toLowerCase().includes(query) ||
          lead.company_name.toLowerCase().includes(query) ||
          lead.contact_email.toLowerCase().includes(query) ||
          lead.contact_phone.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((lead) => {
        const hasError = !!lead.last_error;
        const isCompleted = !!(lead.lm_doc_url && lead.dc_doc_url && lead.pr_doc_url);
        const isInProgress =
          !isCompleted &&
          (lead.lm_started ||
            lead.lm_contact_profile_scraped ||
            lead.lm_company_profile_scraped ||
            lead.lm_website_scraped ||
            lead.lm_brief_generated ||
            lead.lm_doc_uploaded ||
            lead.dc_started ||
            lead.dc_generated ||
            lead.dc_doc_uploaded ||
            lead.pr_started ||
            lead.pr_generated ||
            lead.pr_doc_uploaded);

        if (filterStatus === 'error') return hasError;
        if (filterStatus === 'completed') return isCompleted;
        if (filterStatus === 'in-progress') return isInProgress;
        if (filterStatus === 'not-started') return !isInProgress && !isCompleted && !hasError;
        return true;
      });
    }

    setFilteredLeads(filtered);
  }, [leads, searchQuery, filterStatus]);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dcf_leads')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching leads:', error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const handleTriggerWorkflow = async (
    leadId: string,
    workflow: 'leadMagnet' | 'discoveryCall' | 'proposal'
  ) => {
    const key = `${leadId}-${workflow}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));

    try {
      const webhooks = getWebhookUrls();
      const url =
        workflow === 'leadMagnet'
          ? webhooks.leadMagnet
          : workflow === 'discoveryCall'
          ? webhooks.discoveryCall
          : webhooks.proposal;

      const lead = leads.find((l) => l.lead_id === leadId);
      const additionalData: Record<string, any> = {};

      if (workflow === 'proposal' && lead?.dc_call_transcript_url) {
        additionalData.dc_call_transcript_url = lead.dc_call_transcript_url;
        additionalData.dc_call_transcript = lead.dc_call_transcript;
      }

      await postToWebhook(url, leadId, additionalData);
    } catch (error) {
      console.error(`Failed to trigger ${workflow}:`, error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsDialogOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg2LDE4MiwyMTIsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-purple-500/5" />

      {showEnvBanner && (
        <div className="relative z-10 bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-200">
              Some environment variables are missing. Please configure VITE_N8N_WEBHOOK_* variables in your
              .env file for full functionality.
            </p>
            <button
              onClick={() => setShowEnvBanner(false)}
              className="ml-auto text-yellow-200 hover:text-yellow-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <header className="border-b border-cyan-500/20 backdrop-blur-xl bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <Logo size="medium" animated={true} showText={true} />
              <button
                onClick={() => setIsDialogOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Lead
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="error">Error</option>
                </select>

                <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'table'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    title="Table View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <Plus className="w-12 h-12 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-300 mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No leads found' : 'No leads yet'}
              </h2>
              <p className="text-gray-400 mb-6">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first lead'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Lead
                </button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl overflow-hidden">
              <LeadsTable
                leads={filteredLeads}
                onTriggerWorkflow={handleTriggerWorkflow}
                loadingStates={loadingStates}
                onLeadClick={setSelectedLead}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.lead_id}
                  lead={lead}
                  onTriggerWorkflow={handleTriggerWorkflow}
                  loadingStates={loadingStates}
                  onLeadClick={setSelectedLead}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <AddLeadDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          fetchLeads();
        }}
      />

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onTriggerWorkflow={handleTriggerWorkflow}
          loadingStates={loadingStates}
        />
      )}
    </div>
  );
}

export default App;
