import { supabase } from './supabase';

export type ProposalFormData = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  serviceRequired: string;
  targetMarket: string;
  productName: string;
  productCategory: string;
  proposalNotes: string;
  acceptedFeeReview: boolean;
  documentNames: string[];
};

export async function createServiceProposal(formData: ProposalFormData) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.');
  }

  const { data, error } = await supabase
    .from('service_proposals')
    .insert({
      company_name: formData.companyName,
      contact_person: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      service_required: formData.serviceRequired,
      target_market: formData.targetMarket,
      product_name: formData.productName,
      product_category: formData.productCategory,
      proposal_notes: formData.proposalNotes,
      accepted_fee_review: formData.acceptedFeeReview,
      document_names: formData.documentNames,
      status: 'Proposal submitted',
      fee_status: 'Pending review',
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
