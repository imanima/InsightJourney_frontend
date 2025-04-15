# Insight Journey

A platform for analyzing therapy and coaching sessions using AI and graph databases.

## Features

- Session analysis using AI
- Graph-based data storage and visualization
- User-specific data management
- Real-time analysis and insights

## Architecture

The application consists of three main components:

1. **Frontend**: Next.js-based web application with TypeScript
2. **Backend**: Flask-based REST API with Python
3. **Database**: Neo4j graph database

## Process Flow

### Session Analysis and Storage

1. **Session Creation**
   - User creates a new session with a transcript
   - Session is stored in the database with basic metadata

2. **Analysis Process**
   - The analysis service processes the transcript
   - AI identifies:
     - Emotions and their intensity
     - Key topics and themes
     - Insights and realizations
     - Action items and tasks
   - Results are returned to the frontend for review

3. **Graph Storage**
   - Analysis results are saved to Neo4j
   - Elements are connected to their respective topics
   - User-specific data is properly tagged
   - Relationships between elements are established

4. **Data Retrieval**
   - Elements can be queried by session
   - Topics can be used to find related elements
   - Patterns can be analyzed across sessions

## Getting Started

### Backend Setup

1. Install Python dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start Neo4j database:
   ```bash
   docker-compose up -d neo4j
   ```

4. Run the Flask application:
   ```bash
   python app.py
   # The backend will start on http://localhost:5000
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up frontend environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Run the development server:
   ```bash
   npm run dev
   # The frontend will start on http://localhost:3000
   ```

## Development

- Backend API runs on port 5000
- Frontend development server runs on port 3000
- Neo4j database runs on ports 7474 (HTTP) and 7687 (Bolt)

## Documentation

- [API Documentation](backend/API_DOCUMENTATION.md)
- [Graph Data Model](backend/GRAPH_DATA_MODEL.md)

## License

MIT 