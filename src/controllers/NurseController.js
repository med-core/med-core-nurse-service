import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { sendError } from "../utils/errorHandler.js";

const prisma = new PrismaClient();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://med-core-user-service:3000";
const DEPARTMENT_SERVICE_URL = process.env.DEPARTMENT_SERVICE_URL || "http://med-core-department-service:3000";

// === VALIDAR ROL ENFERMERO ===
const validateNurseRole = async (userId) => {
  try {
    const res = await axios.get(`${USER_SERVICE_URL}/api/v1/users/${userId}`);
    if (res.data.role !== "ENFERMERO") {
      throw new Error("El usuario no tiene rol ENFERMERO");
    }
    return res.data;
  } catch (err) {
    throw new Error("Usuario no encontrado o no es enfermero");
  }
};

// === FIND OR CREATE + BULK CREATE ===
export const bulkCreateNurse = async (req, res) => {
  try {
    const { userId, department: deptName, shift = "morning" } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId es obligatorio" });
    }

    // Validar rol
    await validateNurseRole(userId);

    // Verificar si ya existe
    const existing = await prisma.nurses.findUnique({ where: { userId } });
    if (existing) {
      return res.status(200).json({
        message: "Enfermero ya existe",
        id: existing.id,
        userId,
      });
    }

    let departmentId = null;

    // === FIND OR CREATE DEPARTMENT ===
    if (deptName) {
      const deptRes = await axios.post(`${DEPARTMENT_SERVICE_URL}/api/v1/departments/find-or-create`, {
        name: deptName,
      });
      departmentId = deptRes.data.id;
    }

    // === CREAR ENFERMERO ===
    const nurse = await prisma.nurses.create({
      data: {
        userId,
        departmentId,
        shift: shift.toLowerCase(),
        state: "ACTIVE",
      },
    });

    console.log(`Enfermero creado: ${nurse.id} - ${userId}`);
    res.status(201).json(nurse);

  } catch (error) {
    console.error("Error en bulkCreateNurse:", error.message);
    sendError(error, res);
  }
};

// === OBTENER POR USER ID ===
export const getNurseByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const nurse = await prisma.nurses.findUnique({
      where: { userId },
      include: { department: true },
    });

    if (!nurse) {
      return res.status(404).json({ message: "Enfermero no encontrado" });
    }

    res.json(nurse);
  } catch (error) {
    sendError(error, res);
  }
};

// === LISTAR TODOS ===
export const getAllNurses = async (req, res) => {
  try {
    const nurses = await prisma.nurses.findMany({
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(nurses);
  } catch (error) {
    sendError(error, res);
  }
};

// === ACTUALIZAR ===
export const updateNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await prisma.nurses.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    sendError(error, res);
  }
};