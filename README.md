# Stock Price Aggregation Web Application

A React-based web application for visualizing and analyzing stock price data in real-time.

## Features

- **Stock Price Charts**: View detailed price trends for individual stocks with customizable time intervals
- **Correlation Heatmap**: Analyze relationships between different stocks using a color-coded correlation matrix
- **Real-time Data**: Fetch and display up-to-date stock information
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Technology Stack

- React.js with TypeScript
- Material UI for component styling
- Recharts for data visualization
- Axios for API communication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## API Integration

The application integrates with a stock exchange test API using the following endpoints:

- `GET /stocks`: Fetch list of all available stocks
- `GET /stocks/:ticker?minutes=m`: Fetch historical price data for a specific stock

## Project Structure

```
src/
  ├── components/         # React components
  │   ├── StockChart.tsx
  │   └── CorrelationHeatmap.tsx
  ├── services/          # API services
  │   └── api.ts
  ├── utils/             # Utility functions
  │   └── analytics.ts
  ├── types/             # TypeScript type definitions
  │   └── stock.ts
  ├── App.tsx            # Main application component
  └── index.tsx          # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
