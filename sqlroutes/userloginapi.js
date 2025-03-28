const express = require("express"); // Import your Mongoose model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../mailer");
const cors = require("../middleware/cors");
const db = require("../sqlconnection");
const router = express.Router();
const logger = require("../logger");
const auth = require("../middleware/auth");
const ggpKey = process.env.GGP_SECRET_KEY;
const apiKeyMiddleware = require("../middleware/apikeymiddleware");

router.post("/signup", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    // Ensure that name, email, and password are provided
    if (!name || !email || !password) {
      return res
        .status(200)
        .json({ error: "Name, email, and password are required" });
    }

    const getQuery = "SELECT * FROM UserLogins where email = ?";
    db.execute(getQuery, [email], (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res
          .status(200)
          .json({ error: "Something Went Wrong ! Please try after some time" });
      }
      if (results.length > 0) {
        return res.status(200).json({ error: "User Already Registred" });
      }
    });
    const signupdate = new Date(); // Current timestamp

    // Insert the data into the UserLogins table

    const query =
      "INSERT INTO UserLogins (name, email, password, signupdate) VALUES (?, ?, ?, ?)";
    db.execute(
      query,
      [name, email, password, signupdate],
      async (err, result) => {
        if (err) {
          await logger("Error inserting data:" + err + "Time:-" + signupdate);
          return res.status(200).json({
            error: "Something Went Wrong ! Please try after some time",
          });
        } else {
          const updateQuery =
            "UPDATE UserLogins SET auth_token = 1 WHERE id = ?";
          const id = result.insertId;
          const payload = { user: { id: id } };
          jwt.sign(
            payload,
            ggpKey, // Replace with your secret key
            { expiresIn: "10h" },
            (err, token) => {
              if (err) throw err;
              db.execute(updateQuery, [id], async (error, result) => {
                if (error) {
                  res.status(200).json({ msg: "Error in creating token" });
                } else {
                  await sendEmail(email, "Welcome To HelpKey !", name, token);
                  await logger(
                    `\n New User has been registered with mail:- ${email} , Time:-${signupdate}`
                  );
                }
              });
              res.json({
                msg: "User registred successfully",
              });
            }
          );
        }
      }
    );
  } catch (err) {
    console.error(err.message);
    res
      .status(200)
      .json({ msg: "Something Went Wrong ! Please try after some time" });
  }
});

router.get("/users", async (req, res) => {
  const query = "SELECT * FROM UserLogins";
  db.execute(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    } else {
      res.json({ Users: results });
    }
  });
});

router.post("/login", cors, async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user exists
    const query = "SELECT id,password,isActive FROM UserLogins where email = ?";
    db.execute(query, [email], async (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(200).json({
          error: "Something Went Wrong ! Please try after some time",
          isAuthenticated: false,
        });
      }

      if (results.length == 0) {
        return res.status(200).json({
          msg: "No account found with this email",
          isAuthenticated: false,
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, results[0]?.password);
      if (!isMatch) {
        return res
          .status(200)
          .json({ error: "Invalid Credentials", isAuthenticated: false });
      }

      if (results[0].isActive == 0) {
        return res.status(200).json({
          error: "Please activate your account",
          isAuthenticated: false,
        });
      }

      //Create JWT token
      const payload = { user: { id: results[0]?.id } };
      jwt.sign(
        payload,
        ggpKey, // Replace with your secret key
        { expiresIn: "10h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token, isAuthenticated: true });
        }
      );
    });
  } catch (err) {
    console.error(err.message);
    res.status(200).json({
      msg: "Something Went Wrong ! Please try after some time",
      isAuthenticated: false,
    });
  }
});

router.post("/userdata", auth, (req, res) => {
  const userID = req?.userInfo?.user?.id;
  // console.log(userID)

  const newQuery = "SELECT * FROM UserData WHERE userId = ?";
  db.execute(newQuery, [userID], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ msg: "Database Error" });
    }

    if (result.length > 0) {
      const updates = req.body;

      const fields = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");

      const values = Object.values(updates);

      const sql = `
        UPDATE UserData
        SET ${fields}
        WHERE userId = ?
      `;

      db.query(sql, [...values, userID], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to update data" });
        }

        if (result.affectedRows > 0) {
          return res.status(200).json({ message: "Data updated successfully" });
        } else {
          return res.status(500).json({ message: "Data Not updated" });
        }
      });
    } else {
      const {
        gender,
        dob,
        height,
        weight,
        medical,
        goal,
        bodyfat,
        workout,
        food,
        occupation,
        onboarded,
        targetWeight,
      } = req.body;

      const sql = `
        INSERT INTO UserData (userId, gender, dob, height, weight, medical, goal, bodyfat, workout, food, occupation, onboarded,targetWeight)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true,?)
      `;

      db.query(
        sql,
        [
          userID,
          gender,
          dob,
          height,
          weight,
          medical,
          goal,
          bodyfat,
          workout,
          food,
          occupation,
          onboarded,
          targetWeight,
        ],
        (err, result) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ error: "Failed to insert data" + err });
          }

          if (result.affectedRows > 0) {
            return res
              .status(201)
              .json({ message: "Data inserted successfully" });
          } else {
            return res.status(500).json({ message: "Data not inserted" });
          }
        }
      );
    }
  });
});

