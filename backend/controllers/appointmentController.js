import Appointment from "../models/appointmentModel.js";
import Pet from "../models/petModel.js";
import User from "../models/userModel.js";
import ProfessionalAvailability from "../models/professionalAvailabilityModel.js";
import { io } from "../server.js";
import mongoose from "mongoose";



// user part appointment
export const bookAppointment = async (req, res) => {
  const {
    professionalId,
    professionalType,
    date,
    time, 
    duration,
    petId,
    petName,
    petType,
    petAge,
    petSource,
    reason,
    notes,
    breed,
    gender,
    address,
    isTrained,
  } = req.body;

  try {
    // Verify user is a PetOwner
    const petOwner = await User.findById(req.user._id);
    if (!petOwner || petOwner.role !== "PetOwner") {
      return res.status(403).json({ message: "Only pet owners can book appointments" });
    }

    // Verify professional exists and matches the type
    const professional = await User.findById(professionalId);
    if (!professional || professional.role !== professionalType || !professional.isActive) {
      return res.status(404).json({ message: `${professionalType} not found or not available` });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      console.error("Invalid date format:", date);
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }
    console.log("Received date:", date);

    // Validate date is a valid calendar date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime()) || parsedDate.toISOString().split("T")[0] !== date) {
      console.error("Invalid calendar date:", date);
      return res.status(400).json({ message: "Invalid calendar date" });
    }

    // Use the date string directly
    const dateStr = date;
    console.log("Stored date string:", dateStr);

    // Check if the slot is already booked for the professional
    const slotTaken = await Appointment.findOne({
      professionalId,
      professionalType,
      date: dateStr,
      time,
      status: { $ne: "cancelled" },
    });
    if (slotTaken) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // Check if the date is marked unavailable
    const unavailableDate = await Appointment.findOne({
      professionalId,
      professionalType,
      status: "unavailable",
      unavailableSlots: {
        $elemMatch: {
          date: dateStr,
          professionalType,
        },
      },
    });
    if (unavailableDate) {
      return res.status(400).json({ message: "This date is marked as unavailable" });
    }

    let appointmentData = {
      petOwnerId: req.user._id,
      professionalId,
      professionalType,
      date: dateStr,
      time,
      duration,
      reason,
      notes,
      status: "pending",
    };

    // Handle platform vs. non-platform pets
    if (petId) {
      const pet = await Pet.findById(petId);
      if (!pet) {
        console.error("Pet not found for petId:", petId);
        return res.status(404).json({ message: "Pet not found" });
      }
      console.log("Pet found:", { petId, petName: pet.name, ownerId: pet.owner?.toString(), userId: req.user._id?.toString() });
      appointmentData.petId = petId;
      appointmentData.petName = pet.name;
      appointmentData.petType = pet.species;
      appointmentData.petAge = pet.age || "Unknown";
      appointmentData.petSource = "adopted";
      appointmentData.breed = pet.breed || "Unknown";
      appointmentData.gender = pet.gender || "Unknown";
      appointmentData.address = address || "Unknown";
      appointmentData.isTrained = pet.isTrained ?? false;
    } else {
      if (!petName || !petType || !petSource) {
        return res.status(400).json({ message: "petName, petType, and petSource are required for non-platform pets" });
      }
      appointmentData.petName = petName;
      appointmentData.petType = petType;
      appointmentData.petAge = petAge || "Unknown";
      appointmentData.petSource = petSource;
      appointmentData.breed = breed || "Unknown";
      appointmentData.gender = gender || "Unknown";
      appointmentData.address = address || "Unknown";
      appointmentData.isTrained = isTrained ?? false;
    }

    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate("petOwnerId", "fullName email petOwnerDetails.phone")
      .populate("professionalId", "fullName");

    io.emit("appointmentBooked", {
      ...populatedAppointment.toObject(),
      petId: savedAppointment.petId?.toString(),
      breed: savedAppointment.breed || "Unknown",
      gender: savedAppointment.breed || "Unknown",
      address: savedAppointment.address || "Unknown",
      isTrained: savedAppointment.isTrained ?? false,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: {
        ...populatedAppointment.toObject(),
        ownerName: populatedAppointment.petOwnerId.fullName,
        phone: populatedAppointment.petOwnerId.petOwnerDetails?.phone || "",
        email: populatedAppointment.petOwnerId.email,
        petId: savedAppointment.petId?.toString(),
        breed: savedAppointment.breed || "Unknown",
        gender: savedAppointment.breed || "Unknown",
        address: savedAppointment.address || "Unknown",
        isTrained: savedAppointment.isTrained ?? false,
      },
    });
  } catch (error) {
    console.error("Book Appointment Error:", error);
    res.status(500).json({ message: "Failed to book appointment", detail: error.message });
  }
}; 
export const getUserBookedDates = async (req, res) => {
    try {
      const appointments = await Appointment.find({
        petOwnerId: req.user._id,
        status: { $ne: "cancelled" },
      }).select("date");
  
      const bookedDates = appointments.map((appt) =>
        new Date(appt.date).toISOString().split("T")[0]
      );
  
      res.json({ success: true, bookedDates });
    } catch (error) {
      console.error("Get User Booked Dates Error:", error);
      res.status(500).json({ message: "Failed to fetch booked dates", detail: error.message });
    }
  };
