const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
    setNumber: Number,
    weight: Number,
    reps: Number,
    rpe: { type: Number, min: 1, max: 10 },
    restTime: Number, // saved in seconds
    oneRepMax: Number
});

const WorkoutExerciseSchema = new mongoose.Schema({
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    name: String,
    sets: [SetSchema]
});

const WorkoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    duration: Number, // in minutes
    exercises: [WorkoutExerciseSchema],
    totalVolume: { type: Number, default: 0 }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
