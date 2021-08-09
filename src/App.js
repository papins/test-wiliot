/* global Plotly:true */
import React, { useState, useEffect, useReducer } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

// import './App.css';

const Plot = createPlotlyComponent(Plotly);

const useWebsocket = (url, onGetData, onConnectionChange) => {
  useEffect(() => {
    const websocket = new WebSocket(url);
    websocket.onopen = () => {
      onConnectionChange(true);
      // console.log('connected');
    };

    websocket.onmessage = (event) => {
      const d = JSON.parse(event.data);
      onGetData(d);
    };

    return () => {
      websocket.close();
      onConnectionChange(false);
    };
  }, []);
};

function reducer(state, action) {
  // console.log('state:', state);
  const { x, y, x2, y2, wsConnected } = state;
  if (action.type === 'update') {
    // console.log('update');
    const newX = [...x, action.data[0].timestamp];
    const newY = [...y, action.data[0].temperature];

    const newX2 = [...x2, action.data[1].timestamp];
    const newY2 = [...y2, action.data[1].temperature];
    // console.log('newX2:', newY2);
    return { x: newX, y: newY, x2: newX2, y2: newY2, wsConnected };
  } else if (action.type === 'connection-change') {
    return { ...state, wsConnected: action.data };
  } else {
    throw new Error();
  }
}

function App() {
  const [data, dispatch] = useReducer(reducer, {
    x: [],
    y: [],
    x2: [],
    y2: [],
    wsConnected: false,
  });

  const onGetData = (data) => {
    dispatch({ type: 'update', data });
  };

  const onConnectionChange = (status) => {
    dispatch({ type: 'connection-change', data: status });
  };

  useWebsocket('ws://localhost:8999', onGetData, onConnectionChange);

  return (
    <>
      <b>WILIOT Test</b>
      <pre>ID 1: Temp: {data.y[data.y.length - 1]} C</pre>
      <pre>ID 2: Temp: {data.y2[data.y2.length - 1]} C</pre>
      <pre>WS status: {data.wsConnected ? 'Connected' : 'Disconnected'}</pre>
      <Plot
        data={[
          {
            x: data.x,
            y: data.y,
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'black' },
            name: 'ID 1',
          },
          {
            x: data.x2,
            y: data.y2,
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'lightgrey' },
            name: 'ID 2',
          },
        ]}
        layout={{ width: 1400, height: 500, title: 'DATA' }}
      />
    </>
  );
}

export default App;