export const getReservedSlots = async (req, res) => {
  const { professionalId } = req.params;
  const { date, professionalType } = req.query;

  try {
    // Find all non-cancelled appointments for this professional on this date
    const appointments = await Appointment.find({
      professionalId,
      professionalType, // Ensures it matches "Vet" or "Trainer"
      date,
      status: { $ne: "cancelled" },
    }).select("time");

    // Extract just the time field from each appointment
    const reservedSlots = appointments.map((appt) => appt.time);

    res.json({ success: true, reservedSlots });
  } catch (error) {
    console.error("Get Reserved Slots Error:", error);
    res.status(500).json({ message: "Failed to fetch reserved slots", detail: error.message });
  }
};

export const getMyAppointments = async (req, res) => {
    try {
      const appointments = await Appointment.find({
        petOwnerId: req.user._id,
      })
        .populate("professionalId", "fullName") // Populate professional's name
        .sort({ date: -1, time: -1 }); // Sort by date and time descending
  
      res.json({ success: true, appointments });
    } catch (error) {
      console.error("Get My Appointments Error:", error);
      res.status(500).json({ message: "Failed to fetch appointments", detail: error.message });
    }
  };

  export const getReservedSlotsForMonth = async (req, res) => {
    const { professionalId, year, month, professionalType } = req.query;
  
    try {
      const startDate = new Date(year, month - 1, 1); // Month is 1-based in query, 0-based in JS
      const endDate = new Date(year, month, 0); // Last day of the month
  
      const appointments = await Appointment.find({
        professionalId,
        professionalType,
        date: { $gte: startDate.toISOString().split("T")[0], $lte: endDate.toISOString().split("T")[0] },
        status: { $ne: "cancelled" },
      }).select("date time");
  
      // Group reserved slots by date
      const reservedSlotsByDate = appointments.reduce((acc, appt) => {
        const date = appt.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(appt.time);
        return acc;
      }, {});
  
      res.json({ success: true, reservedSlotsByDate });
    } catch (error) {
      console.error("Get Reserved Slots For Month Error:", error);
      res.status(500).json({ message: "Failed to fetch reserved slots for month", detail: error.message });
    }
  };

  export const cancelAppointment = async (req, res) => {
    const { appointmentId } = req.params;
    const { reason } = req.body; // Reason is optional unless last-minute
  
    try {
      // Validate appointmentId
      if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
      }
  
      // Find the appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
  
      // Check ownership
      if (appointment.petOwnerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You don’t own this appointment" });
      }
  
      if (appointment.status === "pending") {
        // Delete pending appointments
        await Appointment.deleteOne({ _id: appointmentId });
  
        // Notify vet
        io.emit("appointmentDeleted", {
          appointmentId: appointment._id.toString(),
          professionalId: appointment.professionalId.toString(),
          petOwnerId: appointment.petOwnerId.toString(),
          date: appointment.date,
          time: appointment.time,
        });
  
        return res.json({ success: true, message: "Pending appointment deleted successfully" });
      } else if (appointment.status === "confirmed") {
        // Calculate time until appointment
        const appointmentDateTime = new Date(appointment.date);
        const [hours, minutes] = appointment.time.split(":").map(Number);
        appointmentDateTime.setHours(hours, minutes);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
  
        // Require reason for last-minute cancellations
        if (hoursUntilAppointment < 24) {
          if (!reason) {
            return res.status(400).json({
              message: "A reason is required for cancellations within 24 hours.",
            });
          }
          appointment.cancellationReason = reason;
        }
  
        // Update to cancelled
        appointment.status = "cancelled";
        const updatedAppointment = await appointment.save();
  
        // Notify vet
        io.emit("appointmentCancelled", {
          appointmentId: updatedAppointment._id.toString(),
          professionalId: updatedAppointment.professionalId.toString(),
          petOwnerId: updatedAppointment.petOwnerId.toString(),
          date: updatedAppointment.date,
          time: updatedAppointment.time,
          isLastMinute: hoursUntilAppointment < 24,
          cancellationReason: reason || null,
        });
  
        return res.json({
          success: true,
          message: "Appointment cancelled successfully",
          isLastMinute: hoursUntilAppointment < 24,
        });
      } else {
        return res.status(400).json({ message: "Cannot cancel this appointment status" });
      }
    } catch (error) {
      console.error("Cancel Appointment Error:", error.stack);
      res.status(500).json({ message: "Failed to process appointment", detail: error.message });
    }
  };
  export const updateAppointment = async (req, res) => {
    const { appointmentId } = req.params;
    const { date, time, reason, notes } = req.body;
  
    try {
      // Validate appointmentId
      if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
      }
  
      // Find the appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
  
      // Check ownership
      if (appointment.petOwnerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You don’t own this appointment" });
      }
  
      // If date or time is being updated, check availability
      if ((date && date !== appointment.date) || (time && time !== appointment.time)) {
        const slotTaken = await Appointment.findOne({
          professionalId: appointment.professionalId,
          professionalType: appointment.professionalType,
          date: date || appointment.date,
          time: time || appointment.time,
          status: { $ne: "cancelled" },
          _id: { $ne: appointmentId }, // Exclude the current appointment
        });
  
        if (slotTaken) {
          return res.status(400).json({ message: "This time slot is already booked" });
        }
      }
  
      // Update appointment fields
      appointment.date = date || appointment.date;
      appointment.time = time || appointment.time;
      appointment.reason = reason || appointment.reason;
      appointment.notes = notes || appointment.notes;
  
      // If the appointment was confirmed, set status to pending
      if (["confirmed", "notAvailable"].includes(appointment.status)) {
        appointment.status = "pending";
      }
  
      const updatedAppointment = await appointment.save();
  
      // Populate professional details for response and Socket.IO
      const populatedAppointment = await Appointment.findById(updatedAppointment._id)
        .populate("petOwnerId", "fullName email petOwnerDetails.phone")
        .populate("professionalId", "fullName");
  
      // Emit Socket.IO event
      io.emit("appointmentUpdated", populatedAppointment.toObject());
  
      res.json({
        success: true,
        message: "Appointment updated successfully",
        appointment: populatedAppointment.toObject(),
      });
    } catch (error) {
      console.error("Update Appointment Error:", error);
      res.status(500).json({ message: "Failed to update appointment", detail: error.message });
    }
  };

