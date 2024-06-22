const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 2222;

app.use(express.json());

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "stranger2copy@gmail.com", //Gmail Address
    pass: "axlt cryx qopc nzds", //Password of gmail (Genrated app password)
  },
});

app.get("/send-mail", (req, res) => {
  const mailOptions = {
    from: '"Yash Baranwal" <stranger2copy@gmail.com>',
    to: "",// Enter mail here
    subject: "Yash Baranwal",
    text: "If you receive all the 3 mail then reply me for confermation",
  };

  transport.sendMail(mailOptions, (err, info) => {
    if (err) {
      res.json(500).send(err.toString());
    } else {
      res.status(200).send("Email sent: " + info.response);
    }
  });
});

app.listen(PORT, () => {
  console.log("Connection Build");
});
