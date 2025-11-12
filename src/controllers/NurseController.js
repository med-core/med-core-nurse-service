import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { sendError } from "../utils/errorHandler.js";

const prisma = new PrismaClient();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://med-core-user-service:3000";

// === VALIDAR ROL ENFERMERO ===
const validateNurseRole = async (userId) => {
  try {
    const res = await axios.get(`${USER_SERVICE_URL}/api/v1/users/${userId}`);
    if (res.data.role !== "ENFERMERO") {
      throw new Error(`El usuario ${userId} tiene rol ${res.data.role}, no ENFERMERO`);
    }
    return res.data;
  } catch (err) {
    if (err.response) {
      throw new Error(`Error en User Service (${err.response.status}): ${err.response.data.message || 'Error desconocido'}`);
    }
    throw err;
  }
};

// === BULK CREATE ===
export const bulkCreateNurse = async (req, res) => {
  try {
    const { userId, departmentId, shift = "morning" } = req.body;

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
    return res.status(500).json({
      message: "Error interno al crear enfermero",
      detail: error.message
    });
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