// vet confirm appointment 
  export const confirmAppointment = async (req, res) => {
    const { appointmentId } = req.params;
  
    try {
      // Validate appointmentId
      if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
      }
  
      // Find the appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
  
      // Check if the user is the assigned professional
      if (appointment.professionalId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to confirm this appointment" });
      }
  
      // Check if the appointment is pending
      if (appointment.status !== "pending") {
        return res.status(400).json({ message: "Only pending appointments can be confirmed" });
      }
  
      // Update status to confirmed
      appointment.status = "confirmed";
      appointment.confirmedAt = new Date();
      const updatedAppointment = await appointment.save();
  
      // Populate details for response and Socket.IO
      const populatedAppointment = await Appointment.findById(updatedAppointment._id)
        .populate("petOwnerId", "fullName email petOwnerDetails.phone")
        .populate("professionalId", "fullName");
  
      // Emit Socket.IO event
      io.emit("appointmentConfirmed", {
        appointmentId: updatedAppointment._id.toString(),
        petOwnerId: updatedAppointment.petOwnerId.toString(),
        professionalId: updatedAppointment.professionalId.toString(),
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        petName: updatedAppointment.petName,
        status: updatedAppointment.status,
      });
  
      res.json({
        success: true,
        message: "Appointment confirmed successfully",
        appointment: populatedAppointment.toObject(),
      });
    } catch (error) {
      console.error("Confirm Appointment Error:", error);
      res.status(500).json({ message: "Failed to confirm appointment", detail: error.message });
    }
  };
