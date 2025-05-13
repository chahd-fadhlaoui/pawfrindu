import { Award, Stethoscope, User } from "lucide-react";

const config = {
  roles: [
    {
      id: "pet-owner",
      label: "Pet Owner",
      icon: User,
      description: "Find the perfect companion and manage your pet adoptions",
      bgColor: "from-pink-500 to-pink-600",
    },
    {
      id: "trainer",
      label: "Trainer",
      icon: Award,
      description: "Share your expertise and help pets reach their full potential",
      bgColor: "from-yellow-500 to-yellow-600",
    },
    {
      id: "veterinarian",
      label: "Veterinarian",
      icon: Stethoscope,
      description: "Provide medical care and support for our furry friends",
      bgColor: "from-green-500 to-green-600",
    },
  ],
  transitions: {
    duration: 300,
    baseClasses: "transition-all duration-300",
  },
};

export default config;