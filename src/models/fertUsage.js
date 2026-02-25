import mongoose from "mongoose";

const fertUsageSchema = new mongoose.Schema({
    bagsUsed: {
        type: Number,
        required: true,
        min: 0
    },
    fertilizerType: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Optional: speed up queries for daily entries
fertUsageSchema.index({ userId: 1, date: 1 });

const FertUsage = mongoose.model("FertUsage", fertUsageSchema);

export default FertUsage;