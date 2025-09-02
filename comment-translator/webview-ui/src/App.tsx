import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';

interface VscodeMessage {
  command: string;
  text?: string;
}

interface vscode {
  postMessage(message: VscodeMessage): void;
}

/* you first acquire the VS Code API object by calling acquireVsCodeApi() this is
done in index.html */
declare const vscode: vscode;

function App() {
  const [heading, setHeading] = useState<boolean>(false);
  const [original, setOriginal] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [lines, setLines] = useState<string>('');
  const [symbols, setSymbols] = useState<string>('');

  window.addEventListener('message', (event) => {
    const message = event.data; // The JSON data sent from the extension
    switch (message.type) {
      case 'translationData': {
        setLines(message.value.lines);
        setOriginal(message.value.original);
        setTranslation(message.value.translation);
        setSymbols(message.value.symbols);

        /*allowing the webview to send data to the extension's core logic */
        vscode.postMessage({
          command: 'dataReceived',
          text: 'data received by frontend',
        });
        break;
      }
    }
  });

  useEffect(() => {
    //for some reason this only works when the event listener is outside 🤷‍♀️
  }, []);

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
      <Header/>
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
        <p>{lines}</p>
        <p>{original}</p>
        <p>{translation}</p>
        <p>{symbols}</p>
      </div>
    </>
  );
}

export default App;
