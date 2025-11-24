// Local storage utilities for prototype
export interface Dispute {
  id: string;
  caseId: string;
  applicant: {
    name: string;
    phone: string;
    email: string;
    address: string;
    income: string;
  };
  respondent: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  contractType: string;
  resolutionType: 'arbitration' | 'mediation' | 'negotiation' | 'conciliation' | 'legal_aid';
  disputeDescription: string;
  documents?: string[];
  filedDate: string;
  status: string;
  mediator?: string;
  assignedProfessionalId?: string;
  nextHearing?: string;
  legalAidEligible: boolean;
  updates: Array<{
    date: string;
    title: string;
    description: string;
    status: string;
  }>;
}

export interface Professional {
  id: string;
  name: string;
  type: 'arbitrator' | 'mediator' | 'legal_aid_advocate';
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  status: 'active' | 'inactive';
  casesHandled: number;
  createdAt: string;
}

const DISPUTES_KEY = 'enyaya_disputes';
const PROFESSIONALS_KEY = 'enyaya_professionals';

// Dispute methods
export const saveDispute = (dispute: Dispute): void => {
  const disputes = getDisputes();
  disputes.push(dispute);
  localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));
};

export const getDisputes = (): Dispute[] => {
  const data = localStorage.getItem(DISPUTES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getDisputeById = (id: string): Dispute | undefined => {
  const disputes = getDisputes();
  return disputes.find(d => d.id === id || d.caseId === id);
};

export const updateDispute = (id: string, updates: Partial<Dispute>): void => {
  const disputes = getDisputes();
  const index = disputes.findIndex(d => d.id === id);
  if (index !== -1) {
    disputes[index] = { ...disputes[index], ...updates };
    localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));
  }
};

// Professional methods
export const saveProfessional = (professional: Professional): void => {
  const professionals = getProfessionals();
  professionals.push(professional);
  localStorage.setItem(PROFESSIONALS_KEY, JSON.stringify(professionals));
};

export const getProfessionals = (): Professional[] => {
  const data = localStorage.getItem(PROFESSIONALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getProfessionalById = (id: string): Professional | undefined => {
  const professionals = getProfessionals();
  return professionals.find(p => p.id === id);
};

export const updateProfessional = (id: string, updates: Partial<Professional>): void => {
  const professionals = getProfessionals();
  const index = professionals.findIndex(p => p.id === id);
  if (index !== -1) {
    professionals[index] = { ...professionals[index], ...updates };
    localStorage.setItem(PROFESSIONALS_KEY, JSON.stringify(professionals));
  }
};

export const deleteProfessional = (id: string): void => {
  const professionals = getProfessionals();
  const filtered = professionals.filter(p => p.id !== id);
  localStorage.setItem(PROFESSIONALS_KEY, JSON.stringify(filtered));
};

export const generateCaseId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `ODR/${year}/${random}`;
};
