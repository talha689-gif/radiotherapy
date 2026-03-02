import { useState } from "react";
import { format } from "date-fns";
import { type Patient } from "@shared/schema";
import { useDeletePatient } from "@/hooks/use-patients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PatientForm } from "./patient-form";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  AlertCircle,
  Calendar,
  User,
  Stethoscope
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PatientTableProps {
  patients: Patient[];
}

export function PatientTable({ patients }: PatientTableProps) {
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  
  const deleteMutation = useDeletePatient();

  // Helper to format dates safely
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return <span className="text-muted-foreground/40">-</span>;
    try {
      return (
        <span className="font-medium text-foreground/80">
          {format(new Date(dateString), "MMM d")}
        </span>
      );
    } catch {
      return "-";
    }
  };

  // Determine current status
  const getWorkflowStatus = (p: Patient) => {
    if (p.treatmentCompleted) return { label: "Completed", className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" };
    if (p.treatment) return { label: "In Treatment", className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" };
    if (p.planning || p.contouring || p.simulation || p.mdt) return { label: "In Prep", className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" };
    return { label: "New", className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" };
  };

  if (!patients.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Stethoscope className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-display font-semibold mb-2">No patients found</h3>
        <p className="text-muted-foreground max-w-md">
          There are currently no patients in the radiotherapy workflow tracker. Add a new patient to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel rounded-2xl overflow-hidden border border-border/60">
        <div className="overflow-x-auto custom-scrollbar">
          <Table className="w-full text-sm whitespace-nowrap">
            <TableHeader className="bg-muted/40 backdrop-blur-sm sticky top-0 z-10">
              <TableRow className="border-b border-border/60 hover:bg-transparent">
                <TableHead className="py-4 pl-6 font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground">Patient Name</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground">Consultant</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground">ID / Disease</TableHead>
                
                {/* Workflow Stages */}
                <TableHead className="py-4 font-semibold text-muted-foreground text-center border-l border-border/30">Card Raise</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground text-center">CT Sim</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground text-center">Simulation</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground text-center">Contouring</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground text-center">Planning</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground text-center">MDT</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground text-center bg-primary/5">Treatment</TableHead>
                <TableHead className="py-4 font-semibold text-muted-foreground text-center bg-primary/5">Completed</TableHead>
                
                <TableHead className="py-4 pr-6 text-right font-semibold text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => {
                const status = getWorkflowStatus(patient);
                return (
                  <TableRow 
                    key={patient.id} 
                    className="group border-b border-border/40 hover:bg-accent/30 transition-colors"
                  >
                    <TableCell className="pl-6 py-4">
                      <Badge variant="outline" className={`font-medium ${status.className}`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-semibold text-foreground">{patient.patientName}</div>
                      {patient.telephone && (
                        <div className="text-xs text-muted-foreground mt-0.5">{patient.telephone}</div>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground/80">{patient.consultant}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-mono text-xs text-primary bg-primary/10 inline-block px-1.5 py-0.5 rounded">
                        {patient.hospitalId || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-[120px] truncate" title={patient.disease || ''}>
                        {patient.disease || 'Unknown'}
                      </div>
                    </TableCell>
                    
                    {/* Dates */}
                    <TableCell className="py-4 text-center border-l border-border/30 bg-muted/5">{formatDate(patient.cardRaise)}</TableCell>
                    <TableCell className="py-4 text-center">{formatDate(patient.ctSimApp)}</TableCell>
                    <TableCell className="py-4 text-center">{formatDate(patient.simulation)}</TableCell>
                    <TableCell className="py-4 text-center">{formatDate(patient.contouring)}</TableCell>
                    <TableCell className="py-4 text-center">{formatDate(patient.planning)}</TableCell>
                    <TableCell className="py-4 text-center">{formatDate(patient.mdt)}</TableCell>
                    <TableCell className="py-4 text-center bg-primary/5">{formatDate(patient.treatment)}</TableCell>
                    <TableCell className="py-4 text-center bg-primary/5">{formatDate(patient.treatmentCompleted)}</TableCell>
                    
                    <TableCell className="pr-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-background shadow-sm">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setEditingPatient(patient)} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4 text-primary" />
                            Edit Record
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeletingPatient(patient)}
                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPatient} onOpenChange={(open) => !open && setEditingPatient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary">Edit Patient Record</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <div className="mt-4">
              <PatientForm patient={editingPatient} onSuccess={() => setEditingPatient(null)} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPatient} onOpenChange={(open) => !open && setDeletingPatient(null)}>
        <AlertDialogContent className="sm:rounded-2xl border-destructive/20 shadow-lg shadow-destructive/5">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              Are you sure you want to delete the record for <strong>{deletingPatient?.patientName}</strong>? 
              This action cannot be undone and will remove all workflow tracking history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="hover:bg-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingPatient && deleteMutation.mutate(deletingPatient.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
