const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validinfo");
const authorize = require("../middleware/authorization");

//register

router.post("/register", validInfo, async (req, res) => {
  const {
    user_id,
    user_name,
    user_email,
    user_password,
    is_accessor,
    accessor,
  } = req.body;

  try {
    //check if user exists
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);
    if (user.rows.length !== 0)
      return res.status(401).send("User already exists");
    //Bcrypt user password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(user_password, salt);
    //enter user to database
    const newUser = await pool.query(
      "INSERT INTO users (user_id,user_name,user_email,user_password,is_accessor,accessor) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *",
      [user_id, user_name, user_email, bcryptPassword, is_accessor, accessor]
    );
    //jwt token
    const token = jwtGenerator(newUser.rows[0].user_id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//login route
router.post("/login", validInfo, async (req, res) => {
  const { user_id, user_password } = req.body;

  try {
    //check if user exists
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Password or Email is incorrect");
    }
    //check if password is same as db
    const validPassword = await bcrypt.compare(
      user_password,
      user.rows[0].user_password
    );

    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }
    const token = jwtGenerator(user.rows[0].user_id);
    return res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/verify", authorize, (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
