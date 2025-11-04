"use client"
import { useAuthRedirect } from '@/lib/useAuthRedirect'

const DashboardPage = () => {
   useAuthRedirect()
  return (
    <div>DashboardPage</div>
  )
}

export default DashboardPage