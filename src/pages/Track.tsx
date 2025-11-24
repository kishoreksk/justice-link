import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Dispute {
  id: string;
  case_id: string;
  applicant_name: string;
  contract_type: string;
  resolution_type: string;
  status: string;
  filed_date: string;
  legal_aid_eligible: boolean;
  mediator?: string;
  user_id: string;
}

interface CaseUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  status: string;
}

export default function Track() {
  const [searchParams] = useSearchParams();
  const [caseId, setCaseId] = useState("");
  const [caseData, setCaseData] = useState<Dispute | null>(null);
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([]);
  const [userDisputes, setUserDisputes] = useState<Dispute[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndLoadUserDisputes();
  }, []);

  useEffect(() => {
    const urlCaseId = searchParams.get("caseId");
    if (urlCaseId) {
      setCaseId(urlCaseId);
      loadCase(urlCaseId);
    }
  }, [searchParams]);

  const checkAuthAndLoadUserDisputes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please log in to track your cases.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = roleData?.role === 'admin';

    // Admins can see all disputes, others only see their own
    let query = supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data } = await query;
    setUserDisputes(data || []);
  };

  const loadCase = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = roleData?.role === 'admin';

    // Admins can view any case, others only their own
    let query = supabase
      .from('disputes')
      .select('*')
      .eq('case_id', id);

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: dispute, error } = await query.maybeSingle();

    if (error || !dispute) {
      toast({
        title: "Case Not Found",
        description: "No case found with this ID or you don't have access to it.",
        variant: "destructive",
      });
      setCaseData(null);
      setCaseUpdates([]);
      return;
    }

    setCaseData(dispute);

    const { data: updates } = await supabase
      .from('case_updates')
      .select('*')
      .eq('dispute_id', dispute.id)
      .order('date', { ascending: false });

    setCaseUpdates(updates || []);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (caseId.trim()) {
      loadCase(caseId.trim());
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-foreground">Track Your Case</h1>
              <p className="text-muted-foreground">Enter your case ID to view current status and updates</p>
            </div>
            
            {/* Search Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Find Your Case</CardTitle>
                <CardDescription>Enter the case ID you received during registration</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="caseId" className="sr-only">Case ID</Label>
                    <Input
                      id="caseId"
                      placeholder="e.g., ODR/2025/001234"
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="success">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* User's Cases Overview */}
            {userDisputes.length > 0 && !caseData && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Your Cases</CardTitle>
                  <CardDescription>Quick access to your registered disputes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userDisputes.map((dispute) => (
                      <div
                        key={dispute.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          setCaseId(dispute.case_id);
                          loadCase(dispute.case_id);
                        }}
                      >
                        <div>
                          <p className="font-medium">{dispute.case_id}</p>
                          <p className="text-sm text-muted-foreground">{dispute.contract_type}</p>
                        </div>
                        <Badge variant="secondary">{dispute.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Case Details */}
            {caseData && (
              <div className="space-y-6">
                {/* Case Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{caseData.case_id}</CardTitle>
                        <CardDescription className="mt-1">
                          Filed on {new Date(caseData.filed_date).toLocaleDateString('en-IN', {
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                        {caseData.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Applicant</p>
                        <p className="font-medium text-foreground">{caseData.applicant_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contract Type</p>
                        <p className="font-medium text-foreground">{caseData.contract_type}</p>
                      </div>
                      {caseData.resolution_type && (
                        <div>
                          <p className="text-sm text-muted-foreground">Resolution Method</p>
                          <p className="font-medium text-foreground capitalize">
                            {caseData.resolution_type.replace('_', ' ')}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Mediator</p>
                        <p className="font-medium text-foreground">{caseData.mediator || "Not Assigned"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Legal Aid Eligible</p>
                        <p className="font-medium text-foreground">
                          {caseData.legal_aid_eligible ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Case Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Case Timeline</CardTitle>
                    <CardDescription>Track the progress of your dispute resolution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {caseUpdates.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No updates yet</p>
                    ) : (
                      <div className="space-y-6">
                        {caseUpdates.map((update, index) => (
                          <div key={update.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                update.status === 'completed' 
                                  ? 'bg-secondary/20 text-secondary' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {update.status === 'completed' ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <Clock className="h-5 w-5" />
                                )}
                              </div>
                              {index < caseUpdates.length - 1 && (
                                <div className="h-full w-0.5 bg-border" style={{ minHeight: '40px' }} />
                              )}
                            </div>
                            
                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-foreground">{update.title}</h3>
                                  <p className="mt-1 text-sm text-muted-foreground">{update.description}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(update.date).toLocaleDateString('en-IN', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Download Case Summary
                      </Button>
                      <Button variant="outline">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Contact Mediator
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {!caseData && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No case selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your case ID above to view details and track progress
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
