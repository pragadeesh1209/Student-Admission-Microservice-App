const mongoose = require("mongoose");
require("dotenv").config();
const Student = require("./models/Student");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/admission";

async function removeDuplicates() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        console.log("Finding duplicates...");
        const duplicates = await Student.aggregate([
            {
                $group: {
                    _id: {
                        name: "$name",
                        age: "$age",
                        mobile: "$mobile",
                        dob: "$dob"
                    },
                    ids: { $push: "$_id" },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        console.log(`Found ${duplicates.length} sets of duplicates.`);

        let totalRemoved = 0;
        for (const group of duplicates) {
            // Keep the first one, remove the rest
            const idsToRemove = group.ids.slice(1);
            const result = await Student.deleteMany({ _id: { $in: idsToRemove } });
            totalRemoved += result.deletedCount;
        }

        console.log(`✅ Successfully removed ${totalRemoved} duplicate records.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error removing duplicates:", err.message);
        process.exit(1);
    }
}

removeDuplicates();
