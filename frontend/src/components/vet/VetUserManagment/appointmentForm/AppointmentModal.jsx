import React, { useState, useEffect } from "react";
import {
  X,
  Check,
} from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import { useApp } from "../../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { SPECIES_OPTIONS, breeds, ageRanges } from "../../../../assets/Pet";
import Step1SelectDate from "./Step1SelectDate";
import Step2ChooseTime from "./Step2ChooseTime";
import Step3ConfirmDetails from "./Step3ConfirmDetails";

const AppointmentModal = ({ vet, onClose, onSuccess }) => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reservedSlots, setReservedSlots] = useState([]);
  const [reservedSlotsByDate, setReservedSlotsByDate] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [ownerName, setOwnerName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.petOwnerDetails?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [customPetName, setCustomPetName] = useState("");
  const [customPetType, setCustomPetType] = useState("");
  const [customPetAge, setCustomPetAge] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState(user?.petOwnerDetails?.address || "");
  const [isTrained, setIsTrained] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableBreeds, setAvailableBreeds] = useState([]);
  const [availableAges, setAvailableAges] = useState([]);

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const consultationDuration =
    vet?.veterinarianDetails?.averageConsultationDuration || 30;

  const allPets = adoptedPets
    .filter(
      (pet) =>
        pet?.name && typeof pet.name === "string" && pet.name.trim() !== ""
    )
    .map((pet) => ({ ...pet, source: "adopted" }));

  // Update availableBreeds and availableAges when customPetType changes
  useEffect(() => {
    if (customPetType) {
      setAvailableBreeds(breeds[customPetType] || []);
      setAvailableAges(ageRanges[customPetType] || []);
    } else {
      setAvailableBreeds([]);
      setAvailableAges([]);
    }
  }, [customPetType]);

  // Fetch adopted pets
  useEffect(() => {
    const fetchAdoptedPets = async () => {
      if (!user?._id) return;
      setPetsLoading(true);
      try {
        const response = await axiosInstance.get("/api/pet/my-adopted-pets");
        if (response.data.success) {
          setAdoptedPets(response.data.data);
        } else {
          setAdoptedPets([]);
        }
      } catch (error) {
        setAdoptedPets([]);
      } finally {
        setPetsLoading(false);
      }
    };
    fetchAdoptedPets();
  }, [user?._id]);

  // Reset form when user changes
  useEffect(() => {
    setSelectedPet(null);
    setCustomPetName("");
    setCustomPetType("");
    setCustomPetAge("");
    setBreed("");
    setGender("");
    setAddress(user?.petOwnerDetails?.address || "");
    setIsTrained(false);
    setFormErrors({});
  }, [user]);

  // Fetch reserved slots for the month
  useEffect(() => {
    const fetchReservedSlotsForMonth = async () => {
      try {
        const year = currentDate.getUTCFullYear();
        const month = currentDate.getUTCMonth() + 1;
        const response = await axiosInstance.get(
          `/api/appointments/reserved-month`,
          {
            params: {
              professionalId: vet._id,
              year,
              month,
              professionalType: "Vet",
            },
          }
        );
        setReservedSlotsByDate(response.data.reservedSlotsByDate || {});
      } catch (error) {
        setReservedSlotsByDate({});
      }
    };
    fetchReservedSlotsForMonth();
  }, [currentDate, vet._id]);

  // Fetch reserved slots for selected date
  const fetchReservedSlots = async (date) => {
    if (!vet || !date) return;
    const formattedDate = formatDate(date);
    setLoading(true);
    try {
      setReservedSlots([]);
      const response = await axiosInstance.get(
        `/api/appointments/reserved/${vet._id}`,
        {
          params: { date: formattedDate, professionalType: "Vet" },
        }
      );
      setReservedSlots(response.data.reservedSlots || []);
    } catch (error) {
      setReservedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vet?._id && selectedDate) {
      fetchReservedSlots(selectedDate);
    }
  }, [vet?._id, selectedDate]);

  // Update available slots
  useEffect(() => {
    if (selectedDate && vet?.veterinarianDetails?.openingHours) {
      const slots = getAvailableTimeSlots(selectedDate);
      setAvailableSlots(slots);
    }
  }, [
    selectedDate,
    reservedSlots,
    reservedSlotsByDate,
    vet?.veterinarianDetails?.openingHours,
  ]);

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
  };

  const normalizeDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return new Date();
    const newDate = new Date(date);
    newDate.setUTCHours(0, 0, 0, 0);
    return newDate;
  };

  const isDayOpen = (date) => {
    const dayOfWeek = weekdays[date.getDay()].toLowerCase();
    const openingHours = vet?.veterinarianDetails?.openingHours;
    return openingHours && openingHours[dayOfWeek] !== "Closed";
  };

  const generateTimeSlots = (startTime, endTime, duration) => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    if (
      isNaN(startHour) ||
      isNaN(startMinute) ||
      isNaN(endHour) ||
      isNaN(endMinute)
    ) {
      return [];
    }

    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);
    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);
    if (end <= start) end.setDate(end.getDate() + 1);
    end.setMinutes(end.getMinutes() - duration);

    let currentTime = new Date(start);
    while (currentTime <= end) {
      const hours = currentTime.getHours().toString().padStart(2, "0");
      const minutes = currentTime.getMinutes().toString().padStart(2, "0");
      slots.push(`${hours}:${minutes}`);
      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }
    return slots;
  };

  const getPotentialTimeSlots = (date) => {
    if (!vet?.veterinarianDetails?.openingHours) return [];
    const dayOfWeek = weekdays[date.getDay()].toLowerCase();
    const openingHours = vet.veterinarianDetails.openingHours;
    if (!openingHours || openingHours[dayOfWeek] === "Closed") return [];

    const slots = [];
    const sessionType = openingHours[dayOfWeek];
    const start1 = openingHours[`${dayOfWeek}Start`];
    const end1 = openingHours[`${dayOfWeek}End`];

    if (start1 && end1)
      slots.push(...generateTimeSlots(start1, end1, consultationDuration));

    if (sessionType === "Double Session") {
      const start2 = openingHours[`${dayOfWeek}Start2`];
      const end2 = openingHours[`${dayOfWeek}End2`];
      if (start2 && end2)
        slots.push(...generateTimeSlots(start2, end2, consultationDuration));
    }
    return slots;
  };

  const isDayFullyBooked = (date) => {
    const normalizedDate = normalizeDate(date);
    const potentialSlots = getPotentialTimeSlots(normalizedDate);
    const dateStr = formatDate(normalizedDate);
    const reserved = reservedSlotsByDate[dateStr] || reservedSlots || [];
    return (
      potentialSlots.length > 0 &&
      potentialSlots.every((slot) => reserved.includes(slot))
    );
  };

  const getAvailableTimeSlots = (date) => {
    const normalizedDate = normalizeDate(date);
    const potentialSlots = getPotentialTimeSlots(normalizedDate);
    const dateStr = formatDate(normalizedDate);
    const reserved = reservedSlotsByDate[dateStr] || reservedSlots || [];
    return potentialSlots.filter((slot) => !reserved.includes(slot));
  };

  const handleDateSelect = async (date) => {
    const normalizedDate = normalizeDate(date);
    if (isDayFullyBooked(normalizedDate)) {
      alert("This day is fully booked. Please select another date.");
      return;
    }
    setSelectedDate(normalizedDate);
    setSelectedTime(null);
    await fetchReservedSlots(normalizedDate);
    const slots = getAvailableTimeSlots(normalizedDate);
    setAvailableSlots(slots);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handlePrevMonth = () =>
    setCurrentDate(
      normalizeDate(
        new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth() - 1,
            1
          )
        )
      )
    );
  const handleNextMonth = () =>
    setCurrentDate(
      normalizeDate(
        new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth() + 1,
            1
          )
        )
      )
    );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "customPetName":
        setCustomPetName(value);
        break;
      case "customPetType":
        setCustomPetType(value);
        setBreed("");
        setCustomPetAge("");
        break;
      case "customPetAge":
        setCustomPetAge(value);
        break;
      case "breed":
        setBreed(value);
        break;
      case "gender":
        setGender(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "reason":
        setReason(value);
        break;
      case "notes":
        setNotes(value);
        break;
      default:
        break;
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePetSelect = (e) => {
    const value = e.target.value;
    if (value === "other") {
      setSelectedPet(null);
      setCustomPetName("");
      setCustomPetType("");
      setCustomPetAge("");
      setBreed("");
      setGender("");
      setAddress(user?.petOwnerDetails?.address || "");
      setIsTrained(false);
    } else {
      const [name] = value.split("-");
      const pet = allPets.find(
        (p) => p.name === name && p.source === "adopted"
      );
      if (pet) {
        setSelectedPet(pet);
        setCustomPetName("");
        setCustomPetType(pet.species?.toLowerCase() || "");
        setCustomPetAge(pet.age || "");
        setBreed(pet.breed || "");
        setGender(pet.gender || "");
        setAddress(user?.petOwnerDetails?.address || "");
        setIsTrained(pet.isTrained ?? false);
      }
    }
    setFormErrors((prev) => ({ ...prev, petName: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedPet && !customPetName.trim())
      errors.petName = "Please select a pet or enter a custom pet name";
    if (!selectedPet && !customPetType.trim())
      errors.customPetType = "Please select a pet type";
    if (!reason.trim())
      errors.reason = "Please specify the reason for your visit";
    if (!selectedPet && !customPetName.trim()) {
      if (!ownerName.trim()) errors.ownerName = "Please enter your name";
      if (!phone.trim()) errors.phone = "Please enter your phone number";
      if (!email.trim()) errors.email = "Please enter your email";
    }
    if (!selectedDate) errors.date = "Please select a date";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const appointmentDate = formatDate(selectedDate);
      const appointmentData = {
        professionalId: vet._id,
        professionalType: "Vet",
        date: appointmentDate,
        time: selectedTime,
        duration: consultationDuration,
        petId: selectedPet?._id || undefined,
        petName: selectedPet ? selectedPet.name : customPetName,
        petType: selectedPet
          ? selectedPet.species || "Unknown"
          : customPetType || "Unknown",
        petAge: selectedPet
          ? selectedPet.age || "Unknown"
          : customPetAge || "Unknown",
        petSource: selectedPet ? selectedPet.source : "other",
        reason: reason,
        notes: notes,
        breed: selectedPet ? selectedPet.breed || "Unknown" : breed || "Unknown",
        gender: selectedPet
          ? selectedPet.gender || "Unknown"
          : gender || "Unknown",
        address: address || "Unknown",
        isTrained: selectedPet
          ? selectedPet.isTrained ?? false
          : isTrained ?? false,
      };
      const response = await axiosInstance.post(
        "/api/appointments/book",
        appointmentData
      );
      if (response.data.success) {
        setShowSuccess(true);
        await fetchReservedSlots(selectedDate);
        setReservedSlotsByDate((prev) => ({
          ...prev,
          [appointmentDate]: [...(prev[appointmentDate] || []), selectedTime],
        }));
        setTimeout(() => {
          onSuccess && onSuccess(response.data);
          onClose();
          navigate("/Vetappointments");
        }, 2000);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to book appointment. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderStepContent = () => {
    if (showSuccess) {
      return (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={32} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Appointment Booked!
          </h3>
          <p className="text-center text-gray-600 text-sm">
            Your appointment with Dr. {vet.fullName} for{" "}
            {selectedPet?.name || customPetName} has been confirmed for{" "}
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            at {formatTimeSlot(selectedTime)}.
          </p>
          <p className="text-center text-gray-500 text-xs">
            A confirmation has been sent to {email}.
          </p>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <Step1SelectDate
            vet={vet}
            currentDate={currentDate}
            selectedDate={selectedDate}
            handleDateSelect={handleDateSelect}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            isDayOpen={isDayOpen}
            isDayFullyBooked={isDayFullyBooked}
            normalizeDate={normalizeDate}
          />
        );
      case 2:
        return (
          <Step2ChooseTime
            vet={vet}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableSlots={availableSlots}
            loading={loading}
            handleTimeSelect={handleTimeSelect}
            setStep={setStep}
            formatTimeSlot={formatTimeSlot}
            consultationDuration={consultationDuration}
          />
        );
      case 3:
        return (
          <Step3ConfirmDetails
            vet={vet}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedPet={selectedPet}
            customPetName={customPetName}
            customPetType={customPetType}
            customPetAge={customPetAge}
            breed={breed}
            gender={gender}
            address={address}
            isTrained={isTrained}
            phone={phone}
            email={email}
            reason={reason}
            notes={notes}
            formErrors={formErrors}
            allPets={allPets}
            petsLoading={petsLoading}
            availableBreeds={availableBreeds}
            availableAges={availableAges}
            handlePetSelect={handlePetSelect}
            handleInputChange={handleInputChange}
            setIsTrained={setIsTrained}
            formatTimeSlot={formatTimeSlot}
            consultationDuration={consultationDuration}
            SPECIES_OPTIONS={SPECIES_OPTIONS}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-hidden mt-20">
      <div className="bg-white rounded-tl-lg rounded-tr-3xl rounded-br-xl rounded-bl-2xl w-full max-w-md shadow-xl border border-yellow-100 mx-4 my-8 max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-pink-50 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">
            Book an Appointment
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pink-100 transition-colors"
          >
            <X size={18} className="text-pink-500" />
          </button>
        </div>

        {!showSuccess && (
          <div className="flex justify-between px-6 py-4 bg-gray-50 shrink-0">
            {["Select Date", "Choose Time", "Confirm Details"].map(
              (label, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${
                      step > index + 1
                        ? "bg-green-500 text-white"
                        : step === index + 1
                        ? "bg-pink-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                  >
                    {step > index + 1 ? <Check size={16} /> : index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      step >= index + 1
                        ? "text-gray-800 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              )
            )}
          </div>
        )}

        <div className="max-h-[50vh] overflow-y-auto p-6 flex-1">
          {renderStepContent()}
        </div>

        {!showSuccess && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && !selectedDate) {
                    alert("Please select a date");
                    return;
                  }
                  if (step === 2 && !selectedTime) {
                    alert("Please select a time");
                    return;
                  }
                  setStep(step + 1);
                }}
                className={`px-6 py-2 text-sm font-medium text-white rounded-full transition-all
                  ${
                    (step === 1 && !selectedDate) ||
                    (step === 2 && !selectedTime)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#ffc929] to-pink-500 hover:shadow-md"
                  }
                `}
                disabled={
                  (step === 1 && !selectedDate) || (step === 2 && !selectedTime)
                }
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-pink-500 rounded-full hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Booking...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;