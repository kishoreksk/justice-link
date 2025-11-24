import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Clock, CheckCircle2, AlertCircle, UserPlus } from "lucide-react";
import { getDisputes, updateDispute, getProfessionals, getProfessionalById, type Dispute } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = () => {
    setDisputes(getDisputes());
  };

  const handleAssignClick = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setSelectedProfessionalId(dispute.assignedProfessionalId || "");
    setIsAssignDialogOpen(true);
  };

  const handleAssignProfessional = () => {
    if (!selectedDispute || !selectedProfessionalId) return;

    const professional = getProfessionalById(selectedProfessionalId);
    if (!professional) return;

    updateDispute(selectedDispute.id, {
      assignedProfessionalId: selectedProfessionalId,
      mediator: professional.name,
      status: "In Progress - Professional Assigned",
    });

    toast({
      title: "Professional Assigned",
      description: `${professional.name} has been assigned to case ${selectedDispute.caseId}`,
    });

    loadDisputes();
    setIsAssignDialogOpen(false);
    setSelectedDispute(null);
    setSelectedProfessionalId("");
  };

  const getAssignedProfessional = (dispute: Dispute) => {
    if (!dispute.assignedProfessionalId) return null;
    return getProfessionalById(dispute.assignedProfessionalId);
  };

  const getStatusIcon = (status: string) => {
    if (status.includes("Closed") || status.includes("Resolved")) {
      return <CheckCircle2 className="h-4 w-4 text-secondary" />;
    }
    if (status.includes("Progress")) {
      return <Clock className="h-4 w-4 text-accent" />;
    }
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const stats = {
    total: disputes.length,
    pending: disputes.filter((d) => d.status.includes("Pending")).length,
    inProgress: disputes.filter((d) => d.status.includes("Progress")).length,
    resolved: disputes.filter((d) => d.status.includes("Resolved") || d.status.includes("Closed")).length,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Disputes Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of all registered disputes and their current status
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All registered cases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting assignment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Under mediation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground">Successfully closed</p>
              </CardContent>
            </Card>
          </div>

          {/* Disputes Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Disputes</CardTitle>
              <CardDescription>A complete list of registered disputes</CardDescription>
            </CardHeader>
            <CardContent>
              {disputes.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No disputes yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Disputes will appear here once they are registered
                  </p>
                  <Button asChild>
                    <Link to="/register">Register New Dispute</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contract Type</TableHead>
                      <TableHead>Resolution Method</TableHead>
                      <TableHead>Filed Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Legal Aid</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((dispute) => {
                      const assignedProfessional = getAssignedProfessional(dispute);
                      return (
                        <TableRow key={dispute.id}>
                          <TableCell className="font-medium">{dispute.caseId}</TableCell>
                          <TableCell>{dispute.applicant.name}</TableCell>
                          <TableCell>{dispute.contractType}</TableCell>
                          <TableCell>
                            {dispute.resolutionType ? (
                              <Badge variant="outline" className="capitalize">
                                {dispute.resolutionType.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not specified</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(dispute.filedDate).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(dispute.status)}
                              <span className="text-sm">{dispute.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {assignedProfessional ? (
                              <div className="text-sm">
                                <div className="font-medium">{assignedProfessional.name}</div>
                                <div className="text-muted-foreground capitalize">
                                  {assignedProfessional.type.replace("_", " ")}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not Assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={dispute.legalAidEligible ? "default" : "secondary"}>
                              {dispute.legalAidEligible ? "Eligible" : "Not Eligible"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignClick(dispute)}
                              >
                                <UserPlus className="mr-1 h-3 w-3" />
                                Assign
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/track?caseId=${dispute.caseId}`}>View</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Assign Professional Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Professional</DialogTitle>
            <DialogDescription>
              Select a professional to assign to case {selectedDispute?.caseId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Professional</label>
              <Select
                value={selectedProfessionalId}
                onValueChange={setSelectedProfessionalId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a professional..." />
                </SelectTrigger>
                <SelectContent>
                  {getProfessionals()
                    .filter((p) => p.status === "active")
                    .map((professional) => (
                      <SelectItem key={professional.id} value={professional.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{professional.name}</span>
                          <span className="text-muted-foreground text-xs">
                            ({professional.type.replace("_", " ")})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfessionalId && getProfessionalById(selectedProfessionalId) && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <h4 className="font-semibold text-sm">Professional Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Specialization:</span>
                    <p className="font-medium">
                      {getProfessionalById(selectedProfessionalId)?.specialization}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Experience:</span>
                    <p className="font-medium">
                      {getProfessionalById(selectedProfessionalId)?.experience} years
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">
                      {getProfessionalById(selectedProfessionalId)?.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">
                      {getProfessionalById(selectedProfessionalId)?.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignProfessional} disabled={!selectedProfessionalId}>
              Assign Professional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