// vet cancel appointment 
export const vetDeleteAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    // Validate appointmentId
    if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check authorization
    if (appointment.professionalId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to cancel this appointment" });
    }

    // Check status
    if (["cancelled", "completed"].includes(appointment.status)) {
      return res.status(400).json({ message: "Appointment cannot be cancelled" });
    }

    // Update status to cancelled
    appointment.status = "cancelled";
    appointment.updatedAt = new Date();
    const updatedAppointment = await appointment.save();

    // Populate for response
    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate("petOwnerId", "fullName email petOwnerDetails.phone")
      .populate("professionalId", "fullName");

    // Log emission details
    console.log("Appointment details:", {
      appointmentId: updatedAppointment._id.toString(),
      petOwnerId: updatedAppointment.petOwnerId.toString(),
      professionalId: updatedAppointment.professionalId.toString(),
    });
    console.log("Emitting event: vetAppointmentCancelled (global)");

    // Emit globally to ensure delivery
    io.emit("vetAppointmentCancelled", {
      appointmentId: updatedAppointment._id.toString(),
      professionalId: updatedAppointment.professionalId.toString(),
      petOwnerId: updatedAppointment.petOwnerId.toString(),
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      cancellationReason: null,
    });

    return res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: populatedAppointment.toObject(),
    });
  } catch (error) {
    console.error("Vet Cancel Appointment Error:", error);
    res.status(500).json({ message: "Failed to cancel appointment", detail: error.message });
  }
};
 // vet complete appointment 

  export const completeAppointment = async (req, res) => {
    const { appointmentId } = req.params;
    const { completionNotes } = req.body;
  
    try {
      // Validate appointmentId
      if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
      }
  
      // Find the appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
  
      // Check if the user is the assigned professional
      if (appointment.professionalId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to complete this appointment" });
      }
  
      // Check if the appointment is confirmed
      if (appointment.status !== "confirmed") {
        return res.status(400).json({ message: "Only confirmed appointments can be completed" });
      }
  
      // Update to completed
      appointment.status = "completed";
      appointment.completedAt = new Date();
      appointment.completionNotes = completionNotes || "";
      const updatedAppointment = await appointment.save();
  
      // Populate details for response and Socket.IO
      const populatedAppointment = await Appointment.findById(updatedAppointment._id)
        .populate("petOwnerId", "fullName email petOwnerDetails.phone")
        .populate("professionalId", "fullName");
  
      // Emit Socket.IO event
      io.emit("appointmentCompleted", {
        appointmentId: updatedAppointment._id.toString(),
        professionalId: updatedAppointment.professionalId.toString(),
        petOwnerId: updatedAppointment.petOwnerId.toString(),
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        petName: updatedAppointment.petName,
        status: updatedAppointment.status,
        completionNotes: updatedAppointment.completionNotes,
      });
  
      res.json({
        success: true,
        message: "Appointment completed successfully",
        appointment: populatedAppointment.toObject(),
      });
    } catch (error) {
      console.error("Complete Appointment Error:", error);
      res.status(500).json({ message: "Failed to complete appointment", detail: error.message });
    }
  };

  export const getVetAppointments = async (req, res) => {
    try {
      console.log("Fetching vet appointments for user ID:", req.user._id);
      const vet = await User.findById(req.user._id);
      if (!vet) {
        console.log("User not found for ID:", req.user._id);
        return res.status(403).json({ message: "Only vets can access this endpoint" });
      }
      if (vet.role !== "Vet") {
        console.log("User is not a vet, role:", vet.role);
        return res.status(403).json({ message: "Only vets can access this endpoint" });
      }
  
      console.log("Querying appointments for vet ID:", req.user._id);
      const appointments = await Appointment.find({
        professionalId: req.user._id,
        professionalType: "Vet",
      })
        .populate("petOwnerId", "fullName email petOwnerDetails.phone petOwnerDetails.address")
        .sort({ date: 1, time: 1 });
  
      console.log("Found appointments:", appointments.length);
      const formattedAppointments = await Promise.all(
        appointments.map(async (appt) => {
          console.log("Formatting appointment ID:", appt._id, "petId:", appt.petId?.toString());
          let petData = {};
          if (appt.petId) {
            try {
              const pet = await Pet.findById(appt.petId).select(
                "name species breed age gender city isTrained fee image"
              );
              if (pet) {
                petData = pet.toObject();
                console.log("Pet found for petId:", appt.petId.toString(), "Pet data:", petData);
              } else {
                console.warn("No pet found for petId:", appt.petId.toString());
              }
            } catch (petErr) {
              console.error(`Error fetching pet ${appt.petId.toString()}:`, petErr.message);
            }
          } else {
            console.log("No petId for appointment, using Appointment fields:", {
              petName: appt.petName,
              petType: appt.petType,
              petAge: appt.petAge,
              breed: appt.breed,
              gender: appt.gender,
              city: appt.city,
              isTrained: appt.isTrained,
            });
          }
  
          return {
            id: appt._id.toString(),
            petId: appt.petId?.toString(),
            petName: petData.name || appt.petName || "Unknown",
            petType: petData.species || appt.petType || "Unknown",
            petAge: petData.age || appt.petAge || "Unknown",
            breed: petData.breed || appt.breed || "Unknown",
            gender: petData.gender || appt.gender || "Unknown",
            city: petData.city || appt.city || "Unknown",
            isTrained: petData.isTrained ?? appt.isTrained ?? false,
            fee: petData.fee || null,
            image: petData.image || null,
            ownerName: appt.petOwnerId?.fullName || "Unknown",
            phone: appt.petOwnerId?.petOwnerDetails?.phone || "",
            email: appt.petOwnerId?.email || "",
            address: appt.petOwnerId?.petOwnerDetails?.address || "",
            date: appt.date,
            time: appt.time,
            duration: `${appt.duration} minutes`,
            reason: appt.reason,
            provider: vet.fullName,
            status: appt.status || "pending",
            notes: appt.notes || "",
            createdAt: new Date(appt.createdAt).toLocaleDateString("en-US"),
            updatedAt: new Date(appt.updatedAt).toLocaleDateString("en-US"),
            isNew: appt.status === "pending",
            vaccines: [],
            medications: [],
            isPlatformPet: !!appt.petId,
          };
        })
      );
  
      console.log("Returning formatted appointments:", formattedAppointments.length);
      res.json({ success: true, appointments: formattedAppointments });
    } catch (error) {
      console.error("Get Vet Appointments Error:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({ message: "Failed to fetch appointments", detail: error.message });
    }
  };
export const AppointmentNotAvailable = async (req, res) => {
  const { appointmentId } = req.params;
  const { reason } = req.body;

  try {
    if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.professionalId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to mark this appointment as not available" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be marked as not available" });
    }

    appointment.status = "notAvailable";
    appointment.cancellationReason = reason || "";
    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate("petOwnerId", "fullName email petOwnerDetails.phone")
      .populate("professionalId", "fullName");

    io.emit("appointmentNotAvailable", {
      appointmentId: updatedAppointment._id.toString(),
      professionalId: updatedAppointment.professionalId.toString(),
      petOwnerId: updatedAppointment.petOwnerId.toString(),
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      petName: updatedAppointment.petName,
      status: updatedAppointment.status,
      cancellationReason: updatedAppointment.cancellationReason,
    });

    res.json({
      success: true,
      message: "Appointment marked as not available successfully",
      appointment: populatedAppointment.toObject(),
    });
  } catch (error) {
    console.error("Set Not Available Error:", error);
    res.status(500).json({ message: "Failed to mark appointment as not available", detail: error.message });
  }
};


