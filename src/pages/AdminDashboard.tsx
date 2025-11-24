import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import {
  getProfessionals,
  saveProfessional,
  updateProfessional,
  deleteProfessional,
  type Professional,
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "mediator" as Professional["type"],
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    status: "active" as Professional["status"],
  });

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    loadProfessionals();
  };

  const loadProfessionals = () => {
    setProfessionals(getProfessionals());
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "mediator",
      email: "",
      phone: "",
      specialization: "",
      experience: "",
      status: "active",
    });
    setEditingProfessional(null);
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      type: professional.type,
      email: professional.email,
      phone: professional.phone,
      specialization: professional.specialization,
      experience: professional.experience.toString(),
      status: professional.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this professional?")) {
      deleteProfessional(id);
      loadProfessionals();
      toast({
        title: "Professional Deleted",
        description: "The professional has been removed successfully.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProfessional) {
      updateProfessional(editingProfessional.id, {
        ...formData,
        experience: parseInt(formData.experience),
      });
      toast({
        title: "Professional Updated",
        description: "The professional details have been updated successfully.",
      });
    } else {
      const newProfessional: Professional = {
        id: crypto.randomUUID(),
        ...formData,
        experience: parseInt(formData.experience),
        casesHandled: 0,
        createdAt: new Date().toISOString(),
      };
      saveProfessional(newProfessional);
      toast({
        title: "Professional Added",
        description: "New professional has been added successfully.",
      });
    }

    loadProfessionals();
    setIsDialogOpen(false);
    resetForm();
  };

  const getProfessionalTypeLabel = (type: Professional["type"]) => {
    const labels = {
      mediator: "Mediator",
      arbitrator: "Arbitrator",
      legal_aid_advocate: "Legal Aid Advocate",
    };
    return labels[type];
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {loading ? (
        <main className="flex-1 bg-background py-12 flex items-center justify-center">
          <div>Loading...</div>
        </main>
      ) : !isAdmin ? null : (
        <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Professional Management</h1>
              <p className="text-muted-foreground">
                Manage arbitrators, mediators, and legal aid advocates
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="success">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Professional
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingProfessional ? "Edit Professional" : "Add New Professional"}
                    </DialogTitle>
                    <DialogDescription>
                      Enter the details of the professional below
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="type">Professional Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: Professional["type"]) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mediator">Mediator</SelectItem>
                          <SelectItem value="arbitrator">Arbitrator</SelectItem>
                          <SelectItem value="legal_aid_advocate">Legal Aid Advocate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        required
                        placeholder="e.g., Contract Law, Family Law"
                        value={formData.specialization}
                        onChange={(e) =>
                          setFormData({ ...formData, specialization: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        required
                        min="0"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: Professional["status"]) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit">
                      {editingProfessional ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Professionals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{professionals.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mediators</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {professionals.filter((p) => p.type === "mediator").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Arbitrators</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {professionals.filter((p) => p.type === "arbitrator").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Legal Aid Advocates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {professionals.filter((p) => p.type === "legal_aid_advocate").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professionals Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Professionals</CardTitle>
              <CardDescription>
                View and manage all registered professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {professionals.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    No professionals yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get started by adding your first professional
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professionals.map((professional) => (
                      <TableRow key={professional.id}>
                        <TableCell className="font-medium">{professional.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getProfessionalTypeLabel(professional.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>{professional.specialization}</TableCell>
                        <TableCell>{professional.experience} years</TableCell>
                        <TableCell>
                          <Badge
                            variant={professional.status === "active" ? "default" : "secondary"}
                          >
                            {professional.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{professional.email}</div>
                            <div className="text-muted-foreground">{professional.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(professional)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(professional.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
      )}

      <Footer />
    </div>
  );
}
