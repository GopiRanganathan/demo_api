import { Router } from "express";
import crypto from "crypto"
import Razorpay from "razorpay";
import Authenticator from "../authenticator";

console.log("ROUTER")
const PaymentRouter = Router()

PaymentRouter.get('/test', async (req, res) => {
    res.status(200).send("test")
})

PaymentRouter.get('/subscription/plans', Authenticator, async (req, res) => {
    try {
        var instance = new Razorpay({ key_id: process.env.RAZORPAY_APIKEY, key_secret: process.env.RAZORPAY_SECRETKEY })
        let plans = await instance.plans.all()
        res.status(200).send(plans)
    }
    catch (error) {
        res.status(417).send(error)
    }
})

PaymentRouter.post('/subscription/plan', async (req, res) => {
    try {
        let planId = req.body.plan_id
        var instance = new Razorpay({ key_id: process.env.RAZORPAY_APIKEY, key_secret: process.env.RAZORPAY_SECRETKEY })

        let createdSubscription = await instance.subscriptions.create({
            plan_id: planId,
            customer_notify: true,
            quantity: 1,
            total_count: 1,
            notes: {
                key1: "value3",
                key2: "value2"
            }
        })
        res.status(200).send(createdSubscription)
    }
    catch (error) {
        res.status(417).send(error)
    }
})


PaymentRouter.post("/subscription/validate", (req: any, res: any) => {
    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } =
        req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRETKEY!);
    //order_id + "|" + razorpay_payment_id
    sha.update(`${razorpay_payment_id}|${razorpay_subscription_id}`);
    const digest = sha.digest("hex");
    if (digest !== razorpay_signature) {
        return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    res.status(200).send({
        msg: "success",
        orderId: razorpay_subscription_id,
        paymentId: razorpay_payment_id,
    });
});

PaymentRouter.post("/subscription/invoice", async (req: any, res: any) => {
    try {
        let paymentId = req.body.payment_id
        var instance = new Razorpay({ key_id: process.env.RAZORPAY_APIKEY, key_secret: process.env.RAZORPAY_SECRETKEY })

        const invoices = await instance.invoices.all({ payment_id: paymentId });
        let fetchedInvoice = invoices.items[0]
        if (fetchedInvoice.status === "draft") {
            let response = await instance.invoices.issue(fetchedInvoice.id);
            console.log(response)
        }
            const invoice = await instance.invoices.fetch(fetchedInvoice.id);
            const downloadUrl = (invoice as any).short_url; // Direct link to PDF

            res.status(200).json({
                msg: "Invoice fetched",
                downloadUrl,
            });
    }
    catch (error) {
        res.status(417).send(error)
    }
})

export default PaymentRouter 