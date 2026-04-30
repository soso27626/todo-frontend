import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [deadline, setDeadline] = useState('');


  useEffect(() => {
    fetch('http://localhost:5120/todos')
      .then(res => res.json())
      .then(data => setTodos(data));
  }, []);

  const addTodo = () => {
    if (!newTitle) return;
    fetch('http://localhost:5120/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, isComplete: false, deadline: deadline || null })
    })
      .then(res => res.json())
      .then(todo => {
        setTodos([...todos, todo]);
        setNewTitle('');
      });
  };

  const deleteTodo = (id) => {
    fetch(`http://localhost:5120/todos/${id}`, { method: 'DELETE' })
      .then(() => setTodos(todos.filter(t => t.id !== id)));
  };

  const toggleTodo = (todo) => {
  fetch(`http://localhost:5120/todos/${todo.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: todo.title, isComplete: !todo.isComplete })
  })
    .then(res => res.json())
    .then(updated => {
      setTodos(todos.map(t => t.id === updated.id ? updated : t));
    });
};

  return (
    <div className ="container" >
      <h1>Todo List</h1>
      <div className = "input-row"> 
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown = {e => e.key === "Enter" && addTodo()}
          placeholder="Add a new todo"
        />
        <input 
        type="date"
        value={deadline}
        onChange = {e =>setDeadline(e.target.value)}
        style = {{colorScheme: 'light'}}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {[...todos].sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        }).map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.isComplete}
              onChange={() => toggleTodo(todo)}
            />
            <span style={{textDecoration: todo.isComplete ? 'line-through' : 'none',color: !todo.isComplete && todo.deadline && new Date(todo.deadline) < new Date() ? 'red' : 'black'}}>
              {todo.title}
              {todo.deadline && (
                <small style={{ color: '#888', marginLeft: '8px' }}>
                  Due: {new Date(todo.deadline).toLocaleDateString('en-NZ')}
                </small>
              )}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>

        ))}
      </ul>
    </div>
  );
}

export default App;
