import { Request, Response } from "express";
import { BeasiswaService } from "../services/beasiswaService";

const beasiswaService = new BeasiswaService();

// Get all beasiswa
export const getAllBeasiswa = async (req: Request, res: Response) => {
  try {
    const beasiswa = await beasiswaService.getAllBeasiswa();
    res.status(200).json({
      success: true,
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error fetching beasiswa:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch beasiswa data",
      error: error.message,
    });
  }
};

// Get beasiswa by ID
export const getBeasiswaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const beasiswa = await beasiswaService.getBeasiswaById(id);

    res.status(200).json({
      success: true,
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error fetching beasiswa:", error);

    if (error.message === "Beasiswa not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch beasiswa",
      error: error.message,
    });
  }
};

// Create new beasiswa
export const createBeasiswa = async (req: Request, res: Response) => {
  try {
    const { title, image_url, link } = req.body;

    const newBeasiswa = await beasiswaService.createBeasiswa({
      title,
      image_url,
      link,
    });

    res.status(201).json({
      success: true,
      message: "Beasiswa created successfully",
      data: newBeasiswa,
    });
  } catch (error: any) {
    console.error("Error creating beasiswa:", error);

    if (error.message === "Title, image URL, and link are required") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create beasiswa",
      error: error.message,
    });
  }
};

// Update beasiswa
export const updateBeasiswa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, image_url, link } = req.body;

    const updatedBeasiswa = await beasiswaService.updateBeasiswa(id, {
      title,
      image_url,
      link,
    });

    res.status(200).json({
      success: true,
      message: "Beasiswa updated successfully",
      data: updatedBeasiswa,
    });
  } catch (error: any) {
    console.error("Error updating beasiswa:", error);

    if (error.message === "Beasiswa not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update beasiswa",
      error: error.message,
    });
  }
};

// Delete beasiswa
export const deleteBeasiswa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedBeasiswa = await beasiswaService.deleteBeasiswa(id);

    res.status(200).json({
      success: true,
      message: "Beasiswa deleted successfully",
      data: deletedBeasiswa,
    });
  } catch (error: any) {
    console.error("Error deleting beasiswa:", error);

    if (error.message === "Beasiswa not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete beasiswa",
      error: error.message,
    });
  }
};
