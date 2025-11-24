import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, FileText, UserCheck, Scale } from "lucide-react";

const contractTypes = [
  "Loan Agreement",
  "Lease/Rental Agreement",
  "Employment Contract",
  "Purchase Agreement",
  "Service Contract",
  "Insurance Policy",
  "Other",
];

const steps = [
  { id: 1, name: "Dispute Details", icon: FileText },
  { id: 2, name: "Party Information", icon: UserCheck },
  { id: 3, name: "Legal Aid Check", icon: Scale },
];

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    contractType: "",
    issueDescription: "",
    contractDate: "",
    applicantName: "",
    applicantContact: "",
    applicantEmail: "",
    respondentName: "",
    respondentContact: "",
    annualIncome: "",
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check eligibility for legal aid (simplified check)
    const income = parseInt(formData.annualIncome);
    const isEligible = income < 500000; // ₹5 lakhs threshold (example)
    
    toast({
      title: "Dispute Registered Successfully!",
      description: isEligible 
        ? "You qualify for free legal aid. A mediator will be assigned shortly."
        : "Your case has been registered. Mediation will proceed shortly.",
    });
    
    // In a real app, this would send data to backend
    console.log("Form submitted:", formData, "Eligible:", isEligible);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-foreground">Register Your Dispute</h1>
              <p className="text-muted-foreground">Complete the form to initiate your dispute resolution</p>
            </div>
            
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                          currentStep >= step.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="mt-2 text-xs font-medium text-muted-foreground">
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-4 h-0.5 flex-1 transition-colors ${
                          currentStep > step.id ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentStep === 1 && "Step 1: Dispute Details"}
                    {currentStep === 2 && "Step 2: Party Information"}
                    {currentStep === 3 && "Step 3: Legal Aid Assessment"}
                  </CardTitle>
                  <CardDescription>
                    {currentStep === 1 && "Tell us about your contract dispute"}
                    {currentStep === 2 && "Provide contact information for involved parties"}
                    {currentStep === 3 && "Check eligibility for free legal assistance"}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Step 1: Dispute Details */}
                  {currentStep === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="contractType">Contract Type *</Label>
                        <Select
                          value={formData.contractType}
                          onValueChange={(value) => handleInputChange("contractType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select contract type" />
                          </SelectTrigger>
                          <SelectContent>
                            {contractTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contractDate">Contract Date *</Label>
                        <Input
                          id="contractDate"
                          type="date"
                          value={formData.contractDate}
                          onChange={(e) => handleInputChange("contractDate", e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="issueDescription">Issue Description *</Label>
                        <Textarea
                          id="issueDescription"
                          placeholder="Describe your dispute in detail..."
                          value={formData.issueDescription}
                          onChange={(e) => handleInputChange("issueDescription", e.target.value)}
                          rows={6}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Include key dates, amounts, and specific violations
                        </p>
                      </div>
                    </>
                  )}
                  
                  {/* Step 2: Party Information */}
                  {currentStep === 2 && (
                    <>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Applicant Details</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="applicantName">Full Name *</Label>
                          <Input
                            id="applicantName"
                            value={formData.applicantName}
                            onChange={(e) => handleInputChange("applicantName", e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="applicantContact">Contact Number *</Label>
                            <Input
                              id="applicantContact"
                              type="tel"
                              value={formData.applicantContact}
                              onChange={(e) => handleInputChange("applicantContact", e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="applicantEmail">Email Address *</Label>
                            <Input
                              id="applicantEmail"
                              type="email"
                              value={formData.applicantEmail}
                              onChange={(e) => handleInputChange("applicantEmail", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Respondent Details</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="respondentName">Full Name *</Label>
                          <Input
                            id="respondentName"
                            value={formData.respondentName}
                            onChange={(e) => handleInputChange("respondentName", e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="respondentContact">Contact Number (if known)</Label>
                          <Input
                            id="respondentContact"
                            type="tel"
                            value={formData.respondentContact}
                            onChange={(e) => handleInputChange("respondentContact", e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Step 3: Legal Aid Check */}
                  {currentStep === 3 && (
                    <>
                      <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-6">
                        <div className="mb-4 flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-secondary" />
                          <div>
                            <h3 className="font-semibold text-foreground">Legal Aid Eligibility</h3>
                            <p className="text-sm text-muted-foreground">
                              Under NALSA guidelines, citizens with annual income below ₹5 lakhs qualify for free legal assistance.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="annualIncome">Annual Household Income (₹) *</Label>
                        <Input
                          id="annualIncome"
                          type="number"
                          placeholder="Enter annual income"
                          value={formData.annualIncome}
                          onChange={(e) => handleInputChange("annualIncome", e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          This information is kept confidential and used only for eligibility assessment
                        </p>
                      </div>
                      
                      <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <h4 className="mb-2 text-sm font-medium text-foreground">What happens next?</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-secondary">•</span>
                            Your case will be reviewed within 48 hours
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-secondary">•</span>
                            A mediator will be assigned to facilitate resolution
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-secondary">•</span>
                            You'll receive updates via email and SMS
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-secondary">•</span>
                            If eligible, legal aid will be provided at no cost
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                    >
                      Back
                    </Button>
                    
                    {currentStep < 3 ? (
                      <Button type="button" onClick={handleNext}>
                        Next
                      </Button>
                    ) : (
                      <Button type="submit" variant="success">
                        Submit Dispute
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
