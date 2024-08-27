import './App.css';
import {Route, Routes, BrowserRouter} from 'react-router-dom'
import Hello from './components/hello';
import Menu from './components/menu';
import Example from './components/example';
import Login from './components/login';
import Chat from './components/chatbot';
import Stats from './components/stats';
import LiveEmotionDetection from './components/emotionDetection';
function App() {
  return (
      <div>
        <BrowserRouter>
          <Routes>
            <Route path='/stats' element={<Stats />} />
            <Route path='/emotion' element={<LiveEmotionDetection />} />
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
