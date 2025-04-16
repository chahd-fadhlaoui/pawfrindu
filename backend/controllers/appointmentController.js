import Appointment from "../models/appointmentModel.js";
import User from "../models/userModel.js";
import { io } from "../server.js";

export const bookAppointment = async (req, res) => {
    const {
      professionalId,
      professionalType, // "Vet" or "Trainer"
      date,
      time,
      duration,
      petName,
      petType,
      petAge,
      petSource,
      reason,
      notes,
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
  
      // Check if the slot is already booked for the professional
      const slotTaken = await Appointment.findOne({
        professionalId,
        professionalType,
        date,
        time,
        status: { $ne: "cancelled" },
      });
      if (slotTaken) {
        return res.status(400).json({ message: "This time slot is already booked" });
      }
  
      // Create new appointment
      const appointment = new Appointment({
        petOwnerId: req.user._id,
        professionalId,
        professionalType,
        date,
        time,
        duration,
        petName,
        petType,
        petAge,
        petSource,
        reason,
        notes,
        status: "pending",
      });
  
      const savedAppointment = await appointment.save();
  
      // Populate professional details for the Socket.IO event
      const populatedAppointment = await Appointment.findById(savedAppointment._id)
        .populate("petOwnerId", "fullName email petOwnerDetails.phone")
        .populate("professionalId", "fullName");
  
      // Emit Socket.IO event with full appointment data
      io.emit("appointmentBooked", populatedAppointment.toObject());
  
      res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        appointment: {
          ...populatedAppointment.toObject(),
          ownerName: populatedAppointment.petOwnerId.fullName,
          phone: populatedAppointment.petOwnerId.petOwnerDetails?.phone || "",
          email: populatedAppointment.petOwnerId.email,
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
  
      // Check if confirmed
      if (appointment.status === "confirmed") {
        return res.status(403).json({
          message: "Cannot update a confirmed appointment directly. Contact the vet.",
        });
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
        // status: { $ne: "cancelled" }, // Uncomment if excluding cancelled appointments
      })
        .populate("petOwnerId", "fullName email petOwnerDetails.phone petOwnerDetails.address")
        .sort({ date: 1, time: 1 });
  
      console.log("Found appointments:", appointments.length);
      const formattedAppointments = appointments.map((appt) => {
        console.log("Formatting appointment ID:", appt._id);
        return {
          id: appt._id.toString(),
          petName: appt.petName,
          petType: appt.petType,
          petAge: appt.petAge || "Unknown",
          ownerName: appt.petOwnerId?.fullName || "Unknown",
          phone: appt.petOwnerId?.petOwnerDetails?.phone || "",
          email: appt.petOwnerId?.email || "",
          address: appt.petOwnerId?.petOwnerDetails?.address || "",
          date: appt.date,
          time: appt.time,
          duration: `${appt.duration} minutes`,
          reason: appt.reason,
          provider: vet.fullName,
          status: appt.status || "pending", // Fallback status
          notes: appt.notes || "",
          createdAt: new Date(appt.createdAt).toLocaleDateString("en-US"),
          updatedAt: new Date(appt.updatedAt).toLocaleDateString("en-US"),
          isNew: appt.status === "pending",
          vaccines: [], // Placeholder
          medications: [], // Placeholder
        };
      });
  
      res.json({ success: true, appointments: formattedAppointments });
    } catch (error) {
      console.error("Get Vet Appointments Error:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({ message: "Failed to fetch appointments", detail: error.message });
    }
  };