import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Mail, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CaseMeetingManager } from "@/components/CaseMeetingManager";

interface Dispute {
  id: string;
  case_id: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  respondent_name: string;
  contract_type: string;
  resolution_type: string;
  dispute_description: string;
  status: string;
  filed_date: string;
  meeting_date?: string;
  meeting_link?: string;
  document_type?: string;
  final_document?: any;
}

export default function ProfessionalDashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isProfessional, setIsProfessional] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [professionalEmail, setProfessionalEmail] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkProfessionalRole();
  }, []);

  const checkProfessionalRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please log in to access this page.",
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

    if (roleData?.role !== 'professional') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    setIsProfessional(true);
    setProfessionalEmail(user.email || "");
    setLoading(false);
    loadAssignedCases(user.email || "");
  };

  const loadAssignedCases = async (email: string) => {
    // Get professional record by email
    const { data: professional } = await supabase
      .from('professionals')
      .select('id, name')
      .eq('email', email)
      .single();

    if (!professional) {
      toast({
        title: "Profile Not Found",
        description: "Professional profile not found.",
        variant: "destructive",
      });
      return;
    }

    // Get disputes assigned to this professional
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('assigned_professional_id', professional.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load assigned cases.",
        variant: "destructive",
      });
      return;
    }

    setDisputes(data || []);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Pending Review": "bg-yellow-500",
      "Under Mediation": "bg-blue-500",
      "Under Arbitration": "bg-purple-500",
      "Resolved": "bg-green-500",
      "Rejected": "bg-red-500",
      "Mediation Report Issued": "bg-teal-500",
      "Arbitration Award Issued": "bg-indigo-500",
    };
    return colors[status] || "bg-gray-500";
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

  if (!isProfessional) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">My Cases</h1>
            <p className="text-muted-foreground">
              Manage cases assigned to you
            </p>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{disputes.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {disputes.filter((d) => !["Resolved", "Rejected"].includes(d.status)).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {disputes.filter((d) => d.status === "Resolved").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {disputes.filter((d) => d.status === "Pending Review").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cases Grid */}
          {disputes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  No cases assigned yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cases will appear here once assigned to you by the admin
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {disputes.map((dispute) => (
                <Card key={dispute.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{dispute.case_id}</CardTitle>
                        <CardDescription className="mt-1">
                          {dispute.contract_type}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(dispute.status)}>
                        {dispute.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Applicant:</span>
                        <span className="text-muted-foreground">{dispute.applicant_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{dispute.applicant_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{dispute.applicant_phone}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Respondent:</span> {dispute.respondent_name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Resolution:</span> {dispute.resolution_type}
                      </p>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Description:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {dispute.dispute_description}
                      </p>
                    </div>

                    {dispute.meeting_date && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Scheduled Meeting
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(dispute.meeting_date).toLocaleString()}
                        </p>
                        {dispute.meeting_link && (
                          <a
                            href={dispute.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Join Meeting
                          </a>
                        )}
                      </div>
                    )}

                    {dispute.final_document && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Document Issued
                        </p>
                        <Badge variant="outline">{dispute.document_type}</Badge>
                      </div>
                    )}

                    <CaseMeetingManager 
                      dispute={dispute}
                      onUpdate={() => loadAssignedCases(professionalEmail)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
