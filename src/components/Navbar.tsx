import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">eNyaya Resolve</span>
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/register" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              File Dispute
            </Link>
            <Link to="/track" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Track Case
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </div>
          
          <Button size="sm" variant="success" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
