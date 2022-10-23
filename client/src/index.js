import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react'


import { Web3Modal } from '@web3modal/react'
import {chains} from '@web3modal/ethereum';

const root = ReactDOM.createRoot(document.getElementById('root'));
const config = {
  projectId: '74bb1410a399ebe240a21cb74c16167d',
  theme: 'dark',
  accentColor: 'default',
  ethereum: {
    appName: 'fundraiser-finance',
    autoConnect: true,
    chains: [
      chains.localhost,
      chains.goerli,
      chains.polygon
    ],
  }
};
root.render(
  <React.StrictMode>
    <ChakraProvider>
    <App />
      <Web3Modal config={config} />
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
