import React from 'react'
import { useParams } from 'react-router-dom'

export default function PetDetails() {
    const {petId}=useParams();
  return (
    <div>
      petdetail
    </div>
  )
}
