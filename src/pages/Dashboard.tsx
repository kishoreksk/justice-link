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
import { FileText, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { getDisputes, type Dispute } from "@/lib/storage";

export default function Dashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = () => {
    setDisputes(getDisputes());
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
                      <TableHead>Filed Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Legal Aid</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-medium">{dispute.caseId}</TableCell>
                        <TableCell>{dispute.applicant.name}</TableCell>
                        <TableCell>{dispute.contractType}</TableCell>
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
                            <span>{dispute.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={dispute.legalAidEligible ? "default" : "secondary"}>
                            {dispute.legalAidEligible ? "Eligible" : "Not Eligible"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/track?caseId=${dispute.caseId}`}>View Details</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
