import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Users, 
  Scale, 
  Shield, 
  CheckCircle, 
  Calendar,
  UserCheck,
  Award,
  Search,
  Video,
  Download,
  Bell,
  Lock
} from "lucide-react";

export default function Demo() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Access Denied",
          description: "Please login to access this page",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to administrators",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Admin Only
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">System Demo & Walkthrough</h1>
          <p className="text-muted-foreground">
            Complete overview of eNyaya Resolve features and workflows
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="user-flow">User Flow</TabsTrigger>
            <TabsTrigger value="admin-flow">Admin Flow</TabsTrigger>
            <TabsTrigger value="professional-flow">Professional Flow</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>Understanding the eNyaya Resolve platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Three User Roles</h3>
                    <p className="text-sm text-muted-foreground">Clients, Professionals, and Administrators</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Scale className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">ODR Platform</h3>
                    <p className="text-sm text-muted-foreground">Online Dispute Resolution with mediation & arbitration</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Legal Aid Integration</h3>
                    <p className="text-sm text-muted-foreground">Eligibility assessment based on income criteria</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Core Components</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Authentication:</strong> Secure login/signup with role-based access control</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Database:</strong> PostgreSQL with Row-Level Security policies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Storage:</strong> Secure document storage for award PDFs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Notifications:</strong> Real-time updates via edge functions</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Flow Tab */}
          <TabsContent value="user-flow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client/User Journey</CardTitle>
                <CardDescription>Step-by-step workflow for dispute filers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      icon: FileText,
                      title: "Register Dispute",
                      description: "User fills out the dispute registration form with applicant, respondent, and contract details",
                      actions: ["Navigate to /register", "Fill all required fields", "Submit dispute"]
                    },
                    {
                      step: 2,
                      icon: Shield,
                      title: "Legal Aid Assessment",
                      description: "System automatically checks eligibility based on annual income (<₹5,00,000)",
                      actions: ["Income verified", "Legal aid flag set", "Case ID generated"]
                    },
                    {
                      step: 3,
                      icon: Search,
                      title: "Track Case",
                      description: "User can track case progress using unique Case ID",
                      actions: ["Visit /track page", "Enter Case ID", "View real-time status"]
                    },
                    {
                      step: 4,
                      icon: Bell,
                      title: "Receive Notifications",
                      description: "User gets notified when professional is assigned or meeting is scheduled",
                      actions: ["Email notifications", "In-app bell icon", "Case updates timeline"]
                    },
                    {
                      step: 5,
                      icon: Video,
                      title: "Attend Meetings",
                      description: "Join virtual meetings via provided links",
                      actions: ["Click meeting link", "Participate online", "No court visit needed"]
                    },
                    {
                      step: 6,
                      icon: Award,
                      title: "Receive Award",
                      description: "View and download final arbitration award or mediation report as PDF",
                      actions: ["PDF viewable in portal", "Download option", "Legally binding document"]
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 pb-6 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{item.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.actions.map((action, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Flow Tab */}
          <TabsContent value="admin-flow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Administrator Workflow</CardTitle>
                <CardDescription>Managing disputes and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      icon: Users,
                      title: "Dashboard Overview",
                      description: "View all disputes with statistics (Total, Pending, In Progress, Resolved)",
                      route: "/dashboard",
                      features: ["Filter by status", "Search cases", "View details"]
                    },
                    {
                      step: 2,
                      icon: UserCheck,
                      title: "Assign Professional",
                      description: "Select arbitrator or mediator from available professionals",
                      route: "/dashboard",
                      features: ["View professional profiles", "Check experience", "Assign to case"]
                    },
                    {
                      step: 3,
                      icon: Users,
                      title: "Manage Professionals",
                      description: "Add, edit, or deactivate professional accounts",
                      route: "/admin",
                      features: ["Create new professionals", "Update details", "Set specializations"]
                    },
                    {
                      step: 4,
                      icon: Shield,
                      title: "Role Management",
                      description: "Assign admin, professional, or client roles to users",
                      route: "/roles",
                      features: ["Add roles", "Remove roles", "View user permissions"]
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 pb-6 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className="h-5 w-5 text-secondary" />
                          <h3 className="font-semibold">{item.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <Badge variant="outline" className="mb-3">{item.route}</Badge>
                        <div className="flex flex-wrap gap-2">
                          {item.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Flow Tab */}
          <TabsContent value="professional-flow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional (Arbitrator/Mediator) Workflow</CardTitle>
                <CardDescription>Managing assigned cases and issuing awards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      icon: Scale,
                      title: "View Assigned Cases",
                      description: "Dashboard shows all disputes assigned to the professional",
                      route: "/professional",
                      features: ["Case statistics", "Status overview", "Quick actions"]
                    },
                    {
                      step: 2,
                      icon: Calendar,
                      title: "Schedule Meetings",
                      description: "Set meeting dates and provide virtual meeting links",
                      route: "/professional",
                      features: ["Pick date/time", "Add meeting link", "Notify parties"]
                    },
                    {
                      step: 3,
                      icon: Video,
                      title: "Conduct Hearings",
                      description: "Meet with both parties virtually to understand the dispute",
                      features: ["Virtual meetings", "Review documents", "Gather evidence"]
                    },
                    {
                      step: 4,
                      icon: Award,
                      title: "Issue Award/Report",
                      description: "Generate final arbitration award or mediation report with PDF",
                      route: "/professional",
                      features: [
                        "Select document type",
                        "Add resolution summary",
                        "Define outcomes",
                        "Set terms & conditions",
                        "Include advocate details",
                        "Generate PDF",
                        "Digital signature"
                      ]
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 pb-6 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className="h-5 w-5 text-accent" />
                          <h3 className="font-semibold">{item.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        {item.route && <Badge variant="outline" className="mb-3">{item.route}</Badge>}
                        <div className="flex flex-wrap gap-2">
                          {item.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    PDF Award Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Technology:</strong> jsPDF library for client-side generation</p>
                  <p><strong>Contents:</strong> Case details, parties, proceedings, resolution, terms, signature</p>
                  <p><strong>Storage:</strong> Supabase Storage bucket with RLS policies</p>
                  <p><strong>Viewing:</strong> react-pdf with zoom controls, page navigation</p>
                  <p><strong>Security:</strong> Only accessible to case parties and professionals</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Trigger Events:</strong> Assignment, meeting scheduled, document issued</p>
                  <p><strong>Channels:</strong> Email (Resend API) + In-app notifications</p>
                  <p><strong>Edge Functions:</strong> send-dispute-notification for email delivery</p>
                  <p><strong>Database:</strong> notifications table with read/unread status</p>
                  <p><strong>Real-time:</strong> Bell icon with unread count</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Authentication:</strong> Email/password with auto-confirm</p>
                  <p><strong>RLS Policies:</strong> Row-level security on all tables</p>
                  <p><strong>Roles:</strong> Admin, Professional, Client (separate table)</p>
                  <p><strong>Data Privacy:</strong> Users see only their own disputes</p>
                  <p><strong>File Security:</strong> Signed URLs with expiration</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Case Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Unique ID:</strong> ODR/YYYY/NNNNNN format for each case</p>
                  <p><strong>Timeline:</strong> Visual timeline of all case events</p>
                  <p><strong>Updates:</strong> case_updates table for history tracking</p>
                  <p><strong>Status:</strong> Pending → Assigned → Meeting → Resolved</p>
                  <p><strong>Access:</strong> Public tracking with case ID lookup</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Meeting Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Scheduling:</strong> Professionals set date/time and virtual links</p>
                  <p><strong>Database:</strong> dispute_meetings table tracks all meetings</p>
                  <p><strong>Integration:</strong> Google Meet, Zoom, or any video platform</p>
                  <p><strong>Notifications:</strong> Automatic email to both parties</p>
                  <p><strong>Display:</strong> Shown on tracking page and dashboards</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Submission:</strong> dispute_documents table tracks submitted docs</p>
                  <p><strong>Types:</strong> Arbitration Award, Mediation Report</p>
                  <p><strong>Metadata:</strong> Document name, description, submitted by</p>
                  <p><strong>Viewer:</strong> Embedded PDF viewer with download option</p>
                  <p><strong>Format:</strong> Professional-grade PDF with digital signature</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Technical Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-semibold mb-2">Frontend</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• React + TypeScript</li>
                      <li>• Vite build tool</li>
                      <li>• Tailwind CSS</li>
                      <li>• shadcn/ui components</li>
                      <li>• React Router</li>
                      <li>• React Query</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Backend</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Supabase (PostgreSQL)</li>
                      <li>• Edge Functions (Deno)</li>
                      <li>• Row Level Security</li>
                      <li>• Authentication</li>
                      <li>• Storage API</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Integrations</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Resend (Email)</li>
                      <li>• jsPDF (Generation)</li>
                      <li>• react-pdf (Viewing)</li>
                      <li>• Lucide (Icons)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 bg-secondary/5 border-secondary/20">
          <CardHeader>
            <CardTitle>Demo Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">To demonstrate the complete workflow:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create a test user account via /auth (signup flow)</li>
                <li>File a sample dispute via /register with dummy data</li>
                <li>As admin, assign a professional to the case from /dashboard</li>
                <li>Switch to professional account at /professional</li>
                <li>Schedule a meeting and issue an award document</li>
                <li>Return to user view to track case and view PDF</li>
              </ol>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/register")}>
                <FileText className="mr-2 h-4 w-4" />
                File Demo Dispute
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
