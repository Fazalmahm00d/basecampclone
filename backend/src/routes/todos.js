const express = require('express');
const todoRouter = express.Router();
const Todo = require('../models/Todo');
const mongoose = require("mongoose");
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


todoRouter.get("/tasks/:assignedTo", async (req, res) => {
    console.log("on tasks api");
    try {
        const { assignedTo } = req.params;
        console.log("assigned to" ,assignedTo)
        if (!assignedTo || !mongoose.isValidObjectId(assignedTo)) {
            return res.status(400).json({ message: "Invalid or missing User ID" });
        }

        if (!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)) {
            return res.status(400).json({ message: "Invalid or missing User ID" });
        }

        const todos = await Todo.find({ "tasks.assignedTo": assignedTo })
            .populate("tasks.assignedTo", "username")
            .populate("project", "name") // ✅ Ensuring project is populated correctly
            .select("tasks title project");

        let assignedTasks = [];
        todos.forEach(todo => {
            todo.tasks.forEach(task => {
                if (task.assignedTo && task.assignedTo._id.toString() === assignedTo) {
                    assignedTasks.push({
                        _id: task._id,
                        name: task.name,
                        description: task.description || "",
                        isCompleted: task.isCompleted,
                        deadline: task.deadline,
                        assignedTo: { _id: task.assignedTo._id, username: task.assignedTo.username },
                        todo: {
                            title: todo.title,
                            project: todo.project ? { _id: todo.project._id, name: todo.project.name } : null
                        }
                    });
                }
            });
        });

        res.json(assignedTasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching todos", error: error.message });
    }
});



// Get single todo
todoRouter.get('/todo/:todoId', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.todoId)
            .populate('creator', 'username')
            .populate('tasks.assignedTo', 'username');
        
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
        const { name, description, isCompleted,deadline,assignedTo } = req.body;
        const todo = await Todo.findById(req.params.todoId);
        
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        todo.tasks.push({ name, description, isCompleted,deadline,assignedTo });
        const updatedTodo = await todo.save();
        const populatedTodo = await Todo.findById(updatedTodo._id)
            .populate('creator', 'username')
            .populate('tasks.assignedTo', 'username');
            
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