const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
// const Unicorn = require("./data");
const Unicorn = require("./models/Unicorn");

const app = express();
const PORT = 5004;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://lehoangduy:0901Lananh@cluster0.0aomf7p.mongodb.net/unicornsdb?retryWrites=true&w=majority"
  )
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection error:", err));

app.get("/home", (req, res) => {
  res.send("Successfully connected");
});

app.get("/api/unicorn", async (req, res) => {
  try {
    const {
      name,
      loves,
      weightGreaterThan,
      vampiresGreaterThan,
      gender,
      vaccinated,
      vampiresExists,
    } = req.query;

    const query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (loves) {
      query.loves = { $in: [new RegExp(loves, "i")] };
    }

    if (weightGreaterThan) {
      query.weight = { $gt: parseFloat(weightGreaterThan) };
    }

    if (vampiresGreaterThan) {
      query.vampires = { $gt: parseInt(vampiresGreaterThan) };
    }

    if (gender) {
      query.gender = gender.toLowerCase()[0]; // "male" -> "m"
    }

    if (vaccinated !== undefined) {
      query.vaccinated = vaccinated === "true" ? { $exists: true } : { $exists: false };
    }

    if (vampiresExists !== undefined) {
      // query.vampires = vampiresExists === "true" ? { $exists: true } : { $exists: false };
      query.vampires = vampiresExists === "true" ? { $gt: 0 } : { $eq: 0 };
    }
    // console.log(query.vampires);
    // console.log(query.loves);

    const unicorns = await Unicorn.find(query);
    res.json(unicorns);
    // console.log(unicorns);
    // if (unicorns.length === 0)
    // {
    //   console.log(unicorns.length);
    //   res.status(404).json({message: "Unicorn not found"});
    //   res.status(404).send('Unicorn not found');
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch unicorns" });
  }
});

app.post("/api/unicorn", async (req, res) => {
  try {
    const { name, loves, weight, vampires, gender, vaccinated, year, month, day, hour, minute } = req.body;

    // console.log(name);
    // console.log(loves);
    // console.log(weight);
    // console.log(vampires);
    // console.log(gender);
    if (!name || !loves || !weight || !vampires || !gender || !year || !month || !day || !hour || !minute) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    

    const query = {};
    query.name = { $regex: name, $options: "i" };
    const unicorn = await Unicorn.find(query);
    // console.log(unicorn);
    if (unicorn.length > 0) return res.status(400).json({ message: "Cannot create same name." });

    const newUnicorn = new Unicorn({
      name,
      loves: loves.split(",").map((item) => item.trim()),
      weight: parseFloat(weight),
      vampires: parseInt(vampires),
      gender: gender.toLowerCase()[0],
      vaccinated: Boolean(vaccinated),
      dob: new Date(year, (month - 1), day, hour, minute),
    });

    await newUnicorn.save();
    res
      .status(201)
      .json({ message: "Unicorn added successfully", unicorn: newUnicorn });
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ message: "Server error occurred." });
  }
});

app.put('/api/unicorn/:name', async (req, res) => {
  const { name } = req.params;
  const { loves, weight, gender, vampires, dob } = req.body;

  console.log(req);
  try {
    const updatedUnicorn = await Unicorn.findOneAndUpdate(
      { name },
      { $set: { loves:loves.split(",").map((item) => item.trim()), weight, gender, vampires, dob } },
      { new: true }
    );
    console.log(updatedUnicorn);
    if (!updatedUnicorn) {
      return res.status(404).send('Unicorn not found');
    }

    res.status(200).json(updatedUnicorn);
  } catch (error) {
    res.status(500).send('Error updating unicorn');
  }
});


app.delete('/api/unicorn/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const deletedUnicorn = await Unicorn.findOneAndDelete({ name });

    if (!deletedUnicorn) {
      return res.status(404).send('Unicorn not found');
    }

    res.status(200).json(deletedUnicorn);
  } catch (error) {
    res.status(500).send('Error deleting unicorn');
  }
});

app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
