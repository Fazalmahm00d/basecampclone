const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    isCompleted: { 
        type: Boolean, 
        default: false 
    },
    deadline:{
        type:Date
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const TodoSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    creator: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    project: { 
        type: Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    tasks: [TaskSchema]
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Todo', TodoSchema);