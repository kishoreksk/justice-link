import { Button } from "@/components/ui/button";
import { ArrowRight, Scale, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-legal-aid.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-28">
      <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl" />
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm">
            <Shield className="h-4 w-4 text-secondary" />
            Powered by NALSA & DLSA
          </div>
          
          <h1 className="mb-6 text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
            eNyaya Resolve
          </h1>
          
          <p className="mb-8 text-xl text-primary-foreground/90 md:text-2xl">
            Accessible Legal Aid & Online Dispute Resolution
          </p>
          
          <p className="mb-10 text-base text-primary-foreground/80 md:text-lg">
            Empowering low-income citizens with fast, transparent, and digital contract enforcement
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="hero" asChild className="shadow-lg">
              <Link to="/register">
                Register Your Dispute <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-card/90 backdrop-blur-sm">
              <Link to="/track">Track Your Case</Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Scale className="h-8 w-8" />}
            title="Free Legal Aid"
            description="Access legal support under NALSA criteria at zero cost"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Online Mediation"
            description="Resolve disputes digitally without court visits"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Secure & Private"
            description="Your data is encrypted and handled with care"
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="group rounded-lg bg-card p-6 shadow-md transition-all hover:shadow-lg">
      <div className="mb-4 inline-flex rounded-lg bg-secondary/10 p-3 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
