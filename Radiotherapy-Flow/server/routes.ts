import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed database with example patients if empty
  app.get('/api/seed', async (req, res) => {
    try {
      const existingPatients = await storage.getPatients();
      if (existingPatients.length === 0) {
        await storage.createPatient({
          consultant: "Dr. Smith",
          patientName: "John Doe",
          telephone: "555-0101",
          disease: "Prostate Cancer",
          intent: "Radical",
          hospitalId: "H-10001",
          cardRaise: new Date(new Date().setDate(new Date().getDate() - 14)),
          ctSimApp: new Date(new Date().setDate(new Date().getDate() - 10)),
          simulation: new Date(new Date().setDate(new Date().getDate() - 9)),
          contouring: new Date(new Date().setDate(new Date().getDate() - 7)),
          planning: new Date(new Date().setDate(new Date().getDate() - 4)),
        });

        await storage.createPatient({
          consultant: "Dr. Adams",
          patientName: "Jane Smith",
          telephone: "555-0202",
          disease: "Breast Cancer",
          intent: "Adjuvant",
          hospitalId: "H-10002",
          cardRaise: new Date(new Date().setDate(new Date().getDate() - 5)),
          ctSimApp: new Date(new Date().setDate(new Date().getDate() - 2)),
        });

        await storage.createPatient({
          consultant: "Dr. Brown",
          patientName: "Robert Johnson",
          telephone: "555-0303",
          disease: "Lung Cancer",
          intent: "Palliative",
          hospitalId: "H-10003",
          cardRaise: new Date(),
        });
      }
      res.json({ message: "Database seeded" });
    } catch (error) {
      console.error("Seed error", error);
      res.status(500).json({ error: "Failed to seed" });
    }
  });

  app.get(api.patients.list.path, async (req, res) => {
    try {
      const patientsList = await storage.getPatients();
      res.json(patientsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get(api.patients.get.path, async (req, res) => {
    try {
      const patient = await storage.getPatient(Number(req.params.id));
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post(api.patients.create.path, async (req, res) => {
    try {
      // Coerce string dates from the form into real Dates
      const inputSchema = api.patients.create.input.extend({
        cardRaise: z.coerce.date().optional().nullable(),
        ctSimApp: z.coerce.date().optional().nullable(),
        simulation: z.coerce.date().optional().nullable(),
        contouring: z.coerce.date().optional().nullable(),
        planning: z.coerce.date().optional().nullable(),
        mdt: z.coerce.date().optional().nullable(),
        treatment: z.coerce.date().optional().nullable(),
        treatmentCompleted: z.coerce.date().optional().nullable(),
      });
      
      const input = inputSchema.parse(req.body);
      const patient = await storage.createPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.put(api.patients.update.path, async (req, res) => {
    try {
      const inputSchema = api.patients.update.input.extend({
        cardRaise: z.coerce.date().optional().nullable(),
        ctSimApp: z.coerce.date().optional().nullable(),
        simulation: z.coerce.date().optional().nullable(),
        contouring: z.coerce.date().optional().nullable(),
        planning: z.coerce.date().optional().nullable(),
        mdt: z.coerce.date().optional().nullable(),
        treatment: z.coerce.date().optional().nullable(),
        treatmentCompleted: z.coerce.date().optional().nullable(),
      });

      const input = inputSchema.parse(req.body);
      const patient = await storage.updatePatient(Number(req.params.id), input);
      res.json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  app.delete(api.patients.delete.path, async (req, res) => {
    try {
      await storage.deletePatient(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  return httpServer;
}
