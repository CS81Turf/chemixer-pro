import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    chemical: { type: String, required: true },
    ratePer1000: { type: String, required: true },
    totalAmount: { type: String, required: true }
});

const mixSchema = new mongoose.Schema({
    areaSize: { type: Number, required: true},
    waterVolume: { type: Number, required: true},
    sprayRate: { type: Number, required: true},
    treatment: { type: String, required: true},
    results: [resultSchema], // embedded array of chemicals
    savedAt: { type: Date, required: true},
    savedBy: { type: String, required: true},
    userId: { type: String, required: true}
})

const Mix = mongoose.model("Mix", mixSchema);

export default Mix;