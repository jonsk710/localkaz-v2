'use client'
import React from 'react'
import HostOnly from '@/components/HostOnly'
import HostCreateListingForm from '@/components/HostCreateListingForm'
import HostMyListings from '@/components/HostMyListings'

export default function HostPage() {
  return (
    <HostOnly>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Espace Hôte</h1>
        <HostCreateListingForm />
        <HostMyListings />
      </div>
    </HostOnly>
  )
}
