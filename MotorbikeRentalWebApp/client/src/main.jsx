import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "antd/dist/reset.css"
import { Provider } from 'react-redux'
import store from './redux/store.js'
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>,
  </Provider>
)
