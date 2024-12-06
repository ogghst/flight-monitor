'use client'
import dynamic from 'next/dynamic'

const FlightMonitor = dynamic(() => import('./components/FlightMonitor'), {
  ssr: false
})

export default function Home() {
  return <FlightMonitor />
}