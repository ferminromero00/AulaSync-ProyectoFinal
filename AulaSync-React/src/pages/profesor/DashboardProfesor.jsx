import React from 'react'
import Sidebar from '../../components/profesor/Sidebar'
import Header from '../../components/profesor/Header'
import ClasesProfesor from '../../components/profesor/ClasesProfesor'

export default function DashboardProfesor() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <ClasesProfesor />
          </div>
        </main>
      </div>
    </div>
  )
}
