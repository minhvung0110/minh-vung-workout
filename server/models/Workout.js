const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
    setNumber: Number,
    weight: Number,
    reps: Number,
    rpe: { type: Number, min: 1, max: 10 },
    restTime: Number,
    oneRepMax: Number
});

const WorkoutExerciseSchema = new mongoose.Schema({
    exerciseId: String,
    name: String,
    type: { type: String, enum: ['Compound', 'Isolation'], default: 'Compound' },
    sets: [SetSchema]
});

const WorkoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dayOfWeek: { type: String },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    duration: Number,
    exercises: [WorkoutExerciseSchema],
    totalVolume: { type: Number, default: 0 }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
