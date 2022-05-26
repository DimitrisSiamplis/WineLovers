const express = require("express");
const cookieParser = require("cookie-parser");
var session = require("express-session");
var nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("../model/user");
const Wine = require("../model/wine");
const Comment = require("../model/comment");
const Card = require("../model/card");
const History = require("../model/history");
const Static = require("../model/static");
const BlogQuestion = require("../model/blogQuestion");
const AplyQuestion = require("../model/aplyQuestion");

mongoose.connect(
  "mongodb+srv://dimitris:Cd2iV6XWeteaoE8r@cluster0.yfueb.mongodb.net/dimitris?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
);

// -------------------------- REGISTER FUNCTION ------------------------------------------

exports.register = async (req, res) => {
  let user = await User.findOne({ Email: req.body.email });
  if (user) {
    return res.render("index", { message: "This email is already used" });
  } else if (req.body.password !== req.body.confirnm_password) {
    return res.render("index", { message: "Passwords do not mached" });
  } else {
    user = new User({
      Name: req.body.name,
      Email: req.body.email,
      Password: req.body.password,
      Birthday: req.body.birthday,
      Gender: req.body.gender,
      Mobile: req.body.mobile,
      Address: req.body.address,
    });

    await user.save();
    res.render("index", { message: "User registered Succesfully" });
  }
};

// ------------------------------- LOGIN FUNCTION --------------------------------

exports.login = async (req, res) => {
  let user = await User.findOne({ Email: req.body.email });
  if (!user) {
    return res.render("index", { message: "Incorrect email or password." });
  }

  if (req.body.password !== user.Password) {
    return res.render("index", { message: "Incorrect email or password." });
  }

  //-----------SESSION-----------------
  var sess;
  sess = req.session;
  sess.email = req.body.email;

  //-----------END  SESSION---------------

  res.redirect("/home");
};

// ------------------------------- ADD WINE FUNCTION --------------------------------

exports.addWine = async (req, res) => {
  wine = new Wine({
    WineName: req.body.winename,
    Type: req.body.type,
    Color: req.body.color,
    Winery: req.body.winery,
    Country: req.body.country,
    Location: req.body.location,
    Price: req.body.price,
    Year: req.body.year,
    ImageUrl: req.body.url,
    WineDescription: req.body.discription,
    Grapes: req.body.grapes,
  });

  await wine.save();
  res.render("addWine", { message: "Wine Added Succesfully" });
};

// ------------------------------- ADD COMMENT FUNCTION --------------------------------

exports.addComment = async (req, res) => {
  const date = new Date();

  comment = new Comment({
    WineId: req.body.wineId,
    UserId: req.body.userId,
    Comment: req.body.comment,
    Rating: req.body.rate,
    CommentDate: date,
  });

  await comment.save();
  res.redirect(`/wines/info/${req.body.wineId}`);
};

// ------------------------------- ADD TO CARD FUNCTION --------------------------------

exports.addToCard = async (req, res) => {
  var sess;
  sess = req.session;
  let user = await User.findOne({ Email: sess.email });
  let iscard = await Card.findOne({
    WineId: req.body.wineId,
    UserId: user._id,
    IsCompleted: false,
  });

  if (iscard) {
    console.log("There is already");
  } else {
    const date = new Date();

    card = new Card({
      WineId: req.body.wineId,
      UserId: user._id,
      IsCompleted: false,
      CardDate: date,
      Amount: req.body.amount,
    });
    await card.save();
  }

  res.redirect("/cart");
};

// ------------------------------- DELETE FROM CARD FUNCTION --------------------------------

exports.deleteFromCard = async (req, res) => {
  var sess;
  sess = req.session;
  let user = await User.findOne({ Email: sess.email });

  Card.deleteOne({ WineId: req.body.wineId, UserId: user._id })
    .then(function () {
      // Success
      res.redirect("/cart");
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
};

// ------------------------------- ADD TO HISTORY FUNCTION --------------------------------

exports.addtoHistory = async (req, res) => {
  var sess;
  sess = req.session;
  let user = await User.findOne({ Email: sess.email });

  const date = new Date();
  let wines = await Card.find({ UserId: user._id, IsCompleted: false });
  let wineList = [];
  for (const key in wines) {
    wineList.push(wines[key].WineId);
  }

  if (wines) {
    history = new History({
      WinesList: wineList,
      UserId: user._id,
      Date: date,
      Price: req.body.totalPrice,
    });
    await history.save();

    await Card.updateMany(
      { WineId: wineList },
      { $set: { IsCompleted: true } }
    );
  }

  res.redirect("/history");
};

// ------------------------------- CHANGE PASSWORD FUNCTION --------------------------------

exports.changePassword = async (req, res) => {
  console.log(req.body);

  let user = await User.findOne({ Email: req.body.email });
  let password = Math.floor(Math.random() * 10000) + 1000000;

  if (user) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "wineloverswebsite@gmail.com",
        pass: "WineLovers123456",
      },
    });

    var mailOptions = {
      from: "wineloverswebsite@gmail.com",
      to: req.body.email,
      subject: "Password Update",
      text: `The new password is ${password} `,
    };

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);

        await User.updateOne(
          { Email: req.body.email },
          { $set: { Password: password } }
        );
      }
    });

    res.render("index", { message: "Password change succesfully" });
  } else {
    res.render("forgotPassword", { message: "Email is Invalid.Try again." });
  }
};

