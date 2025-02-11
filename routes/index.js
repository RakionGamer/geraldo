var express = require('express');
var router = express.Router();
const verificarToken = require('../controllers/auth/authJWT');
const usersController = require('../controllers/users/user');
const adminController = require('../controllers/users/admin');

router.get('/login', (req, res) => {
  res.render('login.ejs');
});

router.get('/register', (req, res) => {
  res.render('registro.ejs');
});

router.get('/', verificarToken, usersController.index);

router.get('/admin', (req,res) => {
  adminController.getCategories(req,res)
});

router.post('/admin/productos', (req, res) => {
  adminController.addProduct(req, res);
});
router.post('/agregar-carrito/:id', verificarToken, (req, res) => {
  usersController.addcar(req, res);
});
router.post('/login', (req, res) => {
  usersController.login(req, res);
});
router.get('/logout', (req,res) => {
  usersController.logout(req,res);
});
router.post("/register", (req,res)=> {
  usersController.register(req,res);
});
router.get('/carrito', verificarToken, (req, res) => {
  usersController.getViewCar(req, res);
});
router.get('/eliminar-carrito/:id', verificarToken, (req, res) => {
  usersController.deteleCar(req, res);
});


module.exports = router;
