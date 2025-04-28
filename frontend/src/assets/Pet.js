
// This file contains the options for species, breeds, and age ranges for pets.
export const SPECIES_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "other", label: "Other" },
];
export const breeds = {
    dog: [
      "Labrador Retriever",
      "German Shepherd",
      "Golden Retriever",
      "French Bulldog",
      "Border Collie",
      "Poodle",
      "Beagle",
      "Rottweiler",
      "Boxer",
      "Dachshund",
      "Mixed Breed"
    ],
    cat: [
      "Siamese",
      "Persian",
      "Maine Coon",
      "British Shorthair",
      "Scottish Fold",
      "Ragdoll",
      "Bengal",
      "Russian Blue",
      "Mixed Breed"
    ],
    other: [
      "Rabbit",
      "Bird",
      "Turtle",
      "Hamster",
      "Fish",
      "Ferret",
      "Other"
    ]
  };
  
  export const ageRanges = {
    dog: [
      { 
        value: "puppy", 
        label: "Puppy (0-1 year)", 
        description: "Baby and playful" 
      },
      { 
        value: "young", 
        label: "Young (1-3 years)", 
        description: "Youthful and energetic" 
      },
      { 
        value: "adult", 
        label: "Adult (3-7 years)", 
        description: "Mature and stable" 
      },
      { 
        value: "senior", 
        label: "Senior (7+ years)", 
        description: "Calm and requires special care" 
      }
    ],
    cat: [
      { 
        value: "kitten", 
        label: "Kitten (0-1 year)", 
        description: "Young and curious" 
      },
      { 
        value: "young", 
        label: "Young (1-3 years)", 
        description: "Youthful and playful" 
      },
      { 
        value: "adult", 
        label: "Adult (3-8 years)", 
        description: "Mature and independent" 
      },
      { 
        value: "senior", 
        label: "Senior (8+ years)", 
        description: "Calm and requires special care" 
      }
    ],
    other: [
      {
        value: "young", 
        label: "Young", 
        description: "Early stage of life" 
      },
      { 
        value: "adult", 
        label: "Adult", 
        description: "Mature stage" 
      },
      { 
        value: "senior", 
        label: "Senior", 
        description: "Later stage of life" 
      }
    ]
  };
  
  export default {
    breeds,
    ageRanges,
    SPECIES_OPTIONS
  };