// ------------------------------- CHANGE USER PASSWORD FUNCTION --------------------------------

exports.changeUserPassword = async (req, res) => {
  console.log(req.body);

  let user = await User.findOne({
    Email: req.body.email,
    Password: req.body.oldPassword,
  });

  if (user) {
    if (req.body.newPassword == req.body.ConfirmNewPassword) {
      await User.updateOne(
        { Email: req.body.email },
        { $set: { Password: req.body.newPassword } }
      );

      res.render("index", { message: "Password change succesfully" });
    } else {
      res.render("changePassword", { message: "Passwords do not mutch" });
    }
  } else {
    res.render("changePassword", { message: "Email is Invalid.Try again." });
  }
};

// ------------------------------- EDIT USER DETAILS FUNCTION --------------------------------

exports.editProfile = async (req, res) => {
  var sess;
  sess = req.session;
  if (sess.email) {
    await User.updateOne(
      { Email: sess.email },
      {
        $set: {
          Name: req.body.newName,
          Mobile: req.body.newMobile,
          Address: req.body.newAddress,
        },
      }
    );

    res.redirect(`/profile/${req.body.userId}`);
  } else {
    res.render("index");
  }
};

// ------------------------------- WINE SEARCH FUNCTION --------------------------------

exports.winesearch = async (req, res) => {
  var sess;
  sess = req.session;
  if (sess.email) {
    var kindDropdown = [];
    var colorDropdown = [];

    var winesDropdown = await Wine.find();

    for (const key in winesDropdown) {
      kindDropdown.push(winesDropdown[key].Type);
      colorDropdown.push(winesDropdown[key].Color);
    }

    kindDropdown = [...new Set(kindDropdown)];
    colorDropdown = [...new Set(colorDropdown)];

    if (req.body.winename) {
      var wines = await Wine.find({
        WineName: new RegExp(req.body.winename.trim()),
      });
    } else if (req.body.winegrape) {
      var wines = await Wine.find({
        Grapes: new RegExp(req.body.winegrape.trim()),
      });
    } else if (req.body.winery) {
      var wines = await Wine.find({
        Winery: new RegExp(req.body.winery.trim()),
      });
    } else if (req.body.location) {
      console.log("location");
      var wines = await Wine.find({
        Location: new RegExp(req.body.location.trim()),
      });
    } else if (req.body.winekind) {
      console.log("winekind");
      var wines = await Wine.find({ Type: new RegExp(req.body.winekind) });
    } else if (req.body.winecolor) {
      console.log("winecolor");
      var wines = await Wine.find({ Color: new RegExp(req.body.winecolor) });
    } else if (req.body.maxprice) {
      console.log("maxprice", req.body.maxprice);

      var wines = [];

      for (const key in winesDropdown) {
        if (winesDropdown[key].Price < Number(req.body.maxprice)) {
          console.log("Lower");
          wines.push(winesDropdown[key]);
        }
      }
    } else {
      var wines = [];
    }

    if (wines.length === 0) {
      var message = "There Not Wine for this Searct. Try again! ";
    } else {
      var message = undefined;
    }

    res.render(`wineAfterSeartch`, {
      wines: wines,
      kindDropdown: kindDropdown,
      colorDropdown: colorDropdown,
      message: message,
    });
  } else {
    res.render("index");
  }
};

// ------------------------------- WINE ADD STATISTIC FUNCTION --------------------------------

exports.addStatistic = async (req, res) => {
  //console.log(req.body);

  static = new Static({
    Sex: req.body.sex,
    Age: req.body.age,
    Location: req.body.location,
    Consumption: req.body.consumption,
    Price: req.body.price,
    Kind: req.body.kind,
    Color: req.body.color,
    OldWine: req.body.oldWine,
    Country: req.body.country,

    Christmas: req.body.christmas,
    Easter: req.body.easter,
    Valentine: req.body.valentine,
    Summer: req.body.summer,
    Winter: req.body.winter,

    WhiteMeat: req.body.whiteMeat,
    RedMeat: req.body.redMeat,
    Fish: req.body.fish,
    Vegetables: req.body.vegetables,
    Cheece: req.body.cheece,
    Pasta: req.body.pasta,
    Pizza: req.body.pizza,
  });

  console.log(static);

  await static.save();
  res.render("staticAfterStatistic");
};

// ------------------------------- WINE ADD BLOG QUESTION  --------------------------------

