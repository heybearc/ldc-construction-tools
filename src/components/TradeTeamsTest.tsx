'use client'

import React, { useState, useEffect } from 'react'

export default function TradeTeamsTest() {
  const [status, setStatus] = useState('Starting...')
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const testAPI = async () => {
      try {
        setStatus('Making API call...')
        console.log('Starting API call to /api/v1/trade-teams')
        
        const response = await fetch('/api/v1/trade-teams')
        console.log('Response received:', response.status, response.statusText)
        
        setStatus(`Response: ${response.status} ${response.statusText}`)
        
        if (response.ok) {
          const json = await response.json()
          console.log('JSON data:', json)
          setData(json)
          setStatus(`Success! Loaded ${json.length} teams`)
        } else {
          const text = await response.text()
          console.error('Error response:', text)
          setStatus(`Error: ${response.status} - ${text}`)
        }
      } catch (error) {
        console.error('Fetch error:', error)
        setStatus(`Fetch error: ${error}`)
      }
    }

    testAPI()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Component</h1>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      {data && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Data:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
