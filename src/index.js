const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    res.status(404).send({
      error: "USER_NOT_FOUND"
    })
  }
  req.user = user
  return next();
}

function verifyBodyParamsTodo(req, res, next) {
  const { title, deadline } = req.body;

  if(!title || !deadline) {
    return res.status(400).json({
      error: `O parâmetro ${!title ? 'title' : 'deadline'} é obrigatório.`
    })
  }  return next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const usernameAlreadyExists = users.find(user => user.username  === username);

  if(usernameAlreadyExists){
    return res.status(400).json({
      error: "USERNAME_ALREADY_EXISTS"
    })
  }

  if(!username || !name) {
    return res.status(400).json({
      error: `O parâmetro ${!name ? 'name' : 'username'} é obrigatório.`
    })
  }

  const newUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(newUser)

  return res.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  console.log(user)

  return res.json(user.todos)
   
});

app.post('/todos', checksExistsUserAccount, verifyBodyParamsTodo, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;

  const createdTodo = {
    id: uuidv4(),
    title: title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(createdTodo)

  return res.status(201).json(createdTodo)
});

app.put('/todos/:id', checksExistsUserAccount, verifyBodyParamsTodo, (req, res) => {
  const { title, deadline } = req.body;
  const { id } = req.params;
  const { user } = req;

  const existTodo = user.todos.find(todo => todo.id === id);

  if(!existTodo) return res.status(404).json({
    error: 'TODO_NOT_FOUND'
  })

  user.todos.forEach(todo => {
    if(id == todo.id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
    }
  });

  return res.status(201).json({
    title: title,
    deadline: deadline,
    done: false,
  })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const existTodo = user.todos.find(todo => todo.id === id);

  if(!existTodo) return res.status(404).json({
    error: 'TODO_NOT_FOUND'
  })

  user.todos.forEach(todo => {
    if(id == todo.id) {
      todo.done = true
    }
  });

  return res.status(201).json(existTodo)

  
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const existTodo = user.todos.find(todo => todo.id === id);

  if(!existTodo) return res.status(404).json({
    error: 'TODO_NOT_FOUND'
  })

  user.todos = user.todos.filter(todo => todo.id !== id);

  return res.status(204).send()
});

module.exports = app;