import express from "express"
import UserController from "../controllers/user.controller.js"
import { body } from "express-validator"
import authMiddleware from "../middlewares/auth.middleware.js"

const router = new express.Router()

router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 4, max: 12 }),
  UserController.registration
)
router.post("/login", UserController.login)
router.post("/googleauth", UserController.googleauth)
router.post("/logout", UserController.logout)
router.get("/activate/:link", UserController.activate)
router.get("/refresh", UserController.refresh)
router.get("/users", authMiddleware(3), UserController.getUsers)
router.get("/user", authMiddleware(4), UserController.getUser)
// router.get('/echo',)
// router.get('/user/:id', userController.getOneUser)
// router.put('/user', userController.updateUser)
// router.delete('/user/:id', userController.deleteUser)

export default router