router.post("/verifyuser", apiKeyMiddleware, (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const decoded = jwt.verify(token, ggpKey);
    const id = decoded?.user?.id;

    if (!id) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const query = "SELECT auth_token, isActive FROM UserLogins WHERE id = ?";
    db.execute(query, [id], (error, result) => {
      if (error) {
        console.error("Database error:", error);
        return res
          .status(200)
          .json({ title: "Sorry", message: "Something Went Wrong" });
      }

      if (result.length === 0) {
        return res.status(200).json({ title: "", message: "User not found" });
      }
      const newCon = "temp";
      const { auth_token, isActive } = result[0];

      if (isActive === 1) {
        return res.status(200).json({
          title: "Thank You!",
          message: "Your Account is already activated",
        });
      }

      if (auth_token !== token) {
        return res.status(200).json({ title: "", message: "Invalid token" });
      }

      const updateQuery = "UPDATE UserLogins SET isActive = 1 WHERE id = ?";
      db.execute(updateQuery, [id], (updateError) => {
        if (updateError) {
          console.error("Update error:", updateError);
          return res.status(200).json({
            title: "Sorry",
            message: "Failed to activate account. Please try again later.",
          });
        }

        res.status(200).json({
          title: "Thank You!",
          message: "Your account has been activated",
        });
      });
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(200).json({
      title: "Sorry",
      message: "Token expired or invalid. Please regenerate your token.",
    });
  }
});

router.get("/version", cors, async (req, res) => {
  try {
    res.status(200).json({ version: "1.0.0" }); // Send saved sale as a response
  } catch (err) {
    res.status(500).json({ message: "Error fecthing version" });
  }
});

router.post("/authuser", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, ggpKey);
    console.log(decoded?.user?.id);
    if (decoded?.user?.id > 0) {
      res.status(200).json({ isAuthenticated: true });
    } else {
      res.status(200).json({ isAuthenticated: false });
    }
  } catch (error) {
    res.status(200).json({ isAuthenticated: false });
  }
});

// Route for Fetching nearby vendors
router.post("/nearby-vendors", async (req, res) => {
  const { latitude, longitude, propertyType, city } = req.body;
  console.log(latitude, longitude, propertyType, city);
  if (city) {
    try {
      const vendorQuery = `
    SELECT * FROM vendorservice 
    WHERE address LIKE ? AND category = ?`;

      db.execute(
        vendorQuery,
        [`%${city}%`, propertyType],
        (vendorErr, vendorResult) => {
          if (vendorErr) {
            console.error("Error fetching vendors:", vendorErr);
            return res.status(500).json({ error: "Database error" });
          }

          if (vendorResult.length === 0) {
            return res
              .status(404)
              .json({ message: "No vendors found for this city" });
          }

          res.status(200).json({ vendors: vendorResult });
        }
      );
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    try {
      if (!latitude || !longitude) {
        console.error("Error fetching location");
        return res.status(500).json({ error: "Internal server error" });
      }

      // Default Radius for fetching vendors
      const radius = 10; // 5km

      const your_lat = latitude;
      const your_lon = longitude;

      const vendorQuery = `SELECT *,
    (6371 * ACOS(
        COS(RADIANS(${your_lat})) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(${your_lon})) +
        SIN(RADIANS(${your_lat})) * SIN(RADIANS(latitude))
    )) AS distance
FROM vendorservice WHERE category = ${propertyType}
HAVING distance <= ${radius}
ORDER BY distance;`;

      db.execute(
        vendorQuery,
        [latitude, longitude, latitude, radius],
        (vendorErr, vendorResult) => {
          if (vendorErr) {
            console.error("Error fetching vendors:", vendorErr);
            return res.status(500).json({ error: "Database error" });
          }

          res.status(200).json({ vendors: vendorResult });
        }
      );
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Route for search by city
router.get("/vendor-by-id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "City parameter is required" });
    }

    const vendorQuery = `
      SELECT * FROM vendorservice 
      WHERE id = ?`;

    db.execute(vendorQuery, [id], (vendorErr, vendorResult) => {
      if (vendorErr) {
        console.error("Error fetching vendors:", vendorErr);
        return res.status(500).json({ error: "Database error" });
      }

      if (vendorResult.length === 0) {
        return res
          .status(404)
          .json({ message: "No vendors found for this city" });
      }

      res.status(200).json({ vendors: vendorResult });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