exports.blogAddQuestion = async (req, res) => {
  var sess;
  sess = req.session;
  //console.log(req.body);

  let user = await User.findOne({ Email: sess.email });
  startNameUser = user.Name.split(" ");
  startNameUserString = startNameUser[0][0] + startNameUser[1][0];

  let list1 = [];

  list1.push({
    Name: user.Name,
    Email: user.Email,
    Password: user.Password,
    Birthday: user.Birthday,
    Gender: user.Gender,
    Mobile: user.Mobile,
    Address: user.Address,
    StaringName: startNameUserString,
  });

  if (req.body.question.trim().length === 0) {
    message = "Provide a Question!";
    console.log("is empty");
    res.render("blog", { user: list1, message: message });
  } else {
    console.log(" NOT empty");

    blogQuestion = new BlogQuestion({
      Question: req.body.question.trim(),
      QuestionDate: new Date(),
      UserId: user._id,
      UserName: user.Name,
      UserEmail: user.Email,
    });

    console.log(blogQuestion);
    await blogQuestion.save();
    res.redirect("/blog");
  }
};

// ----------------- Add To questions---------------------
exports.aplyToQuestion = async (req, res) => {
  var sess;
  sess = req.session;
  console.log(req.body);

  let user = await User.findOne({ Email: sess.email });
  aplyQuestion = new AplyQuestion({
    QuestionId: req.body.questionId,
    Aply: req.body.aplieMessage,
    AplyDate: new Date(),
    AplierId: user._id,
    AplierName: user.Name,
    AplierEmail: user.Email,
  });
  await aplyQuestion.save();
  console.log(aplyQuestion);

  res.redirect(`/blogInfo/${req.body.questionId}`);
};

// ------------------ Delete a Aply -----------------------
exports.deleteAply = async (req, res) => {
  var sess;
  sess = req.session;

  if (sess.email) {
    let user = await User.findOne({ Email: sess.email });
    var blogQuestions = await BlogQuestion.find({
      UserId: user._id,
      _id: req.body.questionId,
    });

    if (blogQuestions.length !== 0) {
      if (user._id == blogQuestions[0].UserId) {
        console.log("DELETED!!");
        BlogQuestion.deleteOne({ _id: req.body.questionId })
          .then(function () {
            // Success
            // res.redirect("/blog");
          })
          .catch(function (error) {
            console.log(error); // Failure
          });
        AplyQuestion.deleteMany({ QuestionId: req.body.questionId })
          .then(function () {
            // Success
            // res.redirect("/blog");
          })
          .catch(function (error) {
            console.log(error); // Failure
          });
      } else {
        console.log("You cant delete");
      }
    } else {
      console.log("You cant delete");
    }

    res.redirect("/blog");
  }
};

// ----------------- Filter Questions ---------------------
exports.filterQuestions = async (req, res) => {
  var sess;
  sess = req.session;
  console.log(req.body);

  function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }

  function formatDate(date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join("-") +
      " " +
      [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
      ].join(":")
    );
  }

  if (sess.email) {
    let user = await User.findOne({ Email: sess.email });
    startNameUser = user.Name.split(" ");
    startNameUserString = startNameUser[0][0] + startNameUser[1][0];

    let list1 = [];
    list1.push({
      Name: user.Name,
      Email: user.Email,
      Password: user.Password,
      Birthday: user.Birthday,
      Gender: user.Gender,
      Mobile: user.Mobile,
      Address: user.Address,
      StaringName: startNameUserString,
      randomColor: Math.floor(Math.random() * 16777215).toString(16),
    });

    if (req.body.isMyFilter === "on" && req.body.filter) {
      var blogQuestions = await BlogQuestion.find({
        Question: new RegExp(req.body.filter),
        UserId: user._id,
      });
    } else if (req.body.isMyFilter === "on") {
      var blogQuestions = await BlogQuestion.find({ UserId: user._id });
    } else {
      var blogQuestions = await BlogQuestion.find({
        Question: new RegExp(req.body.filter),
      });
    }

    // console.log(blogQuestions)

    let list2 = [];
    let startingNames = [];

    for (const key in blogQuestions) {
      let aplies = await AplyQuestion.find({
        QuestionId: blogQuestions[key]._id,
      });

      startN = blogQuestions[key].UserName.split(" ");
      startNString = startN[0][0] + startN[1][0];

      if (user._id == blogQuestions[key].UserId) {
        var isActive = true;
      } else {
        var isActive = false;
      }

      list2.push({
        _id: blogQuestions[key]._id,
        Question: blogQuestions[key].Question,
        QuestionDate: formatDate(new Date(blogQuestions[key].QuestionDate)),
        UserId: blogQuestions[key].UserId,
        UserName: blogQuestions[key].UserName,
        UserEmail: blogQuestions[key].UserEmail,
        StartingNames: startNString,
        randomColor: Math.floor(Math.random() * 16777215).toString(16),
        number: aplies.length,
        isActive: isActive,
      });
    }

    // console.log(list2);
    res.render("blog", { user: list1, blogQuestions: list2 });
  } else {
    res.render("index");
  }
};
