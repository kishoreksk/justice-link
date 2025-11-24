import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDisputeById, type Dispute } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function Track() {
  const [searchParams] = useSearchParams();
  const [caseId, setCaseId] = useState("");
  const [caseData, setCaseData] = useState<Dispute | null>(null);

  useEffect(() => {
    const urlCaseId = searchParams.get("caseId");
    if (urlCaseId) {
      setCaseId(urlCaseId);
      loadCase(urlCaseId);
    }
  }, [searchParams]);

  const loadCase = (id: string) => {
    const dispute = getDisputeById(id);
    setCaseData(dispute || null);
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
            
            {/* Case Details */}
            {caseData && (
              <div className="space-y-6">
                {/* Case Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{caseData.caseId}</CardTitle>
                        <CardDescription className="mt-1">
                          Filed on {new Date(caseData.filedDate).toLocaleDateString('en-IN', {
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
                        <p className="font-medium text-foreground">{caseData.applicant.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contract Type</p>
                        <p className="font-medium text-foreground">{caseData.contractType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mediator</p>
                        <p className="font-medium text-foreground">{caseData.mediator || "Not Assigned"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Legal Aid Eligible</p>
                        <p className="font-medium text-foreground">
                          {caseData.legalAidEligible ? "Yes" : "No"}
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
                    <div className="space-y-6">
                      {caseData.updates.map((update, index) => (
                        <div key={index} className="flex gap-4">
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
                            {index < caseData.updates.length - 1 && (
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
