const express = require("express");
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/addWine', authController.addWine)

router.post('/addComment', authController.addComment) 

router.post('/addToCard', authController.addToCard)

router.post('/deleteFromCard', authController.deleteFromCard)

router.post('/addtoHistory', authController.addtoHistory)

router.post('/changePassword', authController.changePassword)

router.post('/changeUserPassword', authController.changeUserPassword)

router.post('/editProfile', authController.editProfile)

router.post('/winesearch', authController.winesearch)

router.post('/addStatistic', authController.addStatistic)

router.post('/blogAddQuestion', authController.blogAddQuestion)

router.post('/aplyToQuestion', authController.aplyToQuestion)

router.post('/deleteAply', authController.deleteAply)

router.post('/filterQuestions', authController.filterQuestions)


module.exports = router;
