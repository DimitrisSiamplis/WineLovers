const express = require("express");
const cookieParser = require("cookie-parser");
var session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("../model/user");
const Wine = require("../model/wine");
const Comment = require("../model/comment");
const Card = require("../model/card");
const History = require("../model/history");
const BlogQuestion = require("../model/blogQuestion");
const AplyQuestion = require("../model/aplyQuestion");
const { aggregate } = require("../model/user");

mongoose.connect(
  "mongodb+srv://dimitris:Cd2iV6XWeteaoE8r@cluster0.yfueb.mongodb.net/dimitris?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
);

const router = express.Router();

router.get("/", (req, res) => {
  var sess;
  sess = req.session;
  if (sess.email) {
    res.redirect("/home");
  } else {
    res.render("index");
  }
});

router.get("/home", async (req, res) => {
  var sess;
  sess = req.session;

  if (sess.email) {
    let user = await User.findOne({ Email: sess.email });

    res.render("home", { id: user._id });
  } else {
    res.redirect("/index");
  }
});

router.get("/logout", (req, res) => {
  var sess;
  sess = req.session;
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    return res.redirect("/");
  });
});

router.get("/profile/:id", async (req, res) => {
  var sess;
  sess = req.session;
  var id = req.params.id;

  if (sess.email) {
    let user = await User.findOne({ Email: sess.email });
    console.log(user);

    var isMale = true;
    if (user.Gender === "Female") {
      isMale = false;
    }

    let userDetails = {
      _id: user._id,
      Name: user.Name,
      Email: user.Email,
      Birthday: user.Birthday,
      Gender: user.Gender,
      Mobile: user.Mobile,
      Address: user.Address,
      isMale: isMale,
    };

    res.render("profile", { message: "Profile Details", results: userDetails });
  } else {
    res.redirect("/index");
  }
});

