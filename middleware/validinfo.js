module.exports = function (req, res, next) {
  const {
    user_id,
    user_name,
    user_email,
    user_password,
    is_accessor,
    accessor,
  } = req.body;

  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  if (req.path === "/register") {
    if (
      ![
        user_id,
        user_name,
        user_email,
        user_password,
        is_accessor,
        accessor,
      ].every(Boolean)
    ) {
      return res.status(401).json("Missing Credentials");
    } else if (!validEmail(user_email)) {
      return res.status(401).json("Invalid Email");
    }
  } else if (req.path === "/login") {
    if (![user_id, user_password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    }
  }

  next();
};