export const updateVetAppointmentStatus = async (req, res) => {
  const { appointmentId } = req.params;
  const { status, reason, completionNotes } = req.body;

  try {
    // Validate appointmentId
    if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled", "notAvailable", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if the user is the assigned professional
    if (appointment.professionalId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this appointment" });
    }

    // Update appointment
    appointment.status = status;
    appointment.updatedAt = new Date();

    // Handle fields based on status
    appointment.cancellationReason = ["cancelled", "notAvailable"].includes(status) ? (reason || null) : null;
    appointment.completionNotes = status === "completed" ? (completionNotes || null) : null;
    appointment.confirmedAt = status === "confirmed" ? new Date() : null;
    appointment.completedAt = status === "completed" ? new Date() : null;

    const updatedAppointment = await appointment.save();

    // Populate details for response and Socket.IO
    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate("petOwnerId", "fullName email petOwnerDetails.phone")
      .populate("professionalId", "fullName");

    // Emit Socket.IO event based on status
    const socketEventMap = {
      confirmed: "appointmentConfirmed",
      cancelled: "vetAppointmentCancelled",
      notAvailable: "appointmentNotAvailable",
      completed: "appointmentCompleted",
      pending: "appointmentUpdated",
    };

    const socketEvent = socketEventMap[status];
    io.emit(socketEvent, {
      appointmentId: updatedAppointment._id.toString(),
      professionalId: updatedAppointment.professionalId.toString(),
      petOwnerId: updatedAppointment.petOwnerId.toString(),
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      petName: updatedAppointment.petName,
      status: updatedAppointment.status,
      cancellationReason: updatedAppointment.cancellationReason || null,
      completionNotes: updatedAppointment.completionNotes || null,
    });

    res.json({
      success: true,
      message: `Appointment status updated to ${status} successfully`,
      appointment: populatedAppointment.toObject(),
    });
  } catch (error) {
    console.error("Update Appointment Status Error:", error);
    res.status(500).json({ message: "Failed to update appointment status", detail: error.message });
  }
};

