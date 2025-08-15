// Import necessary modules
const express = require('express');
const fs = require('fs'); // Use synchronous fs methods
const path = require('path');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing

// Initialize Express application
const app = express();
const PORT = 3000; // Port the server will listen on
const TODOS_FILE = path.join(__dirname, 'todos.json'); // Path to your todos.json file

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all routes (important for frontend communication)
app.use(cors());

// Helper function to read todos from the file (synchronous)
function readTodos() {
  try {
    // Check if the file exists. If not, create it with an empty array.
    if (!fs.existsSync(TODOS_FILE)) {
      fs.writeFileSync(TODOS_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(TODOS_FILE, 'utf8');
    // If the file is empty, return an empty array to prevent JSON.parse error
    if (data.trim() === '') {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    // Catch SyntaxError (for malformed JSON) or other read errors
    console.error('Error reading todos.json, creating an empty file:', error);
    // Overwrite the file with an empty array if it's corrupt
    fs.writeFileSync(TODOS_FILE, '[]', 'utf8');
    return [];
  }
}

// Helper function to write todos to the file (synchronous)
function writeTodos(todos) {
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2), 'utf8');
}

// --- API Endpoints ---

// GET /todos: Retrieve all todos
app.get('/todos', (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

// POST /todos: Add a new todo
app.post('/todos', (req, res) => {
  const { text } = req.body;
  // Basic validation (optional, but good practice)
  if (!text) {
    return res.status(400).json({ message: 'Todo text is required' });
  }
  const todos = readTodos();
  const newTodo = {
    // Generate a simple, short random ID
    id: Math.random().toString(36).substring(2, 9),
    text,
    completed: false,
  };
  todos.push(newTodo);
  writeTodos(todos);
  res.status(201).json(newTodo); // Respond with the newly created todo
});

// DELETE /todos/:id: Delete a todo
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  let todos = readTodos();
  const initialLength = todos.length;
  todos = todos.filter(todo => todo.id !== id);
  
  // Check if a todo was actually removed
  if (todos.length === initialLength) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  writeTodos(todos);
  res.status(204).send(); // 204 No Content for successful deletion
});

// Start the server
app.listen(PORT, () => {
  console.log(`To-Do Express server listening at http://localhost:${PORT}`);
});
