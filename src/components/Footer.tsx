import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-primary p-2">
                <Scale className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">eNyaya Resolve</span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Making legal aid accessible through digital innovation. Empowering citizens with transparent, efficient dispute resolution.
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 eNyaya Resolve. A Research Prototype.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Developed by <span className="font-medium">Kishore KS</span>, guided by <span className="font-medium">Advocate Dr.Meyyappan Kumaran S</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              School of Excellence in Law, the academic wing of Tamil Nadu Dr. Ambedkar Law University (TNDALU), Chennai
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">
                  File Dispute
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-muted-foreground hover:text-primary transition-colors">
                  Track Case
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  NALSA Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
