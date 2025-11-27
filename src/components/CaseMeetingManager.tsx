import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Video, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateAwardPDF } from "@/lib/pdfGenerator";

interface Dispute {
  id: string;
  case_id: string;
  user_id: string;
  status: string;
  resolution_type: string;
  meeting_date?: string;
  meeting_link?: string;
  document_type?: string;
  final_document?: any;
  applicant_name: string;
  applicant_email: string;
  respondent_name: string;
  respondent_email: string;
  assigned_professional_id?: string;
}

interface CaseMeetingManagerProps {
  dispute: Dispute;
  onUpdate: () => void;
}

export const CaseMeetingManager = ({ dispute, onUpdate }: CaseMeetingManagerProps) => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [submittedDocuments, setSubmittedDocuments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCaseData();
  }, [dispute.id]);

  const loadCaseData = async () => {
    // Load meetings count
    const { data: meetings, error: meetingsError } = await supabase
      .from('dispute_meetings')
      .select('*')
      .eq('dispute_id', dispute.id);
    
    if (!meetingsError && meetings) {
      setMeetingsCount(meetings.length);
    }

    // Load submitted documents
    const { data: docs, error: docsError } = await supabase
      .from('dispute_documents')
      .select('*')
      .eq('dispute_id', dispute.id);
    
    if (!docsError && docs) {
      setSubmittedDocuments(docs);
    }
  };

  const [meetingData, setMeetingData] = useState({
    meeting_date: dispute.meeting_date || "",
    meeting_link: dispute.meeting_link || "",
  });

  const [documentData, setDocumentData] = useState({
    document_type: dispute.document_type || "",
    summary: "",
    outcome: "",
    terms: "",
    remarks: "",
    applicant_advocate_name: "",
    applicant_advocate_phone: "",
    respondent_advocate_name: "",
    respondent_advocate_phone: "",
  });

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("disputes")
      .update({
        meeting_date: meetingData.meeting_date,
        meeting_link: meetingData.meeting_link,
        status: "Meeting Scheduled",
      })
      .eq("id", dispute.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to schedule meeting.",
        variant: "destructive",
      });
      return;
    }

    // Save meeting to dispute_meetings table
    await supabase.from("dispute_meetings").insert({
      dispute_id: dispute.id,
      meeting_date: meetingData.meeting_date,
      meeting_link: meetingData.meeting_link,
    });

    // Create notification for user
    await supabase.from("notifications").insert({
      user_id: dispute.user_id,
      dispute_id: dispute.id,
      type: "meeting_scheduled",
      title: "Meeting Scheduled",
      message: `A video conference has been scheduled for case ${dispute.case_id} on ${new Date(meetingData.meeting_date).toLocaleString()}`,
    });

    // Send email notifications to both parties
    const { error: emailError } = await supabase.functions.invoke('send-dispute-notification', {
      body: {
        type: 'meeting_scheduled',
        caseId: dispute.case_id,
        applicantName: dispute.applicant_name,
        applicantEmail: dispute.applicant_email,
        respondentName: dispute.respondent_name,
        respondentEmail: dispute.respondent_email,
        resolutionMethod: dispute.resolution_type,
        meetingLink: meetingData.meeting_link,
        meetingDate: meetingData.meeting_date,
      }
    });

    if (emailError) {
      console.error('Failed to send email notifications:', emailError);
    }

    toast({
      title: "Meeting Scheduled",
      description: "The parties have been notified via email.",
    });

    setIsScheduleOpen(false);
    onUpdate();
  };

  const handleIssueDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingPDF(true);

    try {
      // Fetch professional details
      const { data: professionalData } = await supabase
        .from('professionals')
        .select('name')
        .eq('id', dispute.assigned_professional_id)
        .single();

      const mediatorName = professionalData?.name || 'Unknown Professional';

      // Generate PDF
      const pdf = generateAwardPDF({
        caseId: dispute.case_id,
        applicantName: dispute.applicant_name,
        respondentName: dispute.respondent_name,
        resolutionType: dispute.resolution_type,
        documentType: documentData.document_type === 'arbitration_award' 
          ? 'ARBITRATION AWARD' 
          : 'MEDIATION REPORT',
        mediatorName: mediatorName,
        meetingsCount: meetingsCount,
        finalDate: new Date().toLocaleDateString('en-IN'),
        documentsSubmitted: submittedDocuments.map(doc => ({
          submittedBy: doc.submitted_by,
          documentName: doc.document_name,
          description: doc.document_description
        })),
        applicantAdvocate: documentData.applicant_advocate_name ? {
          name: documentData.applicant_advocate_name,
          phone: documentData.applicant_advocate_phone
        } : undefined,
        respondentAdvocate: documentData.respondent_advocate_name ? {
          name: documentData.respondent_advocate_name,
          phone: documentData.respondent_advocate_phone
        } : undefined,
        resolutionSummary: documentData.summary,
        outcomes: documentData.outcome,
        termsAndConditions: documentData.terms,
        professionalSignature: mediatorName
      });

      // Convert PDF to blob
      const pdfBlob = pdf.output('blob');
      const fileName = `${dispute.id}/award-${Date.now()}.pdf`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('case-documents')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const finalDocument = {
        document_type: documentData.document_type,
        summary: documentData.summary,
        outcome: documentData.outcome,
        terms: documentData.terms,
        remarks: documentData.remarks,
        issued_date: new Date().toISOString(),
      };

      // Update dispute with PDF URL and advocate details
      const { error } = await supabase
        .from("disputes")
        .update({
          document_type: documentData.document_type,
          final_document: finalDocument,
          award_pdf_url: fileName,
          applicant_advocate_name: documentData.applicant_advocate_name || null,
          applicant_advocate_phone: documentData.applicant_advocate_phone || null,
          respondent_advocate_name: documentData.respondent_advocate_name || null,
          respondent_advocate_phone: documentData.respondent_advocate_phone || null,
          status: documentData.document_type === "arbitration_award" 
            ? "Arbitration Award Issued" 
            : "Mediation Report Issued",
        })
        .eq("id", dispute.id);

      if (error) {
        throw error;
      }

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: dispute.user_id,
        dispute_id: dispute.id,
        type: "document_issued",
        title: "Final Document Issued",
        message: `${documentData.document_type === "arbitration_award" ? "Arbitration Award" : "Mediation Report"} has been issued for case ${dispute.case_id}`,
      });

      // Send email notifications to both parties
      const { error: emailError } = await supabase.functions.invoke('send-dispute-notification', {
        body: {
          type: 'award_finalized',
          caseId: dispute.case_id,
          applicantName: dispute.applicant_name,
          applicantEmail: dispute.applicant_email,
          respondentName: dispute.respondent_name,
          respondentEmail: dispute.respondent_email,
          resolutionMethod: dispute.resolution_type,
        }
      });

      if (emailError) {
        console.error('Failed to send email notifications:', emailError);
      }

      toast({
        title: "Document Issued",
        description: "PDF award document generated and parties notified via email.",
      });

      setIsDocumentOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error issuing document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to issue document.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Schedule Meeting Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Video className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleScheduleMeeting}>
            <DialogHeader>
              <DialogTitle>Schedule Video Conference</DialogTitle>
              <DialogDescription>
                Set up a meeting for case {dispute.case_id}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="meeting_date">Meeting Date & Time</Label>
                <Input
                  id="meeting_date"
                  type="datetime-local"
                  required
                  value={meetingData.meeting_date}
                  onChange={(e) =>
                    setMeetingData({ ...meetingData, meeting_date: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Input
                  id="meeting_link"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  required
                  value={meetingData.meeting_link}
                  onChange={(e) =>
                    setMeetingData({ ...meetingData, meeting_link: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Provide a Google Meet, Zoom, or Teams link
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Schedule Meeting</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue Document Dialog */}
      <Dialog open={isDocumentOpen} onOpenChange={setIsDocumentOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Issue Document
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleIssueDocument}>
            <DialogHeader>
              <DialogTitle>Issue Final Document</DialogTitle>
              <DialogDescription>
                Record the final outcome for case {dispute.case_id}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="document_type">Document Type</Label>
                <Select
                  value={documentData.document_type}
                  onValueChange={(value) =>
                    setDocumentData({ ...documentData, document_type: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arbitration_award">Arbitration Award</SelectItem>
                    <SelectItem value="mediation_report">Mediation Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Brief summary of the case and proceedings"
                  required
                  rows={3}
                  value={documentData.summary}
                  onChange={(e) =>
                    setDocumentData({ ...documentData, summary: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="outcome">Outcome/Decision</Label>
                <Textarea
                  id="outcome"
                  placeholder="Final decision or agreement reached"
                  required
                  rows={3}
                  value={documentData.outcome}
                  onChange={(e) =>
                    setDocumentData({ ...documentData, outcome: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Specific terms, obligations, or timelines"
                  required
                  rows={3}
                  value={documentData.terms}
                  onChange={(e) =>
                    setDocumentData({ ...documentData, terms: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="remarks">Additional Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Any additional notes or observations (optional)"
                  rows={2}
                  value={documentData.remarks}
                  onChange={(e) =>
                    setDocumentData({ ...documentData, remarks: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Applicant's Advocate (Optional)</Label>
                <Input
                  placeholder="Advocate Name"
                  value={documentData.applicant_advocate_name}
                  onChange={(e) =>
                    setDocumentData({ ...documentData, applicant_advocate_name: e.target.value })
                  }
                />
                <Input
                  placeholder="Advocate Phone"
                  value={documentData.applicant_advocate_phone}
                  onChange={(e) =>
                    setDocumentData({ ...documentData, applicant_advocate_phone: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Respondent's Advocate (Optional)</Label>
                <Input
                  placeholder="Advocate Name"
                  value={documentData.respondent_advocate_name}
                  onChange={(e) =>
                    setDocumentData({ ...documentData, respondent_advocate_name: e.target.value })
                  }
                />
                <Input
                  placeholder="Advocate Phone"
                  value={documentData.respondent_advocate_phone}
                  onChange={(e) =>
                    setDocumentData({ ...documentData, respondent_advocate_phone: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isGeneratingPDF}>
                {isGeneratingPDF && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGeneratingPDF ? "Generating PDF..." : "Issue Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
