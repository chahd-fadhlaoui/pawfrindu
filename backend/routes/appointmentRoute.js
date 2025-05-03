// routes/appointmentRouter.js
import express from "express";
import { AppointmentNotAvailable, bookAppointment, cancelAppointment, completeAppointment, confirmAppointment, getMyAppointments, getReservedSlots, getReservedSlotsForMonth, getUserBookedDates, getVetAppointments , updateAppointment, updateVetAppointmentStatus, vetDeleteAppointment } from "../controllers/appointmentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const appointmentRouter = express.Router();

appointmentRouter.post("/book", authenticate, bookAppointment);
appointmentRouter.get("/reserved/:professionalId", authenticate, getReservedSlots);
appointmentRouter.get("/booked-dates", authenticate, getUserBookedDates);
appointmentRouter.get("/my-appointments", authenticate, getMyAppointments);
appointmentRouter.get("/reserved-month", getReservedSlotsForMonth);
appointmentRouter.put("/update/:appointmentId", authenticate, updateAppointment); // Added authenticate
appointmentRouter.delete("/cancel/:appointmentId", authenticate, cancelAppointment); // Added authenticate
appointmentRouter.put("/confirm/:appointmentId", authenticate, confirmAppointment);
appointmentRouter.put("/not-available/:appointmentId", authenticate, AppointmentNotAvailable);
appointmentRouter.put("/update-status/:appointmentId", authenticate, updateVetAppointmentStatus);
appointmentRouter.delete("/vet-delete/:appointmentId", authenticate, vetDeleteAppointment);
appointmentRouter.put("/complete/:appointmentId", authenticate, completeAppointment);
appointmentRouter.get("/vet-appointments", authenticate, getVetAppointments); // New route
export default appointmentRouter;   