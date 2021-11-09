const { Router } = require("express");
const pokemons = require("./pokemons");
const types = require("./types");

const router = Router();

router.use("/pokemons", pokemons);
router.use("/types", tyconst { Router } = require("express");
const pokemons = require("./pokemons");
const types = require("./types");

const router = Router();

router.use("/pokemons", pokemons);
router.use("/types", types);

module.exports = router;
