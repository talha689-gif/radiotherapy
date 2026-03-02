import { db } from "./db";
import {
  patients,
  type Patient,
  type CreatePatientRequest,
  type UpdatePatientRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: CreatePatientRequest): Promise<Patient>;
  updatePatient(id: number, updates: UpdatePatientRequest): Promise<Patient>;
  deletePatient(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(insertPatient: CreatePatientRequest): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async updatePatient(id: number, updates: UpdatePatientRequest): Promise<Patient> {
    const [updated] = await db.update(patients)
      .set(updates)
      .where(eq(patients.id, id))
      .returning();
    return updated;
  }

  async deletePatient(id: number): Promise<void> {
    await db.delete(patients).where(eq(patients.id, id));
  }
}

export const storage = new DatabaseStorage();
