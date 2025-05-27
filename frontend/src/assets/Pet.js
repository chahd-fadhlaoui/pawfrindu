// This file contains the options for species, breeds, and age ranges for pets.
export const SPECIES_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "other", label: "Other" },
];
export const species = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
];
export const breeds = {
  dog: [
    "Labrador Retriever",
    "German Shepherd",
    "Golden Retriever",
    "French Bulldog",
    "Border Collie",
    "Maltipoo",
    "Poodle",
    "Beagle",
    "Rottweiler",
    "Boxer",
    "Dachshund",
    "Mixed Breed",

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
    "Mixed Breed",
  ],
  other: ["Rabbit", "Bird", "Turtle", "Hamster", "Fish", "Ferret", "Other"],
};

export const ageRanges = {
  dog: [
    {
      value: "puppy",
      label: "Puppy (0-1 year)",
      description: "Baby and playful",
    },
    {
      value: "young",
      label: "Young (1-3 years)",
      description: "Youthful and energetic",
    },
    {
      value: "adult",
      label: "Adult (3-7 years)",
      description: "Mature and stable",
    },
    {
      value: "senior",
      label: "Senior (7+ years)",
      description: "Calm and requires special care",
    },
  ],
  cat: [
    {
      value: "kitten",
      label: "Kitten (0-1 year)",
      description: "Young and curious",
    },
    {
      value: "young",
      label: "Young (1-3 years)",
      description: "Youthful and playful",
    },
    {
      value: "adult",
      label: "Adult (3-8 years)",
      description: "Mature and independent",
    },
    {
      value: "senior",
      label: "Senior (8+ years)",
      description: "Calm and requires special care",
    },
  ],
  other: [
    {
      value: "young",
      label: "Young",
      description: "Early stage of life",
    },
    {
      value: "adult",
      label: "Adult",
      description: "Mature stage",
    },
    {
      value: "senior",
      label: "Senior",
      description: "Later stage of life",
    },
  ],
};

export const sizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];
export const colorOptions = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "brown", label: "Brown" },
  { value: "gray", label: "Gray" },
  { value: "golden", label: "Golden" },
  { value: "orange", label: "Orange" },

];

export const ageOptions = [
    { value: "", label: "Select Age" },
    { value: "Baby", label: "Baby (<1 year)" },
    { value: "Young", label: "Young (1-3 years)" },
    { value: "Adult", label: "Adult (3-7 years)" },
    { value: "Senior", label: "Senior (>7 years)" },
  ];

export default {
  breeds,
  ageRanges,
  SPECIES_OPTIONS,
  sizeOptions,
  colorOptions,
  species,
  ageOptions,
};
