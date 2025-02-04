// Previous imports remain the same...

// Update the theme object in the CryptoDashboard component
const theme = {
  background: 'transparent',
  textColor: '#e2e8f0',
  fontSize: 12,
  axis: {
    domain: {
      line: {
        stroke: '#475569',
        strokeWidth: 1,
      },
    },
    ticks: {
      line: {
        stroke: '#475569',
        strokeWidth: 1,
      },
      text: {
        fill: '#94a3b8',
      }
    },
  },
  grid: {
    line: {
      stroke: '#1e293b',
      strokeWidth: 1,
    },
  },
  crosshair: {
    line: {
      stroke: '#94a3b8',
      strokeWidth: 1,
      strokeDasharray: '4 4',
    },
  },
  tooltip: {
    container: {
      background: '#1e293b',
      color: '#e2e8f0',
      fontSize: 'inherit',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      padding: '6px 8px',
    },
  },
};

// Rest of the component remains the same...