export const getTrainerAppointments = async (req, res) => {
  try {
    console.log("Fetching trainer appointments for user ID:", req.user._id);
    const trainer = await User.findById(req.user._id);
    if (!trainer) {
      console.log("User not found for ID:", req.user._id);
      return res.status(403).json({ message: "Only trainers can access this endpoint" });
    }
    if (trainer.role !== "Trainer") {
      console.log("User is not a trainer, role:", trainer.role);
      return res.status(403).json({ message: "Only trainers can access this endpoint" });
    }

    console.log("Querying appointments for trainer ID:", req.user._id);
    const appointments = await Appointment.find({
      professionalId: req.user._id,
      professionalType: "Trainer",
    })
      .populate("petOwnerId", "fullName email petOwnerDetails.phone petOwnerDetails.address")
      .sort({ date: 1, time: 1 });

    console.log("Found appointments:", appointments.length);
    const formattedAppointments = await Promise.all(
      appointments.map(async (appt) => {
        console.log("Formatting appointment ID:", appt._id, "petId:", appt.petId?.toString());
        let petData = {};
        if (appt.petId) {
          try {
            const pet = await Pet.findById(appt.petId).select(
              "name species breed age gender city isTrained fee image"
            );
            if (pet) {
              petData = pet.toObject();
              console.log("Pet found for petId:", appt.petId.toString(), "Pet data:", petData);
            } else {
              console.warn("No pet found for petId:", appt.petId.toString());
            }
          } catch (petErr) {
            console.error(`Error fetching pet ${appt.petId.toString()}:`, petErr.message);
          }
        } else {
          console.log("No petId for appointment, using Appointment fields:", {
            petName: appt.petName,
            petType: appt.petType,
            petAge: appt.petAge,
            breed: appt.breed,
            gender: appt.gender,
            city: appt.city,
            isTrained: appt.isTrained,
          });
        }

        return {
          id: appt._id.toString(),
          petId: appt.petId?.toString(),
          petName: petData.name || appt.petName || "Unknown",
          petType: petData.species || appt.petType || "Unknown",
          petAge: petData.age || appt.petAge || "Unknown",
          breed: petData.breed || appt.breed || "Unknown",
          gender: petData.gender || appt.gender || "Unknown",
          city: petData.city || appt.city || "Unknown",
          isTrained: petData.isTrained ?? appt.isTrained ?? false,
          fee: petData.fee || null,
          image: petData.image || null,
          ownerName: appt.petOwnerId?.fullName || "Unknown",
          phone: appt.petOwnerId?.petOwnerDetails?.phone || "",
          email: appt.petOwnerId?.email || "",
          address: appt.petOwnerId?.petOwnerDetails?.address || "",
          date: appt.date,
          time: appt.time,
          duration: `${appt.duration} minutes`,
          reason: appt.reason,
          provider: trainer.fullName,
          status: appt.status || "pending",
          notes: appt.notes || "",
          createdAt: new Date(appt.createdAt).toLocaleDateString("en-US"),
          updatedAt: new Date(appt.updatedAt).toLocaleDateString("en-US"),
          isNew: appt.status === "pending",
          vaccines: [],
          medications: [],
          isPlatformPet: !!appt.petId,
        };
      })
    );

    console.log("Returning formatted appointments:", formattedAppointments.length);
    res.json({ success: true, appointments: formattedAppointments });
  } catch (error) {
    console.error("Get Trainer Appointments Error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Failed to fetch appointments", detail: error.message });
  }
};

