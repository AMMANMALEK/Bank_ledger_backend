const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const accountModel = require('../models/account.model')
const emailService = require('../services/email.service')
const mongoose = require('mongoose')



async function createTransaction(req, res) {
    const{fromAccount, toAccount, amount, idempotencyKey} = req.body
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
        
    })
    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })
    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message: "fromAccount or toAccount not found"
        })
    }
    /**
     * 2. validate idempotency key
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    })
    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "completed"){
            return res.status(200).json({
                message: "transaction already completed",
                transaction: isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status === "pending"){
           return res.status(200).json({
                message: "transaction is still in progress",
            })
        }
        if(isTransactionAlreadyExists.status === "failed"){
            return res.status(500).json({
                message: "transaction already failed"
                
            })
        }
        if(isTransactionAlreadyExists.status === "reversed"){
            return res.status(500).json({
                message: "transaction already reversed"
            })
        }
    }
    /*
     * 3. check account status
     */
    if(fromUserAccount.status !== "active" || toUserAccount.status !== "active"){
        return res.status(400).json({
            message: "fromAccount or toAccount is not active"
        })
    }
    /**
     * 4.derive sender balance from ledger  
     */
    const balance = await fromUserAccount.getBalance() 
    if(balance < amount){
        return res.status(400).json({
            message: `insufficient balance. current balance is ${balance}. requested amount is ${amount}` 
        })
    }
    let transaction;
    try{
        
    /**
     * 5. create transaction with pending status
     */
    const session = await mongoose.startSession()
    session.startTransaction()
    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "pending"
    }, { session })

    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "debit"
    }, { session })

    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "credit"
    }, { session })
    transaction.status = "completed"
    await transaction.save({ session })


    await session.commitTransaction()
    session.endSession()
}catch(error){
    return res.status(400).json({
        message: "transaction is pending due to some issue. please try again later",
        
    })
}
    
    /**
     * 6. send email notification to both sender and receiver
     */
    await emailService.sendTransactionEmail(req.user.email, req.user.name,amount, toUserAccount._id)
        return res.status(201).json({
            message: "transaction completed successfully",
            transaction : transaction
        })
    
}

async function createInitialFundsTransaction(req, res){
    const {toAccount, amount, idempotencyKey} = req.body
    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }
        const toUserAccount = await accountModel.findOne({
        _id: toAccount,
        })
    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        systemUser: true,
        user: req.user._id
    })
    if(!fromUserAccount){
        return res.status(400).json({
            message: "system account not found for the user"
        })
    }
    const session = await mongoose.startSession()
    session.startTransaction()
    const transaction = (await transactionModel.create([{
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "pending"
    }], { session }))[0]

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "debit"
    }], { session })

    await(()=>{
        return new Promise((resolve) =>setTimeout(resolve, 15 * 5000));
    })()

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "credit"
    }], { session })


    await transactionModel.findOneAndUpdate({
        _id: transaction._id},
        {status: "completed"},        
        {session}
    )

    await session.commitTransaction()
    session.endSession()
    return res.status(201).json({
        message: "initial funds transaction completed successfully",
        transaction : transaction
    })


}
module.exports = {
    createTransaction,
    createInitialFundsTransaction
}