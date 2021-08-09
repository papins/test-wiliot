/* global Plotly:true */
import React, { useEffect, useReducer, useCallback, useRef } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

const useWebsocket = (url, onGetData, onConnectionChange) => {
  const websocket = useRef(null);

  const connect = () => {
    if (websocket.current) return;

    websocket.current = new WebSocket(url);
    websocket.current.onopen = () => {
      onConnectionChange(true);
    };
    websocket.current.onclose = (event) => {
      onConnectionChange(false);
      websocket.current = null;
      setTimeout(() => {
        connect();
      }, 1000);
    };
    websocket.current.onmessage = (event) => {
      const d = JSON.parse(event.data);
      onGetData(d);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      websocket.current && websocket.current.close();
    };
  }, [url, onGetData, onConnectionChange]);
};

function reducer(state, action) {
  if (action.type === 'update') {
    const newState = { ...state };

    const timestampNow = Date.now();
    // save data only for the last 5 minutes
    newState.data = state.data.filter((d) => d[0].timestamp >= timestampNow - 1000 * 60 * 5);

    newState.data.push(action.data);

    return newState;
  } else if (action.type === 'connection-change') {
    return { ...state, wsConnected: action.data };
  } else {
    throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, {
    data: [],
    wsConnected: false,
  });

  const onGetData = useCallback((data) => {
    dispatch({ type: 'update', data });
  }, []);

  const onConnectionChange = useCallback((status) => {
    dispatch({ type: 'connection-change', data: status });
  }, []);

  useWebsocket('ws://localhost:8999', onGetData, onConnectionChange);

  const { data, wsConnected } = state;
  const plotData = ['black', 'lightgrey'].map((color, index) => {
    const x = [];
    const y = [];
    data.forEach((d) => {
      if (d[index].temperature <= 100) {
        x.push(d[index].timestamp);
        y.push(d[index].temperature);
      }
    });
    return {
      x,
      y,
      type: 'scatter',
      mode: 'lines',
      marker: { color },
      name: `ID ${index + 1}`,
    };
  });

  return (
    <>
      <b>WILIOT Test</b>
      <pre>WS status: {wsConnected ? 'Connected' : 'Disconnected'}</pre>
      {!!data.length && <pre>ID 1: Temp: {data[data.length - 1][0].temperature} C</pre>}
      {!!data.length && <pre>ID 2: Temp: {data[data.length - 1][1].temperature} C</pre>}
      <Plot
        data={plotData}
        layout={{ width: 1400, height: 500, title: 'DATA', xaxis: { type: 'date' } }}
      />
    </>
  );
}

export default App;
