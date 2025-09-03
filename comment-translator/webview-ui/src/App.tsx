import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import CommentList from './components/CommentList';
import Footer from './components/Footer';

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
  const [source, setSource] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  // const [comments, setComments] = useState<string>('');

  window.addEventListener('message', (event) => {
    const message = event.data; // The JSON data sent from the extension
    switch (message.type) {
      case 'translationData': {
        setSource(message.value.source);
        setTarget(message.value.target);
        // setComments(message.value.commentData);

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

  // function handleToggle() {
  //   if (!heading) {
  //     setHeading(true);
  //   } else {
  //     setHeading(false);
  //   }
  // }

  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <CommentList />
      {/* <div>
        <code>{heading}</code>
        <button onClick={handleToggle}>Translate</button>
      </div> */}
      <Footer source={source} target={target} />
    </div>
  );
}

export default App;
