const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true, "transaction must have a from account"],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true, "transaction must have a to account"],
        index: true
    },
    status:{
        type: String,
        enum:{
            values: ["pending", "completed", "failed" ,"reversed"],
            message: "status must be either pending, completed, failed or reversed"
        },
        default: "pending"
    },
    amount:{
        type: Number,
        required: [true, "transaction must have an amount"],
        min: [0, "transaction amount must be greater than or equal to 0"]
    },
    idempotencyKey:{
        type: String,
        required: [true, "transaction must have an idempotency key"],
        unique: true,
        index: true
    }
},{
    timestamps: true

})

const transactionModel = mongoose.model("transaction", transactionSchema);
module.exports = transactionModel;