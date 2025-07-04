import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AccountModel from "../data/schema/account";

const AccountRouter = Router()

AccountRouter.post('/register', async (req, res) => {
    try {
        let email = req.body.email
        let name = req.body.name
        let password = req.body.password
        let userExists = await AccountModel.find({ email: email })
        if (userExists.length > 0) {
            res.status(417).send({
                message: 'User already exists'
            })
        }
        else {
            let hashedPassword = await  bcrypt.hash(password, 10)
            let account = new AccountModel({
                name: name,
                email: email,
                password: hashedPassword
            })
            let savedAccount = await account.save()
            res.status(200).send(savedAccount)
        }

    }
    catch (error) {
        res.status(417).send(error)
    }


})

AccountRouter.post("/login", async (req, res) => {
    try{
        let email = req.body.email
        let password = req.body.password

        let account = await AccountModel.findOne({ email: email})
        if(account?.password){
            let isMatch = await bcrypt.compare(password, account.password)
            if(!isMatch){
                res.status(401).send({
                    message:'Password mismatch'
                })
            }
            else{
                let payload = {
                    email:email
                }
              const token =  jwt.sign(payload, process.env.JWT_SECRETKEY as string, { expiresIn: 3000})
              res.status(200).send({
                message:'authenticated',
                tokne: token
              })
            }
        }
        else{
            res.status(417).send({
                message: "No password" 
            })
        }
    }
    catch(error){
        res.status(417).send(error)
    }
})

export default AccountRouter;