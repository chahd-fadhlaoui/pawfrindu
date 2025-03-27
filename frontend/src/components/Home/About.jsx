import {
  HandHeartIcon,
  HeartHandshake,
  Search,
  Stethoscope,
} from "lucide-react";
import React from "react";
import img3 from "../../assets/images/about-1.jpg";
import img2 from "../../assets/images/about-2.jpg";
import img1 from "../../assets/images/about-3.jpg";
const About = () => {
  const services = [
    {
      icon: <HeartHandshake className="w-6 h-6 text-gray-700" />,
      title: "Pet Adoption Journey",
      description:
        "We guide you through every step of welcoming a new family member, ensuring perfect matches that last a lifetime. Our dedicated team works to understand both your needs and the pet's personality to create lasting bonds.",
      image:img1 ,
    },
    {
      icon: <Search className="w-6 h-6 text-gray-700" />,
      title: "Lost Pet Recovery",
      description:
        "Our network of dedicated volunteers and advanced tracking help reunite lost pets with their families quickly. We use modern technology and community outreach to maximize the chances of a successful reunion.",
      image: img3,
    },
    {
      icon: <Stethoscope className="w-6 h-6 text-gray-700" />,
      title: "Veterinary Care Network",
      description:
        "Connect with our trusted network of veterinary professionals who provide the best care for your pets. We ensure your pets receive top-quality medical attention in a comfortable and caring environment.",
      image: img2,
    },
  ];

  return (
    <section className="relative py-20 bg-white">
      {/* Decorative elements - matching Categories style */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute text-6xl text-pink-200 transform top-20 left-10 opacity-20 -rotate-12">
          🐾
        </div>
        <div className="absolute text-6xl text-yellow-200 transform rotate-45 top-40 right-20 opacity-20">
          🐾
        </div>
        <div className="absolute text-6xl text-pink-200 transform bottom-20 left-1/4 opacity-20 rotate-12">
          🐾
        </div>

        <div className="absolute top-0 left-0 bg-pink-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-0 bg-yellow-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 space-y-6 text-center">
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-pink-100 rounded-full shadow-sm">
            <HandHeartIcon className="w-4 h-4 mr-2 text-[#ffc929]" />
            How We Help
          </span>

          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl group">
            <span className="block">Comprehensive Care</span>
            <span className="block mt-2 text-pink-500">
              For Every Pet Journey
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-xl leading-relaxed text-gray-600">
            From adoption to healthcare, we're here to support every aspect of
            your pet's life with compassionate care and expert guidance.
          </p>
        </div>

        {/* Services */}
        <div className="space-y-20">
          {services.map((service, index) => (
            <div
              key={index}
              className={`
                flex flex-col gap-12 group
                md:flex-row md:items-center
                ${index % 2 === 1 ? "md:flex-row-reverse" : ""}
              `}
            >
              {/* Image container */}
              <div className="relative w-full md:w-1/2">
                <div className="relative overflow-hidden rounded-3xl">
                  <div className="relative overflow-hidden shadow-xl rounded-3xl">
                    <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-yellow-50/30 via-pink-50/30 to-yellow-50/30 group-hover:opacity-100" />
                    <img
                      src={service.image}
                      alt={service.title}
                      className="object-cover w-full transition-transform duration-700 transform h-96 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="w-full p-8 space-y-6 md:w-1/2">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center justify-center w-16 h-16 transition-all duration-500 transform rounded-full bg-gradient-to-br from-yellow-50 to-pink-50 group-hover:from-yellow-100 group-hover:to-pink-100 group-hover:rotate-6">
                    <div className="transition-transform duration-500 group-hover:scale-110">
                      {service.icon}
                    </div>
                  </span>
                  <h3 className="text-2xl font-semibold text-gray-900 transition-colors group-hover:text-pink-500">
                    {service.title}
                  </h3>
                </div>

                <p className="text-lg leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
