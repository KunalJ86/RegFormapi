const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const path = require("path");
const app = express();
const router = express.Router();

app.use(bodyParser.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "kunal",
  database: "api",
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname + "\\register.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname + "\\login.html"));
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  const { firstName, lastName, username, email, password, age, bio } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const connection = await pool.getConnection();

    const [rows, fields] = await connection.execute(
      "INSERT INTO users (firstName, lastName, username, email, password, age, bio) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [firstName, lastName, username, email, hashedPassword, age, bio]
    );

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
    });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const connection = await pool.getConnection();

    const [rows, fields] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    } else {
      const result = await bcrypt.compare(password, rows[0].password);

      if (result) {
        res.json({ success: true, message: "Login Successful!" });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred while logging in" });
  }
});
app.get("/users", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rows, fields] = await connection.execute("SELECT * FROM users");

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving users",
    });
  }
});
app.put("/users/:id", async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, username, email, password, age, bio } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const connection = await pool.getConnection();

    const [rows, fields] = await connection.execute(
      "UPDATE users SET firstName=?, lastName=?, username=?, email=?, password=?, age=?, bio=? WHERE id=?",
      [firstName, lastName, username, email, hashedPassword, age, bio, userId]
    );

    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating user",
    });
  }
});

app.use("/api", router);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
