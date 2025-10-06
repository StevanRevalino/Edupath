import { Request, Response } from "express";
import * as beasiswaRepository from "../repositories/beasiswaRepository";

// Get all beasiswa
export const getAllBeasiswa = async (req: Request, res: Response) => {
  try {
    const beasiswa = await beasiswaRepository.getAllBeasiswa();
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
    const beasiswa = await beasiswaRepository.getBeasiswaById(id);

    if (!beasiswa) {
      return res.status(404).json({
        success: false,
        message: "Beasiswa not found",
      });
    }

    res.status(200).json({
      success: true,
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error fetching beasiswa:", error);
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

    // Validate required fields
    if (!title || !image_url || !link) {
      return res.status(400).json({
        success: false,
        message: "Title, image URL, and link are required",
      });
    }

    const newBeasiswa = await beasiswaRepository.createBeasiswa({
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

    const updatedBeasiswa = await beasiswaRepository.updateBeasiswa(id, {
      title,
      image_url,
      link,
    });

    if (!updatedBeasiswa) {
      return res.status(404).json({
        success: false,
        message: "Beasiswa not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beasiswa updated successfully",
      data: updatedBeasiswa,
    });
  } catch (error: any) {
    console.error("Error updating beasiswa:", error);
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

    const deletedBeasiswa = await beasiswaRepository.deleteBeasiswa(id);

    if (!deletedBeasiswa) {
      return res.status(404).json({
        success: false,
        message: "Beasiswa not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beasiswa deleted successfully",
      data: deletedBeasiswa,
    });
  } catch (error: any) {
    console.error("Error deleting beasiswa:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete beasiswa",
      error: error.message,
    });
  }
};
