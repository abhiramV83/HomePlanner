import './App.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './components/Home/Home.jsx'
import About from './components/About/About.jsx'
import Dashboard from './components/Dashboard.jsx'
import PublicView from './components/PublicView.jsx'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Home/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/about" element={<About/>}></Route>
        </Route>
        <Route path="/plan/:id" element={<PublicView/>}/>
      </>
    ),
    { basename: "/homeplanner" }
  )
  return (
    <RouterProvider router={router}/>    
  )
}
export default App