//vet or tariner period not available


export const getUnavailablePeriods = async (req, res) => {
  const { professionalId, year, month, professionalType } = req.query;

  try {
    // Validate inputs
    if (!professionalId || !["Vet", "Trainer"].includes(professionalType)) {
      return res.status(400).json({ message: "Invalid professionalId or professionalType" });
    }
    if (!year || !month || isNaN(year) || isNaN(month)) {
      return res.status(400).json({ message: "Year and month are required" });
    }

    // Verify professional exists
    const professional = await User.findById(professionalId);
    if (!professional || professional.role !== professionalType) {
      return res.status(404).json({ message: `${professionalType} not found` });
    }

    // Fetch unavailable dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const availability = await ProfessionalAvailability.findOne({
      professionalId,
      professionalType,
      "unavailableSlots.date": {
        $gte: startDate.toISOString().split("T")[0],
        $lte: endDate.toISOString().split("T")[0],
      },
    });

    // Generate unavailableSlotsByDate for modal compatibility
    const unavailableSlotsByDate = {};
    if (availability) {
      for (let slot of availability.unavailableSlots) {
        if (
          slot.isAvailable === false &&
          slot.date >= startDate.toISOString().split("T")[0] &&
          slot.date <= endDate.toISOString().split("T")[0]
        ) {
          unavailableSlotsByDate[slot.date] = ["00:00"]; // Dummy time slot for modal
        }
      }
    }

    res.json({ success: true, unavailableSlotsByDate });
  } catch (error) {
    console.error("Get Unavailable Periods Error:", error.message, error.stack);
    res.status(500).json({ message: "Failed to fetch unavailable periods", detail: error.message });
  }
};
export const updateUnavailablePeriods = async (req, res) => {
  const { professionalId } = req.params;
  const { startDate, endDate, professionalType, markAvailable = false } = req.body;

  try {
    // Validate inputs
    if (!professionalId || !mongoose.Types.ObjectId.isValid(professionalId)) {
      return res.status(400).json({ message: "Invalid professionalId" });
    }
    if (!["Vet", "Trainer"].includes(professionalType)) {
      return res.status(400).json({ message: "Invalid professionalType" });
    }
    if (!startDate || !endDate || !startDate.match(/^\d{4}-\d{2}-\d{2}$/) || !endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ message: "Invalid startDate or endDate format. Use YYYY-MM-DD" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Verify professional
    const professional = await User.findById(professionalId);
    if (!professional || professional.role !== professionalType || !professional.isActive) {
      return res.status(404).json({ message: `${professionalType} not found or not active` });
    }

    // Check for reserved appointments
    const reservedSlots = await Appointment.find({
      professionalId,
      professionalType,
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: "cancelled" },
    });
    if (reservedSlots.length > 0 && !markAvailable) {
      return res.status(400).json({ message: "Cannot mark dates with reserved appointments as unavailable" });
    }

    // Find or create ProfessionalAvailability document
    let availability = await ProfessionalAvailability.findOne({
      professionalId,
      professionalType,
    });
    if (!availability) {
      availability = new ProfessionalAvailability({
        professionalId,
        professionalType,
        unavailableSlots: [],
      });
    }

    // Update unavailableSlots
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const existingSlotIndex = availability.unavailableSlots.findIndex(
        (slot) => slot.date === dateStr
      );

      if (markAvailable) {
        // Remove or mark as available
        if (existingSlotIndex !== -1) {
          availability.unavailableSlots.splice(existingSlotIndex, 1);
        }
      } else {
        // Mark as unavailable
        if (existingSlotIndex === -1) {
          availability.unavailableSlots.push({
            date: dateStr,
            isAvailable: false,
          });
        } else {
          availability.unavailableSlots[existingSlotIndex].isAvailable = false;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Save the document
    await availability.save();

    // Generate unavailableSlotsByDate for the affected month
    const year = start.getFullYear();
    const month = start.getMonth() + 1;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const unavailableSlotsByDate = {};
    for (let slot of availability.unavailableSlots) {
      if (
        slot.isAvailable === false &&
        slot.date >= startOfMonth.toISOString().split("T")[0] &&
        slot.date <= endOfMonth.toISOString().split("T")[0]
      ) {
        unavailableSlotsByDate[slot.date] = ["00:00"];
      }
    }

    // Emit Socket.IO event
    io.emit("unavailabilityUpdated", {
      professionalId,
      professionalType,
      year,
      month,
      unavailableSlotsByDate,
    });

    res.json({ success: true, message: "Unavailable periods updated successfully" });
  } catch (error) {
    console.error("Update Unavailable Periods Error:", error.message, error.stack);
    res.status(500).json({ message: "Failed to update unavailable periods", detail: error.message });
  }
};

export const getAppointmentStats = async (req, res) => {
  try {
    console.log('Fetching appointment stats:', {
      userId: req.user?._id,
      role: req.user?.role,
      query: req.query,
      headers: req.headers.authorization?.substring(0, 20) + '...',
    });

    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end)) {
        console.error('Invalid date format:', { startDate, endDate });
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    }

    const totalAppointments = await Appointment.countDocuments({ ...dateFilter });
    const pendingAppointments = await Appointment.countDocuments({
      ...dateFilter,
      status: 'pending',
    });
    const confirmedAppointments = await Appointment.countDocuments({
      ...dateFilter,
      status: 'confirmed',
    });
    const completedAppointments = await Appointment.countDocuments({
      ...dateFilter,
      status: 'completed',
    });
    const cancelledAppointments = await Appointment.countDocuments({
      ...dateFilter,
      status: 'cancelled',
    });
    const notAvailableAppointments = await Appointment.countDocuments({
      ...dateFilter,
      status: 'notAvailable',
    });
    const vetAppointments = await Appointment.countDocuments({
      ...dateFilter,
      professionalType: 'Vet',
    });
    const trainerAppointments = await Appointment.countDocuments({
      ...dateFilter,
      professionalType: 'Trainer',
    });

    console.log('Appointment stats results:', {
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      notAvailableAppointments,
      vetAppointments,
      trainerAppointments,
    });

    res.json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        notAvailableAppointments,
        vetAppointments,
        trainerAppointments,
      },
    });
  } catch (error) {
    console.error('Get Appointment Stats Error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id,
      role: req.user?.role,
      query: req.query,
    });
    res.status(500).json({ success: false, message: 'Failed to fetch appointment stats', error: error.message });
  }
};