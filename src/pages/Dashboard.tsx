import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaseMeetingManager } from "@/components/CaseMeetingManager";
import { PDFViewer } from "@/components/PDFViewer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Clock, CheckCircle2, AlertCircle, UserPlus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface Dispute {
  id: string;
  case_id: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_address?: string;
  respondent_name: string;
  respondent_email?: string;
  respondent_phone?: string;
  respondent_address?: string;
  contract_type: string;
  resolution_type: string;
  dispute_description: string;
  status: string;
  filed_date: string;
  legal_aid_eligible: boolean;
  assigned_professional_id?: string;
  mediator?: string;
  meeting_date?: string;
  meeting_link?: string;
  document_type?: string;
  final_document?: any;
  award_pdf_url?: string;
}

interface Professional {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  status: string;
}

// Validation schema for case editing
const editCaseSchema = z.object({
  applicant_name: z.string().trim().min(1, "Applicant name is required").max(100),
  applicant_phone: z.string().trim().min(10, "Valid phone number required").max(15),
  applicant_email: z.string().trim().email("Valid email required").max(255),
  applicant_address: z.string().trim().max(500).optional(),
  respondent_name: z.string().trim().min(1, "Respondent name is required").max(100),
  respondent_phone: z.string().trim().max(15).optional(),
  respondent_email: z.string().trim().email().max(255).optional().or(z.literal("")),
  respondent_address: z.string().trim().max(500).optional(),
  contract_type: z.string().trim().min(1, "Contract type is required").max(100),
  dispute_description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  status: z.string().trim().min(1, "Status is required"),
});

