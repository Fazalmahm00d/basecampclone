// services/taskService.js
const Todo = require('../models/Todo');
const Project = require('../models/Project');

class TaskService {
    async getProjectTasks(projectId) {
        try {
            // Get all todos for the project
            const todos = await Todo.find({ project: projectId })
                .select('tasks')
                .lean();

            // Extract and format all tasks from todos
            const formattedTasks = todos.reduce((acc, todo) => {
                const tasks = todo.tasks.map(task => ({
                    task_name: task.name,
                    task_description: task.description,
                    deadline: task.deadline ? task.deadline.toISOString() : null,
                    is_completed: task.isCompleted
                }));
                return [...acc, ...tasks];
            }, []);

            return formattedTasks;

        } catch (error) {
            console.error('Error getting project tasks:', error);
            throw error;
        }
    }

    async analyzeProjectRisk(projectId) {
        try {
            // Get formatted tasks
            const tasks = await this.getProjectTasks(projectId);

            // Make request to ML service
            const response = await fetch('http://localhost:8000/predict_risk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tasks)
            });

            if (!response.ok) {
                throw new Error('Risk analysis service error');
            }

            return await response.json();

        } catch (error) {
            console.error('Error analyzing project risk:', error);
            throw error;
        }
    }
}

module.exports = new TaskService();