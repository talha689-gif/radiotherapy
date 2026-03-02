import { useState } from "react";
import { usePatients } from "@/hooks/use-patients";
import { PatientTable } from "@/components/patient-table";
import { PatientForm } from "@/components/patient-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Activity, 
  Plus, 
  Search, 
  ActivitySquare, 
  CheckCircle2, 
  Users 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: patients, isLoading, error } = usePatients();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter patients based on search term
  const filteredPatients = patients?.filter(p => 
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.consultant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.hospitalId && p.hospitalId.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Calculate metrics
  const totalPatients = patients?.length || 0;
  const completed = patients?.filter(p => p.treatmentCompleted).length || 0;
  const inTreatment = patients?.filter(p => p.treatment && !p.treatmentCompleted).length || 0;
  const activePrep = totalPatients - completed - inTreatment;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background pb-12">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 text-primary mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
                Radiotherapy Tracker
              </h1>
            </div>
            <p className="text-muted-foreground ml-12">Manage patient workflow and treatment stages</p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search patients..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[250px] lg:w-[300px] bg-white/50 backdrop-blur-sm border-border/60 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  New Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl text-primary">Add New Patient</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <PatientForm onSuccess={() => setIsAddOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Metrics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Patients", value: totalPatients, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
            { label: "In Preparation", value: activePrep, icon: ActivitySquare, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
            { label: "In Treatment", value: inTreatment, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
            { label: "Completed", value: completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
          ].map((metric, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover-elevate">
              <div className={`p-3 rounded-xl ${metric.bg}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <h3 className="text-2xl font-display font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-8 w-12 mt-1" /> : metric.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {error ? (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start gap-3">
              <Activity className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Failed to load data</h4>
                <p className="text-sm opacity-90">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="glass-panel rounded-2xl p-6 border border-border/60">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : (
            <PatientTable patients={filteredPatients} />
          )}
        </main>
      </div>
    </div>
  );
}
