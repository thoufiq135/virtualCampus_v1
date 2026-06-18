import { useState } from 'react'
import Map from './Map'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
   <>
   <Map/>
   </>
  )
}

export default App