export default function Dashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [editingDispute, setEditingDispute] = useState<Dispute | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please log in to access your dashboard.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    setUserRole(roleData?.role || '');
    await Promise.all([loadDisputes(user.id, roleData?.role), loadProfessionals()]);
    setLoading(false);
  };

  const loadDisputes = async (userId: string, role: string) => {
    let query = supabase.from('disputes').select('*');
    
    // Clients only see their own disputes
    if (role === 'client') {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load disputes.",
        variant: "destructive",
      });
      return;
    }

    setDisputes(data || []);
  };

  const loadProfessionals = async () => {
    const { data } = await supabase
      .from('professionals')
      .select('*')
      .eq('status', 'active');

    setProfessionals(data || []);
  };

  const handleAssignClick = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setSelectedProfessionalId(dispute.assigned_professional_id || "");
    setIsAssignDialogOpen(true);
  };

  const handleAssignProfessional = async () => {
    if (!selectedDispute || !selectedProfessionalId) return;

    const professional = professionals.find(p => p.id === selectedProfessionalId);
    if (!professional) return;

    const { error } = await supabase
      .from('disputes')
      .update({
        assigned_professional_id: selectedProfessionalId,
        mediator: professional.name,
        status: "In Progress - Professional Assigned",
      })
      .eq('id', selectedDispute.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign professional.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Professional Assigned",
      description: `${professional.name} has been assigned to case ${selectedDispute.case_id}`,
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadDisputes(user.id, userRole);
    }
    setIsAssignDialogOpen(false);
    setSelectedDispute(null);
    setSelectedProfessionalId("");
  };

  const handleEditClick = (dispute: Dispute) => {
    setEditingDispute(dispute);
    setIsEditDialogOpen(true);
    setValidationErrors({});
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDispute) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      applicant_name: formData.get("applicant_name") as string,
      applicant_phone: formData.get("applicant_phone") as string,
      applicant_email: formData.get("applicant_email") as string,
      applicant_address: formData.get("applicant_address") as string,
      respondent_name: formData.get("respondent_name") as string,
      respondent_phone: formData.get("respondent_phone") as string,
      respondent_email: formData.get("respondent_email") as string,
      respondent_address: formData.get("respondent_address") as string,
      contract_type: formData.get("contract_type") as string,
      dispute_description: formData.get("dispute_description") as string,
      status: formData.get("status") as string,
    };

    try {
      const validated = editCaseSchema.parse(data);
      
      const { error } = await supabase
        .from('disputes')
        .update(validated)
        .eq('id', editingDispute.id);

      if (error) throw error;

      toast({
        title: "Case Updated",
        description: "Case details have been updated successfully.",
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadDisputes(user.id, userRole);
      }
      setIsEditDialogOpen(false);
      setEditingDispute(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update case details.",
          variant: "destructive",
        });
      }
    }
  };

  const getAssignedProfessional = (dispute: Dispute) => {
    if (!dispute.assigned_professional_id) return null;
    return professionals.find(p => p.id === dispute.assigned_professional_id);
  };

  const getStatusIcon = (status: string) => {
    if (status.includes("Closed") || status.includes("Resolved")) {
      return <CheckCircle2 className="h-4 w-4 text-secondary" />;
    }
    if (status.includes("Progress")) {
      return <Clock className="h-4 w-4 text-accent" />;
    }
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const stats = {
    total: disputes.length,
    pending: disputes.filter((d) => d.status.includes("Pending")).length,
    inProgress: disputes.filter((d) => d.status.includes("Progress")).length,
    resolved: disputes.filter((d) => d.status.includes("Resolved") || d.status.includes("Closed")).length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-background py-12 flex items-center justify-center">
          <div>Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              {userRole === 'client' ? 'My Cases' : 'Disputes Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {userRole === 'client' 
                ? 'View and track all your registered cases' 
                : 'Overview of all registered disputes and their current status'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All registered cases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting assignment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Under mediation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground">Successfully closed</p>
              </CardContent>
            </Card>
          </div>

          {/* Disputes Table/List */}
          <Card>
            <CardHeader>
              <CardTitle>{userRole === 'client' ? 'Your Cases' : 'All Disputes'}</CardTitle>
              <CardDescription>
                {userRole === 'client' 
                  ? 'Click on "Track Case" to view detailed progress' 
                  : 'A complete list of registered disputes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {disputes.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No {userRole === 'client' ? 'cases' : 'disputes'} yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {userRole === 'client' 
                      ? 'Your registered cases will appear here' 
                      : 'Disputes will appear here once they are registered'}
                  </p>
                  {userRole === 'client' && (
                    <Button asChild>
                      <Link to="/register">Register New Case</Link>
                    </Button>
                  )}
                </div>
              ) : userRole === 'client' ? (
                <div className="space-y-4">
                  {disputes.map((dispute) => (
                    <Card key={dispute.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{dispute.case_id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Filed on {new Date(dispute.filed_date).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge variant="secondary">{dispute.status}</Badge>
                        </div>
                        
                        <div className="grid gap-3 mb-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Contract Type</p>
                            <p className="font-medium">{dispute.contract_type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Resolution Method</p>
                            <p className="font-medium capitalize">
                              {dispute.resolution_type ? dispute.resolution_type.replace('_', ' ') : 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Mediator</p>
                            <p className="font-medium">{dispute.mediator || 'Not assigned yet'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Legal Aid</p>
                            <Badge variant={dispute.legal_aid_eligible ? "default" : "secondary"} className="text-xs">
                              {dispute.legal_aid_eligible ? "Eligible" : "Not Eligible"}
                            </Badge>
                          </div>
                        </div>

                        {dispute.meeting_date && (
                          <div className="border-t border-border pt-3 mt-3">
                            <p className="text-xs text-muted-foreground mb-2">Scheduled Meeting</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">
                                  {new Date(dispute.meeting_date).toLocaleString()}
                                </p>
                                {dispute.meeting_link && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    asChild
                                  >
                                    <a href={dispute.meeting_link} target="_blank" rel="noopener noreferrer">
                                      Join Meeting →
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {dispute.final_document && (
                          <div className="border-t border-border pt-3 mt-3">
                            <Badge variant="secondary" className="text-xs mb-3">
                              {dispute.document_type === "arbitration_award" ? "Arbitration Award Issued" : "Mediation Report Issued"}
                            </Badge>
                            {dispute.award_pdf_url && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => window.open(`/track?caseId=${dispute.case_id}`, '_blank')}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View Award Document
                              </Button>
                            )}
                          </div>
                        )}
                        
                        <Button asChild className="w-full mt-4">
                          <Link to={`/track?caseId=${dispute.case_id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Track Case Progress
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contract Type</TableHead>
                      <TableHead>Resolution Method</TableHead>
                      <TableHead>Filed Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Meeting</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {disputes.map((dispute) => {
                      const assignedProfessional = getAssignedProfessional(dispute);
                      return (
                        <TableRow key={dispute.id}>
                          <TableCell className="font-medium">{dispute.case_id}</TableCell>
                          <TableCell>{dispute.applicant_name}</TableCell>
                          <TableCell>{dispute.contract_type}</TableCell>
                          <TableCell>
                            {dispute.resolution_type ? (
                              <Badge variant="outline" className="capitalize">
                                {dispute.resolution_type.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not specified</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(dispute.filed_date).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(dispute.status)}
                              <span className="text-sm">{dispute.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {assignedProfessional ? (
                              <div className="text-sm">
                                <div className="font-medium">{assignedProfessional.name}</div>
                                <div className="text-muted-foreground capitalize">
                                  {assignedProfessional.type.replace("_", " ")}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not Assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {dispute.meeting_date ? (
                              <div className="text-sm">
                                <div className="font-medium">
                                  {new Date(dispute.meeting_date).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(dispute.meeting_date).toLocaleTimeString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not scheduled</span>
                            )}
                          </TableCell>
                           <TableCell className="text-right">
                            <div className="flex justify-end gap-2 flex-wrap">
                              {userRole === 'admin' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(dispute)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {!dispute.assigned_professional_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAssignClick(dispute)}
                                >
                                  <UserPlus className="mr-1 h-3 w-3" />
                                  Assign
                                </Button>
                              )}
                              {dispute.assigned_professional_id && userRole === 'admin' && (
                                <CaseMeetingManager
                                  dispute={dispute as any}
                                  onUpdate={async () => {
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (user) await loadDisputes(user.id, userRole);
                                  }}
                                />
                              )}
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/track?caseId=${dispute.case_id}`}>View</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Assign Professional Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Professional</DialogTitle>
            <DialogDescription>
              Select a professional to assign to case {selectedDispute?.case_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Professional</label>
              <Select
                value={selectedProfessionalId}
                onValueChange={setSelectedProfessionalId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a professional..." />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{professional.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({professional.type.replace("_", " ")})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfessionalId && professionals.find(p => p.id === selectedProfessionalId) && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <h4 className="font-semibold text-sm">Professional Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Specialization:</span>
                    <p className="font-medium">
                      {professionals.find(p => p.id === selectedProfessionalId)?.specialization}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Experience:</span>
                    <p className="font-medium">
                      {professionals.find(p => p.id === selectedProfessionalId)?.experience} years
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">
                      {professionals.find(p => p.id === selectedProfessionalId)?.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">
                      {professionals.find(p => p.id === selectedProfessionalId)?.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignProfessional} disabled={!selectedProfessionalId}>
              Assign Professional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Case Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Case Details</DialogTitle>
            <DialogDescription>
              Update case information for {editingDispute?.case_id}
            </DialogDescription>
          </DialogHeader>

          {editingDispute && (
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Applicant Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Applicant Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="applicant_name">Full Name *</Label>
                    <Input
                      id="applicant_name"
                      name="applicant_name"
                      defaultValue={editingDispute.applicant_name}
                      maxLength={100}
                      required
                    />
                    {validationErrors.applicant_name && (
                      <p className="text-sm text-destructive">{validationErrors.applicant_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicant_phone">Phone *</Label>
                    <Input
                      id="applicant_phone"
                      name="applicant_phone"
                      type="tel"
                      defaultValue={editingDispute.applicant_phone}
                      maxLength={15}
                      required
                    />
                    {validationErrors.applicant_phone && (
                      <p className="text-sm text-destructive">{validationErrors.applicant_phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicant_email">Email *</Label>
                    <Input
                      id="applicant_email"
                      name="applicant_email"
                      type="email"
                      defaultValue={editingDispute.applicant_email}
                      maxLength={255}
                      required
                    />
                    {validationErrors.applicant_email && (
                      <p className="text-sm text-destructive">{validationErrors.applicant_email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicant_address">Address</Label>
                    <Input
                      id="applicant_address"
                      name="applicant_address"
                      defaultValue={editingDispute.applicant_address || ""}
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>

              {/* Respondent Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Respondent Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="respondent_name">Full Name *</Label>
                    <Input
                      id="respondent_name"
                      name="respondent_name"
                      defaultValue={editingDispute.respondent_name}
                      maxLength={100}
                      required
                    />
                    {validationErrors.respondent_name && (
                      <p className="text-sm text-destructive">{validationErrors.respondent_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="respondent_phone">Phone</Label>
                    <Input
                      id="respondent_phone"
                      name="respondent_phone"
                      type="tel"
                      defaultValue={editingDispute.respondent_phone || ""}
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="respondent_email">Email</Label>
                    <Input
                      id="respondent_email"
                      name="respondent_email"
                      type="email"
                      defaultValue={editingDispute.respondent_email || ""}
                      maxLength={255}
                    />
                    {validationErrors.respondent_email && (
                      <p className="text-sm text-destructive">{validationErrors.respondent_email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="respondent_address">Address</Label>
                    <Input
                      id="respondent_address"
                      name="respondent_address"
                      defaultValue={editingDispute.respondent_address || ""}
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>

              {/* Dispute Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dispute Details</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract_type">Contract Type *</Label>
                    <Input
                      id="contract_type"
                      name="contract_type"
                      defaultValue={editingDispute.contract_type}
                      maxLength={100}
                      required
                    />
                    {validationErrors.contract_type && (
                      <p className="text-sm text-destructive">{validationErrors.contract_type}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dispute_description">Dispute Description *</Label>
                    <Textarea
                      id="dispute_description"
                      name="dispute_description"
                      defaultValue={editingDispute.dispute_description}
                      rows={5}
                      maxLength={2000}
                      required
                    />
                    {validationErrors.dispute_description && (
                      <p className="text-sm text-destructive">{validationErrors.dispute_description}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select name="status" defaultValue={editingDispute.status} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                        <SelectItem value="In Progress - Professional Assigned">In Progress - Professional Assigned</SelectItem>
                        <SelectItem value="In Progress - Meeting Scheduled">In Progress - Meeting Scheduled</SelectItem>
                        <SelectItem value="In Progress - Under Mediation">In Progress - Under Mediation</SelectItem>
                        <SelectItem value="Resolved - Settlement Reached">Resolved - Settlement Reached</SelectItem>
                        <SelectItem value="Resolved - Award Issued">Resolved - Award Issued</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.status && (
                      <p className="text-sm text-destructive">{validationErrors.status}</p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
