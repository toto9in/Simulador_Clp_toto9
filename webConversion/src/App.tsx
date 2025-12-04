import { MainWindow } from './components/MainWindow/MainWindow'
import { ToastProvider } from './context/ToastContext'
import './App.css'

function App() {
  return (
    <ToastProvider>
      <MainWindow />
    </ToastProvider>
  )
}

export default App
