const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');

// Get all workouts for user
router.get('/', auth, async (req, res) => {
    try {
        const workouts = await Workout.find({ userId: req.user.id }).sort({ startTime: -1 });
        res.json(workouts);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Save a workout
router.post('/', auth, async (req, res) => {
    try {
        const { exercises, startTime, endTime } = req.body;

        // Calculate volume
        let totalVolume = 0;
        exercises.forEach(ex => {
            ex.sets.forEach(set => {
                totalVolume += (set.weight || 0) * (set.reps || 0);
                // Epley formula for 1RM: Weight * (1 + Reps/30)
                if (set.reps > 0) {
                    set.oneRepMax = set.weight * (1 + set.reps / 30);
                }
            });
        });

        const newWorkout = new Workout({
            userId: req.user.id,
            exercises,
            startTime,
            endTime,
            totalVolume,
            duration: endTime ? (new Date(endTime) - new Date(startTime)) / 60000 : 0
        });

        const workout = await newWorkout.save();
        res.json(workout);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get previous data for exercises
router.get('/last-data', auth, async (req, res) => {
    try {
        const { exerciseIds } = req.query; // Expect comma separated string
        const ids = exerciseIds ? exerciseIds.split(',') : [];

        const results = {};
        for (const id of ids) {
            const lastWorkout = await Workout.findOne({
                userId: req.user.id,
                'exercises.exerciseId': id
            }).sort({ startTime: -1 });

            if (lastWorkout) {
                results[id] = lastWorkout.exercises.find(ex => ex.exerciseId.toString() === id);
            }
        }
        res.json(results);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
