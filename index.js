const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vn7mckq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const database = client.db("doctors_portal").collection("services");
    const bookingsDetails = client.db("doctors_portal").collection("bookings");
    const userCollection = client.db("doctors_portal").collection("users");

    function verifyJWT(req, res, next) {
      // authHeader read
      const authHeader = req.headers.authorization;
      //verification through authHeader
      if (!authHeader) {
        return res
          .status(401)
          .send({ message: "You dont have permission to access this" });
      }
      // token splitting
      const token = authHeader.split(" ")[1];
      // decoded carries the info of requested user in which token will verify
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        {
          err
            ? res.status(403).send({ message: "Invalid Token" })
            : (req.decoded = decoded);
          next();
        }
      });
    }

    app.get("/services", async (req, res) => {
      const services = await database.find().toArray();
      res.send(services);
    });

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };

      const user = await userCollection.findOne(filter);
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    app.get("/users", verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    //Make An User To Admin
    app.put("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      // user filter
      const requester = req.decoded.email;

      //user finding among all users
      const role_requester = await userCollection.findOne({ email: requester });

      //user role check
      if (role_requester.role === "admin") {
        const filter = { email: email };
        const updatedRole = {
          $set: { role: "admin" },
        };
        const update = await userCollection.updateOne(filter, updatedRole);
        res.send(update);
      } else {
        res.status(403).send({ message: "Permission Forbidden" });
      }
    });

    app.get("/bookings", verifyJWT, async (req, res) => {
      const email = req.query.email;
      console.log("decoded info", req.decoded);
      if (req.decoded.email === email) {
        const query = { email: email };
        const bookings = await bookingsDetails.find(query).toArray();
        res.send(bookings);
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const userUpdated = {
        $set: user,
      };
      const update = await userCollection.updateOne(
        filter,
        userUpdated,
        options
      );
      res.send({ update, accessToken: token });
    });

    app.get("/available", async (req, res) => {
      //Not proper method -for better understanding watch 74-5
      // Get ALL Services
      const allServices = await database.find().toArray();

      // Get Services based on Query
      const date = req.query.date;
      const query = { date: date };
      const queryServices = await bookingsDetails.find(query).toArray();

      //Filtering Services
      allServices.forEach((service) => {
        const filteredServices = queryServices.filter(
          (queryService) => queryService.serviceName === service.name
        );
        const booked = filteredServices.map((service) => service.slot);
        // service.booked = booked;

        const available = service.slot.filter((s) => !booked.includes(s));
        service.slot = available;
      });
      res.send(allServices);
    });

    // //Getting Available Services after query
    // app.get('/availableServices', async (req, res) => {
    //     //1. Get all Services
    //     const date = req.query.date || 'January 3rd, 2023';
    //     const available = await database.find().toArray();

    //     //2. getting specific day's booking
    //     const query = { date };
    //     const filteredServices = await bookingsDetails.find(query).toArray();
    //     // res.send(available);
    //     // res.send(filteredServices);

    //     available.forEach(a => {
    //         const res = filteredServices.filter(fs => fs.serviceName === a.name);

    //     })
    //     res.send(available);
    // })

    // posting booking data
    app.post("/bookings", async (req, res) => {
      const bookingData = req.body;
      console.log(bookingData);
      const query = {
        serviceName: bookingData.serviceName,
        date: bookingData.date,
        name: bookingData.name,
        // slot: bookingData.slot
      };
      const exists = await bookingsDetails.findOne(query);
      if (exists) {
        return res.send({ success: false, booking: exists });
      } else {
        const result = await bookingsDetails.insertOne(bookingData);
        res.send({ success: true, result });
        console.log(
          `A document was inserted with the _id: ${result.insertedId}`
        );
      }
    });
    await client.connect();
    // client.connect();
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send(`<h1>সব ঠিক ঠাক</h1>`);
});

app.listen(port, () => {
  console.log("Working Fine on", port);
});
