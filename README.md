# X Query

An easy to use app for building advanced X search queries. This tool helps you construct complex search queries for X (formerly Twitter) without needing to remember the syntax.

## Features

- 🔍 Build complex search queries with an intuitive UI
- 🏷️ Add multiple search phrases with OR/AND logic
- 🚫 Exclude specific content types (retweets, replies, links, etc.)
- 📊 Set minimum engagement metrics (likes, retweets, replies)
- 👤 Filter by user interactions (from, to, mentions)
- 📍 Location-based searching with radius
- 🌐 Language filtering
- 📅 Date range selection
- 📋 One-click copy of generated queries

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/jbrz0/x-query.git
cd xradar-query-builder
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Fill in the desired search parameters in each section
2. The query will be automatically generated in the text area at the bottom
3. Click the "Copy" button to copy the query to your clipboard
4. Paste the query into X search box

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React DatePicker](https://reactdatepicker.com/) - Date selection
- [Heroicons](https://heroicons.com/) - Icons

## License

This project is licensed under the MIT License.
