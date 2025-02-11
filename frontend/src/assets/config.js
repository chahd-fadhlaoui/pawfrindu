import { Award, Stethoscope, User } from "lucide-react";

const config = {
    roles: [
      {
        id: "pet-owner",
        label: "Pet Owner",
        icon: User,
        description: "Find the perfect companion and manage your pet adoptions",
        bgColor: "from-pink-500 to-purple-500",
      },
      {
        id: "trainer",
        label: "Trainer",
        icon: Award,
        description:
          "Share your expertise and help pets reach their full potential",
        bgColor: "from-blue-500 to-cyan-500",
      },
      {
        id: "veterinaire",
        label: "Veterinarian",
        icon: Stethoscope,
        description: "Provide medical care and support for our furry friends",
        bgColor: "from-green-500 to-teal-500",
      },
    ],
    transitions: {
      duration: 500,
      baseClasses: "transition-all duration-300",
    },
  };
  export default config;