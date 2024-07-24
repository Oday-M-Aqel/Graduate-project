const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending",
    },
    resName: {
        type: String,
        required: true,
        minlength: 3,
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
    },
    numPerson: {
        type: Number,
        required: true,
    },
    // Date for reservation time
    newDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value && value > Date.now();
            },
            message: props => `${props.value} should be a future date`
        }
    },
    // detail from user if want any specific detail on his reservation
    details: {
        type: String,
        required: false,
        default: "No details"
    },
    // admin message if reject
    message: {
        type: String,
        require: false,
        default: ""
    },
    givenScores: {
        type: Number,
        required: false,
        default: 0,
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);
