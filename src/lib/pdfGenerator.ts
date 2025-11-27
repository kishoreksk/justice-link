import jsPDF from 'jspdf';

export interface AwardPDFData {
  caseId: string;
  applicantName: string;
  respondentName: string;
  resolutionType: string;
  documentType: string;
  mediatorName: string;
  meetingsCount: number;
  finalDate: string;
  documentsSubmitted: Array<{
    submittedBy: string;
    documentName: string;
    description?: string;
  }>;
  applicantAdvocate?: {
    name: string;
    phone: string;
  };
  respondentAdvocate?: {
    name: string;
    phone: string;
  };
  resolutionSummary: string;
  outcomes: string;
  termsAndConditions: string;
  professionalSignature: string;
}

export const generateAwardPDF = (data: AwardPDFData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const title = `${data.documentType || 'ARBITRATION AWARD'}`;
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Case ID and Resolution Type
  doc.setFontSize(12);
  doc.text(`Case ID: ${data.caseId}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text(`Resolution Method: ${data.resolutionType}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Party Details
  doc.setFont('helvetica', 'bold');
  doc.text('PARTIES INVOLVED:', margin, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Applicant: ${data.applicantName}`, margin, yPos);
  yPos += 6;
  
  if (data.applicantAdvocate?.name) {
    doc.text(`Applicant's Advocate: ${data.applicantAdvocate.name}`, margin + 5, yPos);
    yPos += 5;
    doc.text(`Contact: ${data.applicantAdvocate.phone}`, margin + 5, yPos);
    yPos += 8;
  } else {
    yPos += 6;
  }
  
  doc.text(`Respondent: ${data.respondentName}`, margin, yPos);
  yPos += 6;
  
  if (data.respondentAdvocate?.name) {
    doc.text(`Respondent's Advocate: ${data.respondentAdvocate.name}`, margin + 5, yPos);
    yPos += 5;
    doc.text(`Contact: ${data.respondentAdvocate.phone}`, margin + 5, yPos);
    yPos += 8;
  } else {
    yPos += 6;
  }

  // Professional Details
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.resolutionType === 'Arbitration' ? 'ARBITRATOR' : 'MEDIATOR'}:`, margin, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(data.mediatorName, margin, yPos);
  yPos += 10;

  // Proceedings Details
  doc.setFont('helvetica', 'bold');
  doc.text('PROCEEDINGS SUMMARY:', margin, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Number of Meetings Held: ${data.meetingsCount}`, margin, yPos);
  yPos += 6;
  doc.text(`Final Hearing Date: ${data.finalDate}`, margin, yPos);
  yPos += 10;

  // Documents Submitted
  if (data.documentsSubmitted.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('DOCUMENTS SUBMITTED:', margin, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    data.documentsSubmitted.forEach((docItem, index) => {
      doc.text(`${index + 1}. ${docItem.documentName} (by ${docItem.submittedBy})`, margin + 5, yPos);
      yPos += 5;
      if (docItem.description) {
        const splitDesc = doc.splitTextToSize(`   ${docItem.description}`, pageWidth - 2 * margin - 10);
        doc.text(splitDesc, margin + 5, yPos);
        yPos += splitDesc.length * 5;
      }
      yPos += 3;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    yPos += 5;
  }

  // Check if new page needed
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Resolution Summary
  doc.setFont('helvetica', 'bold');
  doc.text('RESOLUTION SUMMARY:', margin, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  const summarySplit = doc.splitTextToSize(data.resolutionSummary, pageWidth - 2 * margin);
  doc.text(summarySplit, margin, yPos);
  yPos += summarySplit.length * 5 + 8;

  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Outcomes
  doc.setFont('helvetica', 'bold');
  doc.text('OUTCOMES:', margin, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  const outcomesSplit = doc.splitTextToSize(data.outcomes, pageWidth - 2 * margin);
  doc.text(outcomesSplit, margin, yPos);
  yPos += outcomesSplit.length * 5 + 8;

  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Terms and Conditions
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS AND CONDITIONS:', margin, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  const termsSplit = doc.splitTextToSize(data.termsAndConditions, pageWidth - 2 * margin);
  doc.text(termsSplit, margin, yPos);
  yPos += termsSplit.length * 5 + 15;

  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Digital Signature
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITALLY SIGNED BY:', margin, yPos);
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(data.professionalSignature, margin, yPos);
  yPos += 6;
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, margin, yPos);
  yPos += 15;

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('This document is generated by eNyaya Resolve', pageWidth / 2, yPos, { align: 'center' });

  return doc;
};
