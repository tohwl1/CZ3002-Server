const router = require("express").Router();
const pool = require("../db");
const cors = require("cors");
const authorize = require("../middleware/authorization");

//get list of doctors
router.get("/listofdoctors", async (req, res) => {
  try {
    nameList = [];
    const listOfAccessors = await pool.query(
      "SELECT * FROM users WHERE is_accessor = $1",
      [true]
    );

    for (i = 0; i < listOfAccessors.rowCount; i++) {
      name = listOfAccessors.rows[i].user_name;

      nameList[i] = name;
    }
    res.json(nameList);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//get list of patients for doctor
router.get("/listofpatients", authorize, async (req, res) => {
  try {
    /*const accessor_rights = await pool.query(
      "SELECT users.is_accessor FROM users WHERE user_id = $1",
      [user_id]
    );*/

    patientList = [];

    const listOfPatients = await pool.query(
      "SELECT * FROM users WHERE accessor = $1",
      [req.user]
    );

    for (i = 0; i < listOfPatients.rowCount; i++) {
      name = listOfPatients.rows[i].user_name;

      patientList[i] = name;
    }
    res.json(patientList);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*app.get("/id", async (req, res) => {
    try {
      const { user_email } = req.body;
  
      const id = await pool.query("SELECT * FROM users WHERE user_email = $1", [
        user_email,
      ]);
  
      res.json(id.rows[0].user_id);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });*/

//create an attempt
router.post("/userattempts", authorize, async (req, res) => {
  try {
    const { user_id, time_taken, accuracy, difficulty, pass_fail } = req.body;
    var dateNow = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Singapore",
    });
    const newAttempt = await pool.query(
      "INSERT INTO attempts (user_id, attempted_on, time_taken, accuracy, difficulty, pass_fail) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [user_id, dateNow, time_taken, accuracy, difficulty, pass_fail]
    );
    res.json("Attempt successfully added!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//view all previous attempt for user
router.get("/userattempts/:user_to_check", authorize, async (req, res) => {
  try {
    if (req.user != req.params.user_to_check) {
      res.json("You are not authorized to view this!");
    } else {
      const allUserAttempts = await pool.query(
        "SELECT a.attempt_no,a.attempted_on,a.time_taken,a.accuracy,a.difficulty,a.pass_fail FROM attempts a INNER JOIN users u ON u.user_id = a.user_id  WHERE u.user_id =$1",
        [req.user]
      );
      res.json(allUserAttempts.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//for doctor to see all patient attemps
router.get("/patientattempts/:patient_id", authorize, async (req, res) => {
  try {
    const accessor_rights = await pool.query(
      "SELECT users.is_accessor FROM users WHERE user_id = $1",
      [req.user]
    );

    if (!accessor_rights.rows[0].is_accessor) {
      res.json("You are not a real doctor!");
    } else {
      const allUserAttempts = await pool.query(
        "SELECT a.attempt_no,a.attempted_on,a.time_taken,a.accuracy,a.difficulty,a.pass_fail FROM attempts a INNER JOIN users u ON u.user_id = a.user_id  WHERE u.user_id =$1 AND u.accessor = $2",
        [req.params.patient_id, req.user]
      );
      res.json(allUserAttempts.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/attemptnumber/:user_id", authorize, async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const accessor_id = req.user;
    const allUserAttempts = await pool.query(
      "SELECT count(a.attempt_no) FROM attempts a INNER JOIN users u ON u.user_id = a.user_id  WHERE u.user_id =$1 AND u.accessor = $2",
      [user_id, accessor_id]
    );
    res.json(allUserAttempts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
