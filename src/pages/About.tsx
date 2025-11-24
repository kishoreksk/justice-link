import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Zap, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold text-foreground">About eNyaya Resolve</h1>
              <p className="text-lg text-muted-foreground">
                Bridging the justice gap through technology and legal aid integration
              </p>
            </div>
            
            <div className="mb-12 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    eNyaya Resolve is a research prototype designed to demonstrate how digital platforms can make 
                    contract enforcement and legal aid accessible to low-income citizens across India.
                  </p>
                  <p className="text-muted-foreground">
                    By integrating with NALSA (National Legal Services Authority) and DLSA (District Legal Services 
                    Authority) frameworks, we aim to reduce the burden on physical courts while ensuring that 
                    justice remains accessible to all.
                  </p>
                </CardContent>
              </Card>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-3">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Our Goal</CardTitle>
                    <CardDescription>Empowering citizens through digital justice</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      To create a transparent, efficient, and accessible dispute resolution system that helps 
                      low-income citizens enforce contracts without the cost and complexity of traditional litigation.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="mb-2 inline-flex rounded-lg bg-secondary/10 p-3">
                      <Zap className="h-6 w-6 text-secondary" />
                    </div>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>Simple, fast, and effective</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Users register disputes online, get assessed for legal aid eligibility, and are matched with 
                      mediators who facilitate resolution through our secure digital platform.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="mb-2 inline-flex rounded-lg bg-accent/10 p-3">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle>Who We Serve</CardTitle>
                    <CardDescription>Focused on accessibility</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Primarily serving low-income citizens with contract disputes involving loans, leases, 
                      employment, purchases, and other small-value matters that often go unresolved.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="mb-2 inline-flex rounded-lg bg-destructive/10 p-3">
                      <Shield className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>Your data is protected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      All personal information is encrypted and anonymized in reports. We follow strict data 
                      protection protocols aligned with Digital India initiatives.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Research Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  This platform serves as an empirical model for tech-enabled contract enforcement, supporting 
                  UN Sustainable Development Goal 16: Peace, Justice and Strong Institutions.
                </p>
                <p className="text-muted-foreground">
                  Our work aligns with Government of India's E-Courts Mission and NALSA's vision of making 
                  legal services accessible to every citizen, regardless of their economic status.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
