import pet1 from "../assets/pets/pet1.png"
import pet2 from "../assets/pets/pet2.png"
import pet3 from "../assets/pets/pet3.png"
import pet4 from "../assets/pets/pet4.png"
import pet5 from "../assets/pets/pet5.png"
import pet6 from "../assets/pets/pet6.png"


export const pets = [  
    {  
        _id: 'pet1',  
        name: 'Lucca',  
        race: 'Labrador Retriever',  
        breed: 'Mixed',  
        age: '5 years',  
        city: 'New York',  
        gender: 'Male', 
        category:'Dog', 
        fee: 150,  
        isTrained: 'Yes',  
        status: 'Pending',
        image: pet1,  
        description: 'Lucca is a friendly and energetic Labrador mix who loves to play fetch and go on long walks. He’s great with children and gets along well with other pets.'  ,
        candidates: []
    },  
    {  
        _id: 'pet2',  
        name: 'Bella',  
        race: 'Shih Tzu',  
        breed: 'Purebred',  
        age: '3 years',  
        city: 'San Francisco',  
        gender: 'Female',  
        category:'Cat', 
        fee: 0,  
        isTrained: 'Yes',  
        status: 'Pending',
        image: pet2,  
        description: 'Bella is a sweet and affectionate Shih Tzu who enjoys being pampered. She loves cuddling on the couch and is perfect for a family looking for a lap dog.'  ,
        candidates: [
            {
                id: 1,
                name: 'Chahd Fadhlaoui',
                email: 'Chahd@example.com',
                phone: '+1234567890',
                status: 'pending',
                form: {
                  experience: 'Previous cat owner for 2 years',
                  housing: 'House with garden',
                  occupation: 'Software Engineer',
                  familySize: '7 members'
                }
              },
        ]
    },  
    {  
        _id: 'pet3',  
        name: 'Max',  
        race: 'German Shepherd',  
        breed: 'Purebred',  
        age: '4 years',  
        city: 'Chicago',  
        gender: 'Male', 
        category:'Dog',  
        fee: 0,  
        isTrained: 'Yes',  
        status: 'Pending',
        image: pet3,  
        description: 'Max is a loyal and protective German Shepherd. He is well-trained and excels in obedience. He enjoys outdoor activities and needs an active family to keep up with him.' ,
        candidates: [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                status: 'pending',
                form: {
                  experience: 'Previous dog owner for 5 years',
                  housing: 'House with garden',
                  occupation: 'Software Engineer',
                  familySize: '3 members'
                }
              },
              {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+1987654321',
                status: 'pending',
                form: {
                  experience: 'First-time pet owner',
                  housing: 'Spacious apartment',
                  occupation: 'Teacher',
                  familySize: 'Single'
                }
              }
          ] 
    },  
    {  
        _id: 'pet4',  
        name: 'Daisy',  
        race: 'Beagle',  
        breed: 'Mixed',  
        age: '2 years',  
        city: 'Austin',  
        gender: 'Female',
        category:'Dog',   
        fee: 120,  
        isTrained: 'No',  
        status: 'Completed',
        image: pet4,  
        description: 'Daisy is a playful and curious Beagle mix. Although she is not fully trained yet, she is eager to learn. She would thrive in a home with plenty of outdoor space to explore.'  ,
        candidates: []
    },  
    {  
        _id: 'pet5',  
        name: 'Oliver',  
        race: 'Tabby Cat',  
        breed: 'Domestic Shorthair',  
        age: '1 year',  
        city: 'Seattle',  
        gender: 'Male', 
        category:'Cat', 
 
        fee: 75,  
        isTrained: 'Yes',  
        status: 'Pending',
        image: pet5,  
        description: 'Oliver is a playful and affectionate tabby cat who loves to chase after toys. He is litter trained and enjoys sunbathing by the window.'  ,
        candidates: []
    },  
    {  
        _id: 'pet6',  
        name: 'Lucy',  
        race: 'Maine Coon',  
        breed: 'Purebred',  
        age: '6 years',  
        city: 'Boston',  
        gender: 'Female', 
        category:'Cat', 
 
        fee: 250,  
        isTrained: 'Yes',  
        status: 'Completed',
        image: pet6,  
        description: 'Lucy is a gentle and majestic Maine Coon. She enjoys being around people and other pets. Her fluffy coat and friendly disposition make her a delightful companion.' ,
        candidates: [] 
    }  
];