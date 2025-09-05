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

interface commentInfo {
  startLine: string;
  endLine: string;
  original: string;
  translation: string;
}

/* you first acquire the VS Code API object by calling acquireVsCodeApi() this is
done in index.html */
declare const vscode: vscode;

function App() {
  const [source, setSource] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [commentData, setCommentData] = useState<commentInfo[]>([]);

  window.addEventListener('message', (event) => {
    const message = event.data; // The JSON data sent from the extension
    switch (message.type) {
      case 'translationData': {
        setFileName(message.value.fileName);
        setSource(message.value.source);
        setTarget(message.value.target);
        setCommentData(message.value.commentData);
        console.log(message.value.commentData);

        /* allowing the webview to send data to the extension's core logic */
        vscode.postMessage({
          command: 'dataReceived',
          text: 'data received by frontend',
        });
        break;
      }
    }
  });

  useEffect(() => {
    //unsure why this works when the event listener is outside the useEffect
  }, []);

  return (
    <div className='flex flex-col h-screen'>
      <Header fileName={fileName} />
      <CommentList commentData={commentData} />
      <Footer source={source} target={target} />
    </div>
  );
}

export default App;
