import pet1 from "../assets/pets/pet6.png"
import pet2 from "../assets/pets/pet2.png"
export const posts = [
    {
      id: '1',
      name: 'Fluffy',
      race: 'Labrador',
      age: 2,
      fee: 50,
      status: 'Pending',
      image: pet1,
      candidates: [
        { name: 'John Doe', form: 'Form details here' },
        { name: 'Jane Smith', form: 'Form details here' }
      ]
    },
    {
      id: '2',
      name: 'Bella',
      race: 'Poodle',
      age: 3,
      fee: 0,
      status: 'Completed',
      image: pet2,
    }
  ];