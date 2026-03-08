const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Compound', 'Isolation'], required: true },
    targetMuscleGroup: { type: String, required: true },
    description: String
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
