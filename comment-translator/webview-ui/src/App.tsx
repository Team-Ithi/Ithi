import { useState } from 'react';
import './App.css';

function App() {
  const [heading, setHeading] = useState(false);

  function handleToggle() {
    if (!heading) {
      setHeading(true);
    } else {
      setHeading(false);
    }
  }

  return (
    <>
      <h1>{heading ? 'This is Ithi' : 'Yay Ithi!'}</h1>
      <p>
        No translations yet! Click <span>Translate</span> to get started.
      </p>
      <div className='form'>
        <code>Original Comment: (FR)</code>
        <input />
        <code>Translation: (EN)</code>
        <textarea></textarea>
        <button onClick={handleToggle}>Translate</button>
        <p>
          <a className='text-red-500'>Read the docs</a> to learn more about
          Ithi.
        </p>
      </div>
    </>
  );
}

export default App;
