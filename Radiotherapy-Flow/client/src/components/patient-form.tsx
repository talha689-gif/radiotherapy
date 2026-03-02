import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Patient } from "@shared/schema";
import { useCreatePatient, useUpdatePatient } from "@/hooks/use-patients";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DatePickerField } from "./date-picker-field";
import { Loader2, Activity } from "lucide-react";

// Frontend validation schema that handles Date objects from the picker
const formSchema = z.object({
  consultant: z.string().min(1, "Consultant is required"),
  patientName: z.string().min(1, "Patient Name is required"),
  telephone: z.string().nullable().optional(),
  disease: z.string().nullable().optional(),
  intent: z.string().nullable().optional(),
  hospitalId: z.string().nullable().optional(),
  
  // Dates
  cardRaise: z.date().nullable().optional(),
  ctSimApp: z.date().nullable().optional(),
  simulation: z.date().nullable().optional(),
  contouring: z.date().nullable().optional(),
  planning: z.date().nullable().optional(),
  mdt: z.date().nullable().optional(),
  treatment: z.date().nullable().optional(),
  treatmentCompleted: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PatientFormProps {
  patient?: Patient | null;
  onSuccess: () => void;
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      consultant: "",
      patientName: "",
      telephone: "",
      disease: "",
      intent: "",
      hospitalId: "",
      cardRaise: null,
      ctSimApp: null,
      simulation: null,
      contouring: null,
      planning: null,
      mdt: null,
      treatment: null,
      treatmentCompleted: null,
    },
  });

  // Reset form when patient changes (for editing)
  useEffect(() => {
    if (patient) {
      form.reset({
        consultant: patient.consultant,
        patientName: patient.patientName,
        telephone: patient.telephone || "",
        disease: patient.disease || "",
        intent: patient.intent || "",
        hospitalId: patient.hospitalId || "",
        cardRaise: patient.cardRaise ? new Date(patient.cardRaise) : null,
        ctSimApp: patient.ctSimApp ? new Date(patient.ctSimApp) : null,
        simulation: patient.simulation ? new Date(patient.simulation) : null,
        contouring: patient.contouring ? new Date(patient.contouring) : null,
        planning: patient.planning ? new Date(patient.planning) : null,
        mdt: patient.mdt ? new Date(patient.mdt) : null,
        treatment: patient.treatment ? new Date(patient.treatment) : null,
        treatmentCompleted: patient.treatmentCompleted ? new Date(patient.treatmentCompleted) : null,
      });
    } else {
      form.reset({
        consultant: "",
        patientName: "",
        telephone: "",
        disease: "",
        intent: "",
        hospitalId: "",
        cardRaise: new Date(), // Default to today for new records
        ctSimApp: null,
        simulation: null,
        contouring: null,
        planning: null,
        mdt: null,
        treatment: null,
        treatmentCompleted: null,
      });
    }
  }, [patient, form]);

  const onSubmit = async (values: FormValues) => {
    // Convert Date objects back to ISO strings for API payload if they exist
    const payload: any = { ...values };
    
    // Convert date fields if present
    const dateFields = ['cardRaise', 'ctSimApp', 'simulation', 'contouring', 'planning', 'mdt', 'treatment', 'treatmentCompleted'];
    dateFields.forEach(field => {
      if (payload[field] instanceof Date) {
        payload[field] = payload[field].toISOString();
      }
    });

    if (patient) {
      await updateMutation.mutateAsync({ id: patient.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Section 1: Patient Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="w-5 h-5" />
            <h3 className="font-display text-lg font-semibold tracking-tight">Patient Information</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="bg-background/50 focus:bg-background transition-colors" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hospitalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Hospital ID</FormLabel>
                  <FormControl>
                    <Input placeholder="HOSP-12345" className="bg-background/50 focus:bg-background transition-colors" value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consultant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Consultant</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Smith" className="bg-background/50 focus:bg-background transition-colors" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Telephone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 000-0000" className="bg-background/50 focus:bg-background transition-colors" value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disease"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Disease</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Prostate Ca" className="bg-background/50 focus:bg-background transition-colors" value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="intent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Intent</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Radical / Palliative" className="bg-background/50 focus:bg-background transition-colors" value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Section 2: Workflow Timeline */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <svg xmlns="http://www.w3.org/-2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <h3 className="font-display text-lg font-semibold tracking-tight">Workflow Timeline</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
            <DatePickerField form={form} name="cardRaise" label="Card Raise" />
            <DatePickerField form={form} name="ctSimApp" label="CT Sim App" />
            <DatePickerField form={form} name="simulation" label="Simulation" />
            <DatePickerField form={form} name="contouring" label="Contouring" />
            
            <DatePickerField form={form} name="planning" label="Planning" />
            <DatePickerField form={form} name="mdt" label="MDT" />
            <DatePickerField form={form} name="treatment" label="Treatment" />
            <DatePickerField form={form} name="treatmentCompleted" label="Completed" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onSuccess}
            className="hover:bg-muted"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {patient ? "Save Changes" : "Create Record"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
