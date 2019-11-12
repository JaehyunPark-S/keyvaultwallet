let express = require('express');
let router = express.Router();

let jwt = require("jsonwebtoken");
let secretObj = require("../config/jwt");


router.get("/login", function (req, res, next) {
  let { id, passwd } = req.query;

  if (id === 'admin' && passwd === '1234') {

    let token = jwt.sign({
      id: "admin",
      nickname: "jaehyun"
    },
      secretObj.secret,    // 비밀 키
      {
        expiresIn: '99999y'    // 유효 시간은 5분
      })


    res.cookie("user", token);
    res.json({
      token: token
    })
  } else {
    res.status(401).json({
      error: 'unmatch user'
    })
  }
})


router.get("/someAPI", function (req, res, next) {
  let token = req.cookies.user;

  let decoded = jwt.verify(token, secretObj.secret);
  if (decoded) {
    res.send("권한이 있어서 API 수행 가능")
  }
  else {
    res.send("권한이 없습니다.")
  }
})



module.exports = router;