import express from "express"
import userController from "../controllers/user.controller.js"
import { body } from "express-validator"
import authMiddleware from "../middlewares/auth.middleware.js"

const router = new express.Router()

router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 4, max: 12 }),
  userController.registration,
)
router.post("/login", userController.login)
router.post("/googleauth", userController.googleauth)
router.post("/logout", userController.logout)
router.get("/activate/:link", userController.activate)
router.get("/refresh", userController.refresh)
router.get("/users", authMiddleware(3), userController.getUsers)
router.get("/user", authMiddleware(4), userController.getUser)
// router.get('/echo',)
// router.get('/user/:id', userController.getOneUser)
// router.put('/user', userController.updateUser)
// router.delete('/user/:id', userController.deleteUser)

export default router
