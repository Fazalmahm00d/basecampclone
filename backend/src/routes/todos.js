const express = require('express');
const todoRouter = express.Router();
const Todo = require('../models/Todo');

// Get all todos for a project
todoRouter.get('/:projectId', async (req, res) => {
    try {
        const todos = await Todo.find({ project: req.params.projectId })
            .populate('creator', 'username')
            .sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todos', error: error.message });
    }
});

// Get single todo
todoRouter.get('/todo/:todoId', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.todoId)
            .populate('creator', 'username');
        
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todo', error: error.message });
    }
});

// Create new todo
todoRouter.post('/', async (req, res) => {
    try {
        const { title, description, creator, project } = req.body;
        
        const newTodo = new Todo({
            title,
            description,
            creator,
            project,
            tasks: []
        });

        const savedTodo = await newTodo.save();
        const populatedTodo = await Todo.findById(savedTodo._id)
            .populate('creator', 'username');
            
        res.status(201).json(populatedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Error creating todo', error: error.message });
    }
});

// Add task to todo
todoRouter.post('/:todoId/task', async (req, res) => {
    try {
        const { name, description, isCompleted } = req.body;
        const todo = await Todo.findById(req.params.todoId);
        
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        todo.tasks.push({ name, description, isCompleted });
        const updatedTodo = await todo.save();
        const populatedTodo = await Todo.findById(updatedTodo._id)
            .populate('creator', 'username');
            
        res.json(populatedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Error adding task', error: error.message });
    }
});

// Update task status
todoRouter.patch('/:todoId/task/:taskIndex', async (req, res) => {
    try {
        const { isCompleted } = req.body;
        const todo = await Todo.findById(req.params.todoId);
        
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        const taskIndex = parseInt(req.params.taskIndex);
        if (taskIndex >= todo.tasks.length) {
            return res.status(404).json({ message: 'Task not found' });
        }

        todo.tasks[taskIndex].isCompleted = isCompleted;
        const updatedTodo = await todo.save();
        const populatedTodo = await Todo.findById(updatedTodo._id)
            .populate('creator', 'username');
            
        res.json(populatedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
});

// Delete todo
todoRouter.delete('/:todoId', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.todoId);
        
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting todo', error: error.message });
    }
});

// Delete task
todoRouter.delete('/:todoId/task/:taskIndex', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.todoId);
        
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        const taskIndex = parseInt(req.params.taskIndex);
        if (taskIndex >= todo.tasks.length) {
            return res.status(404).json({ message: 'Task not found' });
        }

        todo.tasks.splice(taskIndex, 1);
        const updatedTodo = await todo.save();
        const populatedTodo = await Todo.findById(updatedTodo._id)
            .populate('creator', 'username');
            
        res.json(populatedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
});

module.exports = todoRouter;