/* global Plotly:true */
import React, { useEffect, useReducer, useCallback } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
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
  }, [url, onGetData, onConnectionChange]);
};

function reducer(state, action) {
  // console.log('state:', state);
  const { x, y, x2, y2 } = state;
  if (action.type === 'update') {
    // console.log('update');
    const newState = { ...state };
    if (action.data[0].temperature <= 100) {
      newState.x = [...x, action.data[0].timestamp];
      newState.y = [...y, action.data[0].temperature];
    }
    if (action.data[1].temperature <= 100) {
      newState.x2 = [...x2, action.data[1].timestamp];
      newState.y2 = [...y2, action.data[1].temperature];
    }
    return newState;
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

  const onGetData = useCallback((data) => {
    dispatch({ type: 'update', data });
  }, []);

  const onConnectionChange = useCallback((status) => {
    dispatch({ type: 'connection-change', data: status });
  }, []);

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
        layout={{ width: 1400, height: 500, title: 'DATA', xaxis: { type: 'date' } }}
      />
    </>
  );
}

export default App;
