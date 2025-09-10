import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Authenticator from "../authenticator";
import { generateInvoice } from "../business/pdfgenerator";

console.log("ROUTER");
const PaymentRouter = Router();

PaymentRouter.get("/test", async (req, res) => {
  res.status(200).send("test");
});

PaymentRouter.get("/subscription/plans", Authenticator, async (req, res) => {
  try {
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_APIKEY,
      key_secret: process.env.RAZORPAY_SECRETKEY,
    });
    let plans = await instance.plans.all();
    res.status(200).send(plans);
  } catch (error) {
    res.status(417).send(error);
  }
});

PaymentRouter.post("/subscription/plan", async (req, res) => {
  try {
    let planId = req.body.plan_id;
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_APIKEY,
      key_secret: process.env.RAZORPAY_SECRETKEY,
    });

    let createdSubscription = await instance.subscriptions.create({
      plan_id: planId,
      customer_notify: true,
      quantity: 1,
      total_count: 12,
      notes: {
        key1: "value3",
        key2: "value2",
      },
    });
    res.status(200).send(createdSubscription);
  } catch (error) {
    res.status(417).send(error);
  }
});

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
    let paymentId = req.body.payment_id;
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_APIKEY,
      key_secret: process.env.RAZORPAY_SECRETKEY,
    });

    const invoices = await instance.invoices.all({ payment_id: paymentId });
    let fetchedInvoice = invoices.items[0];
    if (fetchedInvoice.status === "draft") {
      let response = await instance.invoices.issue(fetchedInvoice.id);
      console.log(response);
    }
    const invoice = await instance.invoices.fetch(fetchedInvoice.id);
    const downloadUrl = (invoice as any).short_url; // Direct link to PDF

    res.status(200).json({
      msg: "Invoice fetched",
      downloadUrl,
    });
  } catch (error) {
    res.status(417).send(error);
  }
});

PaymentRouter.post("/subscribe", async (req: any, res: any) => {
  try {
    // const { planId } = req.body;

    // // Fetch plan from DB
    // const plan = await Plan.findById(planId);
    // if (!plan) return res.status(404).json({ error: "Plan not found" });

    // Create Razorpay order
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_APIKEY,
      key_secret: process.env.RAZORPAY_SECRETKEY,
    });

    const order = await instance.orders.create({
      amount: 365 * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: 365,
      currency: "INR",
      key: "rzp_test_bgPgFmaTxfVHO3", // send to frontend
      planId: "Basic",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});


PaymentRouter.post("/verify", async (req:any, res:any) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, userId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRETKEY as string)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Fetch plan details
    //   const plan = await Plan.findById(planId);

    //   // Save payment history
    //   const payment = await Payment.create({
    //     userId,
    //     razorpayOrderId: razorpay_order_id,
    //     razorpayPaymentId: razorpay_payment_id,
    //     amount: plan.price,
    //     currency: "INR",
    //   });

      // Save subscription (activate for 1 year)
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

    //   await UserSubscription.create({
    //     userId,
    //     planId: plan._id,
    //     startDate,
    //     endDate,
    //     status: "active",
    //     paymentId: payment._id,
    //   });

      res.json({ success: true, message: "Payment verified & subscription activated" });
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

PaymentRouter.get("/download/:subscriptionId", async (req:any, res:any) => {
  try {
    // const subscription = await UserSubscription.findById(req.params.subscriptionId);
    // if (!subscription) return res.status(404).send("Subscription not found");

    // const payment = await Payment.findById(subscription.paymentId);
    // const plan = await Plan.findById(subscription.planId);
    // const user = req.user; // assuming you have auth middleware
    let razorpayPaymentId = req.params.subscriptionId;
    const payment = {
        _id: razorpayPaymentId,
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: "orderid",
        amount: 365
    }
    const user= {
        name: "Gopi",
        email: "gopiranga9@gmail.com",
        phone: "9677618096"
    }
    const plan = {
        name: "Basic 1 Rs/day"
    }
      // Send PDF with proper headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${razorpayPaymentId}.pdf`
    );


    const filePath = generateInvoice(payment, user, plan);
    res.download(filePath); // download PDF
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate invoice");
  }
});
export default PaymentRouter;
