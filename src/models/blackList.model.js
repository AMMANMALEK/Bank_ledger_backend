const mongoose = require("mongoose")

const tokenblacklistSchema = new mongoose.Schema({
    token:{
        type: String,
        required: [true, "token is required"],
        unique: [true,"token already blacklisted"]
    }
    
},{
    timestamps: true
})
tokenblacklistSchema.index({ createdAt: 1 },{
        expireAfterSeconds: 60 * 60 * 24 * 7 // 7 days
})
    
const tokenBlacklistModel = mongoose.model("tokenblacklist", tokenblacklistSchema)
module.exports = tokenBlacklistModel