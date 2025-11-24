import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, Scale, Shield, CheckCircle, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      
      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground">Simple steps to resolve your dispute</p>
          </div>
          
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { step: "1", icon: FileText, title: "Register", desc: "File your dispute online" },
                { step: "2", icon: Shield, title: "Assess", desc: "Check legal aid eligibility" },
                { step: "3", icon: Users, title: "Mediate", desc: "Work with assigned mediator" },
                { step: "4", icon: CheckCircle, title: "Resolve", desc: "Get digital settlement" },
              ].map((item) => (
                <Card key={item.step} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                      {item.step}
                    </div>
                    <item.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                    <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Impact Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Making a Difference</h2>
            <p className="text-muted-foreground">Our platform's potential impact on access to justice</p>
          </div>
          
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <Card className="border-secondary/20 bg-secondary/5">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="mx-auto mb-4 h-10 w-10 text-secondary" />
                <div className="mb-2 text-3xl font-bold text-secondary">60%</div>
                <p className="text-sm text-muted-foreground">Faster dispute resolution</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 text-center">
                <Scale className="mx-auto mb-4 h-10 w-10 text-primary" />
                <div className="mb-2 text-3xl font-bold text-primary">Zero Cost</div>
                <p className="text-sm text-muted-foreground">For eligible legal aid applicants</p>
              </CardContent>
            </Card>
            
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="pt-6 text-center">
                <Users className="mx-auto mb-4 h-10 w-10 text-accent" />
                <div className="mb-2 text-3xl font-bold text-accent">100%</div>
                <p className="text-sm text-muted-foreground">Digital, transparent process</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
