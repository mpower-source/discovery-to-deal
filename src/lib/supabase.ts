import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export interface Lead {
  lead_id: string;
  created_at: string;
  updated_at: string;
  contact_name: string;
  contact_linkedin: string;
  contact_email: string;
  contact_phone: string;
  company_name: string;
  company_linkedin: string | null;
  company_website: string | null;
  contact_linkedin_raw: any;
  company_linkedin_raw: any;
  company_website_text: string | null;
  lm_started: boolean;
  lm_contact_profile_scraped: boolean;
  lm_company_profile_scraped: boolean;
  lm_website_scraped: boolean;
  lm_brief_generated: boolean;
  lm_doc_uploaded: boolean;
  lm_doc_url: string | null;
  dc_started: boolean;
  dc_generated: boolean;
  dc_doc_uploaded: boolean;
  dc_doc_url: string | null;
  dc_call_transcript: string | null;
  dc_call_summary: string | null;
  dc_call_transcript_url: string | null;
  pr_started: boolean;
  pr_generated: boolean;
  pr_doc_uploaded: boolean;
  pr_doc_url: string | null;
  dc_call_completed: boolean;
  deal_closed: boolean;
  closed_date: string | null;
  last_error: string | null;
}

export type LeadStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Error';

export function getLeadStatus(lead: Lead): LeadStatus {
  if (lead.last_error) return 'Error';

  if (lead.lm_doc_url && lead.dc_doc_url && lead.pr_doc_url) {
    return 'Completed';
  }

  if (
    lead.lm_started ||
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
    lead.pr_doc_uploaded
  ) {
    return 'In Progress';
  }

  return 'Not Started';
}

export function computeOverallProgress(lead: Lead): number {
  const steps = [
    lead.lm_started,
    lead.lm_contact_profile_scraped,
    lead.lm_company_profile_scraped,
    lead.lm_website_scraped,
    lead.lm_brief_generated,
    lead.lm_doc_uploaded,
    lead.dc_started,
    lead.dc_generated,
    lead.dc_doc_uploaded,
    lead.pr_started,
    lead.pr_generated,
    lead.pr_doc_uploaded,
  ];

  const completedSteps = steps.filter(Boolean).length;
  return Math.round((completedSteps / steps.length) * 100);
}

export function getLeadMagnetProgress(lead: Lead): { completed: number; total: number } {
  const steps = [
    lead.lm_started,
    lead.lm_contact_profile_scraped,
    lead.lm_company_profile_scraped,
    lead.lm_website_scraped,
    lead.lm_brief_generated,
    lead.lm_doc_uploaded,
  ];
  return {
    completed: steps.filter(Boolean).length,
    total: steps.length,
  };
}

export function getDiscoveryCallProgress(lead: Lead): { completed: number; total: number } {
  const steps = [lead.dc_started, lead.dc_generated, lead.dc_doc_uploaded];
  return {
    completed: steps.filter(Boolean).length,
    total: steps.length,
  };
}

export function getProposalProgress(lead: Lead): { completed: number; total: number } {
  const steps = [lead.pr_started, lead.pr_generated, lead.pr_doc_uploaded];
  return {
    completed: steps.filter(Boolean).length,
    total: steps.length,
  };
}

export function cleanTranscriptText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[^\x20-\x7E\n\t]/g, '')
    .trim();
}

export async function uploadTranscriptFile(
  leadId: string,
  file: File
): Promise<{ url: string; transcript: string; error?: string }> {
  try {
    if (!file.name.endsWith('.txt')) {
      throw new Error('Only .txt files are allowed');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    const rawText = await file.text();
    const transcriptText = cleanTranscriptText(rawText);
    const timestamp = new Date().getTime();
    const fileName = `${leadId}/${timestamp}-transcript.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dcf_transcript')
      .upload(fileName, file, {
        contentType: 'text/plain',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('dcf_transcript')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('dcf_leads')
      .update({
        dc_call_transcript: transcriptText,
        dc_call_transcript_url: urlData.publicUrl,
      })
      .eq('lead_id', leadId);

    if (updateError) throw updateError;

    return {
      url: urlData.publicUrl,
      transcript: transcriptText,
    };
  } catch (error: any) {
    console.error('Error uploading transcript:', error);
    return {
      url: '',
      transcript: '',
      error: error.message || 'Failed to upload transcript',
    };
  }
}
