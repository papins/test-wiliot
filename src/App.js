/* global Plotly:true */

import React, { useState, useEffect, useReducer } from 'react';

// import Plot from 'react-plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';

// import './App.css';

const Plot = createPlotlyComponent(Plotly);

// import plotComponentFactory from 'react-plotly.js/factory';
// import Plotly from 'plotly.js-dist';
// const Plot = plotComponentFactory(Plotly);

// import styled from 'styled-components'
// import { useTable, usePagination } from 'react-table'

// import makeData from './makeData'

// const useReactQuerySubscription = (data, setData) => {
//   useEffect(() => {
//     // const websocket = new WebSocket('wss://echo.websocket.org/')
//     const websocket = new WebSocket('ws://localhost:8999');
//     websocket.onopen = () => {
//       console.log('connected');
//     };
//
//     websocket.onmessage = (event) => {
//       const d = JSON.parse(event.data);
//       console.log('d:', d[0].timestamp, d[0].temperature);
//       const newData = {x: [...data.x], y: [...data.y]};
//       newData.x.push(d[0].timestamp);
//       newData.y.push(d[0].temperature);
//       console.log('newData:', newData);
//       setData(newData);
//       // const queryKey = [...data.entity, data.id].filter(Boolean)
//       // queryClient.invalidateQueries(queryKey)
//     };
//
//     return () => {
//       websocket.close();
//     };
//   }, []);
// };
function reducer(state, action) {
  // console.log('state:', state);
  const { x, y, x2, y2 } = state;
  if (action.type === 'update') {
    // console.log('update');
    const newX = [...x];
    newX.push(action.data[0].timestamp);
    const newY = [...y];
    newY.push(action.data[0].temperature);

    const newX2 = [...x2];
    newX2.push(action.data[1].timestamp);
    const newY2 = [...y2];
    newY2.push(action.data[1].temperature);
    // console.log('newX2:', newY2);
    return { x: newX, y: newY, x2: newX2, y2: newY2 };
  } else {
    throw new Error();
  }
}

function App() {
  // const [cnt, dispatch] = useReducer(reducer, 0);
  const [data, dispatch] = useReducer(reducer, { x: [], y: [], x2: [], y2: [] });

  useEffect(() => {
    // const websocket = new WebSocket('wss://echo.websocket.org/')
    const websocket = new WebSocket('ws://localhost:8999');
    websocket.onopen = () => {
      // console.log('connected');
    };

    websocket.onmessage = (event) => {
      const d = JSON.parse(event.data);
      if (d[0].timestamp != d[1].timestamp) {
        console.log('d:', d[0].timestamp, d[0].temperature, d[1].timestamp, d[1].temperature);
      }
      dispatch({ type: 'update', data: d });
    };

    return () => {
      websocket.close();
    };
  }, []);

  // useReactQuerySubscription(data, setData);


  return (
    <><b>WILIOT Test</b>
      <pre>ID 1: Temp: {data.y[data.y.length - 1]} C</pre>
      <pre>ID 2: Temp: {data.y2[data.y2.length - 1]} C</pre>
      <Plot
        data={[
          {
            x: data.x,
            y: data.y,
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'black' },
            name: '1',
          },
          {
            x: data.x2,
            y: data.y2,
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'lightgrey' },
            name: '2',
          },
          // { type: 'bar', x: [1, 2, 3], y: [2, 5, 3] },
        ]}
        layout={{ width: 1200, height: 500, title: '' }}
      />
    </>
  );
}

export default App;
