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
  Lock,
  Presentation
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            System Demo & Walkthrough
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete overview of eNyaya Resolve features and workflows
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="border-b-2 border-border mb-8">
            <TabsList className="h-auto bg-transparent p-0 w-full justify-start gap-0">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-4 transition-all hover:text-primary"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="user-flow" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-4 transition-all hover:text-primary"
              >
                User Flow
              </TabsTrigger>
              <TabsTrigger 
                value="admin-flow" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:text-secondary px-6 py-4 transition-all hover:text-secondary"
              >
                Admin Flow
              </TabsTrigger>
              <TabsTrigger 
                value="professional-flow" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent px-6 py-4 transition-all hover:text-accent"
              >
                Professional Flow
              </TabsTrigger>
              <TabsTrigger 
                value="features" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-4 transition-all hover:text-primary"
              >
                Key Features
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardTitle className="text-2xl">System Architecture</CardTitle>
                <CardDescription>Understanding the eNyaya Resolve platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="group p-6 border-2 rounded-lg hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-primary/5 to-transparent">
                    <Users className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-2 text-lg">Three User Roles</h3>
                    <p className="text-sm text-muted-foreground">Clients, Professionals, and Administrators</p>
                  </div>
                  <div className="group p-6 border-2 rounded-lg hover:border-secondary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-secondary/5 to-transparent">
                    <Scale className="h-10 w-10 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-2 text-lg">ODR Platform</h3>
                    <p className="text-sm text-muted-foreground">Online Dispute Resolution with mediation & arbitration</p>
                  </div>
                  <div className="group p-6 border-2 rounded-lg hover:border-accent hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-accent/5 to-transparent">
                    <Shield className="h-10 w-10 text-accent mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-2 text-lg">Legal Aid Integration</h3>
                    <p className="text-sm text-muted-foreground">Eligibility assessment based on income criteria</p>
                  </div>
                </div>

                <div className="border-t-2 pt-6 bg-gradient-to-r from-muted/30 to-transparent rounded-lg p-6">
                  <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Core Components
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-primary">Authentication:</strong> Secure login/signup with role-based access control</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-primary">Database:</strong> PostgreSQL with Row-Level Security policies</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-primary">Storage:</strong> Secure document storage for award PDFs</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-primary">Notifications:</strong> Real-time updates via edge functions</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Flow Tab */}
          <TabsContent value="user-flow" className="space-y-6 animate-fade-in">
            <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Client/User Journey
                </CardTitle>
                <CardDescription>Step-by-step workflow for dispute filers</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  {[
                    {
                      step: 1,
                      icon: FileText,
                      title: "Register Dispute",
                      description: "User fills out the dispute registration form with applicant, respondent, and contract details",
                      actions: ["Navigate to /register", "Fill all required fields", "Submit dispute"],
                      color: "primary"
                    },
                    {
                      step: 2,
                      icon: Shield,
                      title: "Legal Aid Assessment",
                      description: "System automatically checks eligibility based on annual income (<₹5,00,000)",
                      actions: ["Income verified", "Legal aid flag set", "Case ID generated"],
                      color: "secondary"
                    },
                    {
                      step: 3,
                      icon: Search,
                      title: "Track Case",
                      description: "User can track case progress using unique Case ID",
                      actions: ["Visit /track page", "Enter Case ID", "View real-time status"],
                      color: "accent"
                    },
                    {
                      step: 4,
                      icon: Bell,
                      title: "Receive Notifications",
                      description: "User gets notified when professional is assigned or meeting is scheduled",
                      actions: ["Email notifications", "In-app bell icon", "Case updates timeline"],
                      color: "primary"
                    },
                    {
                      step: 5,
                      icon: Video,
                      title: "Attend Meetings",
                      description: "Join virtual meetings via provided links",
                      actions: ["Click meeting link", "Participate online", "No court visit needed"],
                      color: "secondary"
                    },
                    {
                      step: 6,
                      icon: Award,
                      title: "Receive Award",
                      description: "View and download final arbitration award or mediation report as PDF",
                      actions: ["PDF viewable in portal", "Download option", "Legally binding document"],
                      color: "accent"
                    }
                  ].map((item, index) => (
                    <div 
                      key={item.step} 
                      className="group flex gap-4 pb-8 border-b last:border-0 relative hover:scale-[1.02] transition-transform duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-shrink-0 relative">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${item.color} text-${item.color}-foreground font-bold text-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                          {item.step}
                        </div>
                        {index < 5 && (
                          <div className="absolute top-12 left-1/2 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-transparent -translate-x-1/2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <item.icon className={`h-6 w-6 text-${item.color} group-hover:scale-110 transition-transform`} />
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.actions.map((action, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs hover:bg-primary/10 transition-colors">
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
          <TabsContent value="features" className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-muted-foreground">Comprehensive capabilities powering the eNyaya Resolve platform</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* PDF Award Generation */}
              <Card className="group relative overflow-hidden border-2 hover:border-primary/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative bg-gradient-to-br from-primary/10 to-transparent pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Award className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">Essential</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    PDF Award Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4 text-sm pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Client-Side Generation</p>
                        <p className="text-muted-foreground text-xs">jsPDF library for instant PDF creation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Secure Storage</p>
                        <p className="text-muted-foreground text-xs">RLS-protected Supabase buckets</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Advanced Viewer</p>
                        <p className="text-muted-foreground text-xs">Zoom, navigate, and download options</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification System */}
              <Card className="group relative overflow-hidden border-2 hover:border-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative bg-gradient-to-br from-secondary/10 to-transparent pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 rounded-2xl bg-secondary/10 group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                      <Bell className="h-8 w-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
                    </div>
                    <Badge variant="outline" className="border-secondary/50 text-secondary">Real-time</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-secondary transition-colors">
                    Notification System
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4 text-sm pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Multi-Channel</p>
                        <p className="text-muted-foreground text-xs">Email + in-app notifications</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Edge Functions</p>
                        <p className="text-muted-foreground text-xs">Serverless email delivery</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Status Tracking</p>
                        <p className="text-muted-foreground text-xs">Read/unread management</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="group relative overflow-hidden border-2 hover:border-accent/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative bg-gradient-to-br from-accent/10 to-transparent pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 rounded-2xl bg-accent/10 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                      <Shield className="h-8 w-8 text-accent group-hover:text-accent-foreground transition-colors" />
                    </div>
                    <Badge variant="outline" className="border-accent/50 text-accent">Critical</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-accent transition-colors">
                    Security & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4 text-sm pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Row-Level Security</p>
                        <p className="text-muted-foreground text-xs">Database-level access control</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Role-Based Access</p>
                        <p className="text-muted-foreground text-xs">Admin, Professional, Client roles</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Encrypted Storage</p>
                        <p className="text-muted-foreground text-xs">Secure file handling with signed URLs</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Case Tracking */}
              <Card className="group relative overflow-hidden border-2 hover:border-primary/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative bg-gradient-to-br from-primary/10 to-transparent pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Search className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">Public</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    Case Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4 text-sm pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Unique Case IDs</p>
                        <p className="text-muted-foreground text-xs">ODR/YYYY/NNNNNN format</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Visual Timeline</p>
                        <p className="text-muted-foreground text-xs">Complete event history</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Status Updates</p>
                        <p className="text-muted-foreground text-xs">Real-time progress tracking</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meeting Management */}
              <Card className="group relative overflow-hidden border-2 hover:border-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative bg-gradient-to-br from-secondary/10 to-transparent pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 rounded-2xl bg-secondary/10 group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                      <Calendar className="h-8 w-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
                    </div>
                    <Badge variant="outline" className="border-secondary/50 text-secondary">Virtual</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-secondary transition-colors">
                    Meeting Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4 text-sm pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Flexible Scheduling</p>
                        <p className="text-muted-foreground text-xs">Date, time, and link management</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Platform Agnostic</p>
                        <p className="text-muted-foreground text-xs">Works with any video platform</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Auto Notifications</p>
                        <p className="text-muted-foreground text-xs">Email alerts to all parties</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Management */}
              <Card className="group relative overflow-hidden border-2 hover:border-accent/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative bg-gradient-to-br from-accent/10 to-transparent pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 rounded-2xl bg-accent/10 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                      <FileText className="h-8 w-8 text-accent group-hover:text-accent-foreground transition-colors" />
                    </div>
                    <Badge variant="outline" className="border-accent/50 text-accent">Core</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-accent transition-colors">
                    Document Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4 text-sm pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Submission Tracking</p>
                        <p className="text-muted-foreground text-xs">Complete audit trail of documents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Multiple Types</p>
                        <p className="text-muted-foreground text-xs">Awards, reports, evidence</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Digital Signatures</p>
                        <p className="text-muted-foreground text-xs">Legally binding documents</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Technical Stack Section */}
            <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden mt-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
              <CardHeader className="relative bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b-2">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                    <Scale className="h-6 w-6 text-primary-foreground" />
                  </div>
                  Technical Stack
                </CardTitle>
                <CardDescription>Modern technologies powering the platform</CardDescription>
              </CardHeader>
              <CardContent className="relative pt-8">
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="group p-6 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border-2 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary group-hover:scale-110 transition-all">
                        <Users className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <h4 className="font-semibold text-lg text-primary">Frontend</h4>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-primary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">React + TypeScript</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-primary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">Vite build tool</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-primary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">Tailwind CSS</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-primary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">shadcn/ui components</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-primary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">React Router</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="group p-6 rounded-xl bg-gradient-to-br from-secondary/5 to-transparent border-2 hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-secondary/20 group-hover:bg-secondary group-hover:scale-110 transition-all">
                        <Shield className="h-5 w-5 text-secondary group-hover:text-secondary-foreground transition-colors" />
                      </div>
                      <h4 className="font-semibold text-lg text-secondary">Backend</h4>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-secondary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary"></div>
                        <span className="text-muted-foreground">Supabase (PostgreSQL)</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-secondary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary"></div>
                        <span className="text-muted-foreground">Edge Functions (Deno)</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-secondary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary"></div>
                        <span className="text-muted-foreground">Row Level Security</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-secondary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary"></div>
                        <span className="text-muted-foreground">Authentication</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-secondary/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary"></div>
                        <span className="text-muted-foreground">Storage API</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="group p-6 rounded-xl bg-gradient-to-br from-accent/5 to-transparent border-2 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent group-hover:scale-110 transition-all">
                        <Award className="h-5 w-5 text-accent group-hover:text-accent-foreground transition-colors" />
                      </div>
                      <h4 className="font-semibold text-lg text-accent">Integrations</h4>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-accent/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                        <span className="text-muted-foreground">Resend (Email)</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-accent/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                        <span className="text-muted-foreground">jsPDF (Generation)</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-accent/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                        <span className="text-muted-foreground">react-pdf (Viewing)</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded hover:bg-accent/5 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                        <span className="text-muted-foreground">Lucide (Icons)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 border-2 shadow-xl bg-gradient-to-br from-secondary/10 via-card to-accent/10 animate-fade-in">
          <CardHeader className="border-b bg-gradient-to-r from-secondary/20 to-accent/20">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Presentation className="h-6 w-6" />
              Demo Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="p-6 rounded-lg bg-card/80 backdrop-blur-sm border-2 border-primary/20">
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Complete Workflow Demonstration
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                <li className="hover:bg-muted/50 p-2 rounded transition-colors">Create a test user account via /auth (signup flow)</li>
                <li className="hover:bg-muted/50 p-2 rounded transition-colors">File a sample dispute via /register with dummy data</li>
                <li className="hover:bg-muted/50 p-2 rounded transition-colors">As admin, assign a professional to the case from /dashboard</li>
                <li className="hover:bg-muted/50 p-2 rounded transition-colors">Switch to professional account at /professional</li>
                <li className="hover:bg-muted/50 p-2 rounded transition-colors">Schedule a meeting and issue an award document</li>
                <li className="hover:bg-muted/50 p-2 rounded transition-colors">Return to user view to track case and view PDF</li>
              </ol>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={() => navigate("/register")}
                className="hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                size="lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                File Demo Dispute
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                className="hover:scale-105 transition-transform"
                size="lg"
              >
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
