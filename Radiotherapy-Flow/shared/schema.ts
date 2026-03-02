import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  consultant: text("consultant").notNull(),
  patientName: text("patient_name").notNull(),
  telephone: text("telephone"),
  disease: text("disease"),
  intent: text("intent"),
  hospitalId: text("hospital_id"),
  
  // Workflow dates
  cardRaise: timestamp("card_raise"),
  ctSimApp: timestamp("ct_sim_app"),
  simulation: timestamp("simulation"),
  contouring: timestamp("contouring"),
  planning: timestamp("planning"),
  mdt: timestamp("mdt"),
  treatment: timestamp("treatment"),
  treatmentCompleted: timestamp("treatment_completed"),
});

export const insertPatientSchema = createInsertSchema(patients).omit({ id: true });

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type CreatePatientRequest = InsertPatient;
export type UpdatePatientRequest = Partial<InsertPatient>;