router.get("/wines", async (req, res) => {
  var sess;
  sess = req.session;
  // var id = req.params.id;

  if (sess.email) {
    // ----------- DropDown List of wine color and kind  -------------------
    var kindDropdown = [];
    var colorDropdown = [];

    var winesDropdown = await Wine.find();

    for (const key in winesDropdown) {
      kindDropdown.push(winesDropdown[key].Type);
      colorDropdown.push(winesDropdown[key].Color);
    }

    kindDropdown = [...new Set(kindDropdown)];
    colorDropdown = [...new Set(colorDropdown)];

    let wines = await Wine.find();
    let user = await User.findOne({ Email: sess.email });
    let comment = await Comment.aggregate([
      {
        $group: {
          _id: "$WineId",
          avg: { $avg: "$Rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    let paginationNumber = Math.floor(wines.length);
    let paginationList = [];

    let wineList = [];

    for (const key in wines) {
      if (comment.some((item) => item._id == wines[key]._id)) {
        const test = comment.filter((word) => word._id == wines[key]._id);
        const avg = test[0].avg;
        const count = test[0].count;

        wineList.push({
          wine: wines[key],
          avg: avg.toFixed(2),
          count: count,
        });
      } else {
        wineList.push({
          wine: wines[key],
        });
      }
    }

    let wine = [];
    console.log(wineList);

    res.render("wine1", {
      id: user._id,
      wine: wineList,
      paginationList: paginationList,

      kindDropdown: kindDropdown,
      colorDropdown: colorDropdown,
    });
  } else {
    res.redirect("/index");
  }
});

router.get("/addWine", async (req, res) => {
  var sess;
  sess = req.session;

  if (sess.email) {
    res.render("addWine");
  } else {
    res.redirect("/index");
  }
});

router.get("/wines/info/:id", async (req, res) => {
  var sess;
  sess = req.session;
  var id = req.params.id;

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
    let wine = await Wine.findOne({ _id: id });
    let user = await User.findOne({ Email: sess.email });

    let comment = await Comment.find({ WineId: id }).sort({ CommentDate: -1 });
    let useridList = [];
    for (const key in comment) {
      useridList.push(comment[key].UserId);
    }

    let userWithComment = await User.find({ _id: useridList });

    let commentList = [];
    let totalSumRating = 0;
    for (const key1 in comment) {
      totalSumRating = totalSumRating + comment[key1].Rating;
      for (const key2 in userWithComment) {
        if (comment[key1].UserId == userWithComment[key2]._id) {
          commentList.push({
            comment: comment[key1],
            user: userWithComment[key2],
          });
        }
      }
    }

    var avgRating = (Number(totalSumRating) / Number(comment.length)).toFixed(
      2
    );

    if (avgRating === NaN) {
      avgRating = undefined;
    }

    let commentListTest = [];
    for (const key in commentList) {
      commentListTest.push({
        user: commentList[key].user,
        comment: {
          _id: commentList[key].comment._id,
          WineId: commentList[key].comment.WineId,
          UserId: commentList[key].comment.UserId,
          Comment: commentList[key].comment.Comment,
          Rating: commentList[key].comment.Rating,
          CommentDate: formatDate(
            new Date(commentList[key].comment.CommentDate)
          ),
        },
      });
    }

    console.log(commentListTest);

    res.render("wineProfile", {
      wine: wine,
      user: user,
      commentList: commentListTest,
      totalComments: comment.length,
      avgRating: avgRating,
    });
  } else {
    res.redirect("/index");
  }
});

router.get("/cart", async (req, res) => {
  var sess;
  sess = req.session;

  if (sess.email) {
    let user = await User.findOne({ Email: sess.email });
    let card = await Card.find({ IsCompleted: false, UserId: user._id });
    let cardsid = [];
    let cards = [];
    for (const item in card) {
      cardsid.push(card[item].WineId);
    }

    let wine = await Wine.find({ _id: cardsid });

    for (const item in card) {
      cards.push({
        wine: wine[item],
        card: card[item],
      });
    }

    let total_price = 0;

    for (const item in wine) {
      total_price = total_price + wine[item].Price * card[item].Amount;
    }

    res.render("card", {
      message: "skdhfd",
      cards: cards,
      totalcard: card.length,
      total_price: total_price,
    });
  } else {
    res.redirect("/index");
  }
});

router.get("/history", async (req, res) => {
  var sess;
  sess = req.session;
  console.log("Home session", sess.email);
  if (sess.email) {
    let user = await User.findOne({ Email: sess.email });
    let history = await History.find({ UserId: user._id });

    let historyList = [];
    let winelist = [];
    let wineid = [];
    let wineImage = [];
    for (const key in history) {
      let wines = await Wine.find({ _id: history[key].WinesList });
      let namesAndIds = [];
      let ids = [];
      for (const key1 in wines) {
        namesAndIds.push({ name: wines[key1].WineName, id: wines[key1]._id });
      }

      historyList.push({
        wineName: namesAndIds,
        history: history[key],
      });
    }
    console.log(historyList);

    res.render("history", { history: historyList });
  } else {
    res.redirect("/index");
  }
});

router.get("/forgotPassword", (req, res) => {
  res.render("forgotPassword");
});

router.get("/changePassword", async (req, res) => {
  var sess;

  sess = req.session;
  if (sess.email) {
    res.render("changePassword");
  } else {
    res.render("index");
  }
});

router.get("/statistic", async (req, res) => {
  var sess;
  sess = req.session;

  res.render("static");
});

router.get("/results", async (req, res) => {
  var sess;
  sess = req.session;

  let statics = await Static.find();
  console.log(statics);

  const consumption = [0, 0, 0, 0, 0, 0];

  res.render("results");
});

router.get("/blog", async (req, res) => {
  var sess;
  sess = req.session;

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

    let blogQuestions = await BlogQuestion.find();
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

    console.log(list2);

    res.render("blog", { user: list1, blogQuestions: list2 });
  } else {
    res.render("index");
  }
});

router.get("/blogInfo/:id", async (req, res) => {
  var sess;
  sess = req.session;
  var id = req.params.id;
  let blogQuestions = await BlogQuestion.findOne({ _id: id });
  let user = await User.findOne({ Email: sess.email });
  let aplies = await AplyQuestion.find({ QuestionId: id });
  startNameUser = user.Name.split(" ");
  startNameUserString = startNameUser[0][0] + startNameUser[1][0];

  startBlogQuestionUserName = blogQuestions.UserName.split(" ");
  startBlogQuestionUserNameString =
    startBlogQuestionUserName[0][0] + startBlogQuestionUserName[1][0];

  let blogQuestionsArray = [];
  let userArray = [];
  let apliesArray = [];

  blogQuestionsArray.push({
    _id: blogQuestions._id,
    Question: blogQuestions.Question,
    QuestionDate: blogQuestions.QuestionDate,
    UserId: blogQuestions.UserId,
    UserName: blogQuestions.UserName,
    UserEmail: blogQuestions.UserEmail,
    startingName: startBlogQuestionUserNameString,
    randomColor: Math.floor(Math.random() * 16777215).toString(16),
  });

  userArray.push({
    _id: user._id,
    Name: user.Name,
    Email: user.Email,
    Password: user.Password,
    Birthday: user.Birthday,
    Gender: user.Gender,
    Mobile: user.Mobile,
    Address: user.Address,
    startingName: startNameUserString,
    randomColor: Math.floor(Math.random() * 16777215).toString(16),
    idid: id,
  });

  for (const key in aplies) {
    startN = aplies[key].AplierName.split(" ");
    startNString = startN[0][0] + startN[1][0];

    apliesArray.push({
      _id: aplies[key]._id,
      QuestionId: id,
      Aply: aplies[key].Aply,
      AplyDate: aplies[key].AplyDate,
      AplierId: aplies[key].AplierId,
      AplierName: aplies[key].AplierName,
      AplierEmail: aplies[key].AplierEmail,
      randomColor: Math.floor(Math.random() * 16777215).toString(16),
      StartingName: startNString,
    });
  }

  console.log(aplies.length);
  var numberOfAplies = { number: aplies.length, name: blogQuestions.UserName };

  res.render("blogInfo", {
    result: blogQuestionsArray,
    user: userArray,
    aply: apliesArray,
    number: numberOfAplies,
  });
});

router.get("/profilInfo/:id", async (req, res) => {
  var sess;
  sess = req.session;
  var id = req.params.id;

  if (sess.email) {
    let userInfo = await User.findOne({ _id: id });
    console.log(userInfo);
    res.render("profileInfo", { userInfo: userInfo });
  } else {
    res.render("index");
  }
});

router.get("/home/ContactUs", async (req, res) => {
  var sess;
  sess = req.session;
  var id = req.params.id;

  if (sess.email) {
    res.render("ContactUs");
  } else {
    res.render("index");
  }
});

router.get("/home/aboutUs", async (req, res) => {
  var sess;
  sess = req.session;
  var id = req.params.id;

  if (sess.email) {
    res.render("aboutus");
  } else {
    res.render("index");
  }
});

router.get("*", (req, res) => {
  return res.redirect("/");
});

module.exports = router;
