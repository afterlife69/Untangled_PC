import './App.css';
import {Route, Routes, BrowserRouter} from 'react-router-dom'
import Hello from './components/hello';
import Example from './components/example';
import Login from './components/login';
import Chat from './components/chatbot';
import Stats from './components/stats';
function App() {
  return (
      <div>
        <BrowserRouter>
          <Routes>
            <Route path='/stats' element={<Stats />} />
            <Route path='/chatb' element={<Chat />} />
            <Route path='/hello' element={<Hello />} />
            <Route path='/example' element={<Example />} />
            <Route path='/' element={<Login />} />
          </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;
