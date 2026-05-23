const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true, "ledger must have an account"],
        index: true,
        immutable: true
    },
    amount:{
        type: Number,
        required: [true, "ledger must have an amount"],
        immutable: true},
        transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required: [true, "ledger must have a transaction"],
        index: true,
        immutable: true
        },
        type:{
            type: String,
            enum:{
                values: ["debit", "credit"],
                message: "ledger type must be either debit or credit"
            },
            required: [true, "ledger must have a type"],
            immutable: true
        }
})

function preventLeadgerModification(){
    throw new Error("ledger entries cannot be modified or deleted")
}
ledgerSchema.pre("findOneAndUpdate", preventLeadgerModification);
ledgerSchema.pre("findOneAndDelete", preventLeadgerModification);
ledgerSchema.pre("deleteOne", preventLeadgerModification);
ledgerSchema.pre("deleteMany", preventLeadgerModification);
ledgerSchema.pre("updateOne", preventLeadgerModification);
ledgerSchema.pre("remove", preventLeadgerModification);
ledgerSchema.pre("updateMany", preventLeadgerModification);
ledgerSchema.pre("findOneAndReplace", preventLeadgerModification);


const ledgerModel = mongoose.model("ledger", ledgerSchema);
module.exports = ledgerModel;