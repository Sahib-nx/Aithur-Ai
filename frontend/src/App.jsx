import './index.css';
import Home from './components/Home'
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginModal from './components/Login.jsx';
import RegisterModal from './components/Register.jsx';
import { useAuth } from './context/AuthProvider.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, Bounce } from 'react-toastify';

function App() {
  const [authUser] = useAuth();
  console.log(authUser)

  return (
    <>
      <div className=''>


        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Bounce}
        />
        <Routes>

          <Route path='/' element={authUser ? <Home /> : <Navigate to={"/login"} />} />
          <Route path='/login' element={authUser ? <Navigate to={"/"} /> : <LoginModal />} />
          <Route path='/register' element={authUser ? <Navigate to={"/"} /> : <RegisterModal />} />

        </Routes>
      </div>
    </>
  )
}

export default App
