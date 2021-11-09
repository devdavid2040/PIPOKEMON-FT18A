const { Router } = require("express");
const axios = require("axios");
const { Pokemon, Type } = require("../db.js");

const router = Router();

// Traigo todos los pokemons (tanto API como DB) y filtro por 'name';
router.gconst { Router } = require("express");
const axios = require("axios");
const { Pokemon, Type } = require("../db.js");

const router = Router();

// Traigo todos los pokemons (tanto API como DB) y filtro por 'name';
router.get("/", async (req, res) => {
  const { name } = req.query;
  // Traigo de a uno los Pokemon y los guardo en queries;
  var queries = [];
  for (let i = 1; i <= 40; i++) {
    queries.push(axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`));
  }
  // Traigo todos los pokemons desde API en caso que no se pase ningun name por query;
  if (!name) {
    return (
      Promise.all(queries)
        .then((pokemons) => pokemons.map((p) => p.data))
        .then((pokemons) =>
          pokemons.map((data) => {
            return {
              id: data.id,
              name: data.name,
              img: data.sprites.other["official-artwork"].front_default,
              types: data.types.map((t) => t.type.name),
              hp: data.stats[0].base_stat,
              attack: data.stats[1].base_stat,
              defense: data.stats[2].base_stat,
              speed: data.stats[5].base_stat,
              height: data.height,
              weight: data.weight,
            };
          })
        )
        // Busco en base de datos y concateno con API para devolver todo;
        .then(async (pokemons) =>
          pokemons.concat(
            await Pokemon.findAll({
              include: {
                model: Type,
                attributes: ["name"],
                through: {
                  attributes: [],
                },
              },
            })
          )
        )
        .then((pokemons) => res.status(200).send(pokemons))
    );
  } else {
    try {
      // Busco el pokemon en base de datos a partir de 'name' pasado por query;
      let pokeInDb = await Pokemon.findOne({
        where: { name: name },
        include: Type,
      });

      if (pokeInDb) {
        let pokeFinded = {
          id: pokeInDb.id,
          name: pokeInDb.name,
          hp: pokeInDb.hp,
          attack: pokeInDb.attack,
          defense: pokeInDb.defense,
          speed: pokeInDb.speed,
          height: pokeInDb.height,
          weight: pokeInDb.weight,
          img: pokeInDb.img,
          types: pokeInDb.type.map((e) => e.type.name),
        };

        return res.status(200).send(pokeFinded);
      } else {
        let pokeInApi = await axios
          .get(`https://pokeapi.co/api/v2/pokemon/${name}`)
          .then((res) => res.data);

        let pokeName = {
          id: pokeInApi.id,
          name: pokeInApi.name,
          hp: pokeInApi.stats[0].base_stat,
          attack: pokeInApi.stats[1].base_stat,
          defense: pokeInApi.stats[2].base_stat,
          speed: pokeInApi.stats[5].base_stat,
          weight: pokeInApi.weight,
          height: pokeInApi.height,
          img: pokeInApi.sprites.other["official-artwork"].front_default,
          types: pokeInApi.types.map((e) => e.type.name),
        };

        res.status(200).send(pokeName);
      }
    } catch (e) {
      res.status(404).send(e.message);
    }
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (id.length > 2) {
      var pokeIdDb = await Pokemon.findOne({ where: { id }, include: Type });
      var pokeDb = {
        id: pokeIdDb.id,
        name: pokeIdDb.name,
        hp: pokeIdDb.hp,
        attack: pokeIdDb.attack,
        defense: pokeIdDb.defense,
        speed: pokeIdDb.speed,
        weight: pokeIdDb.weight,
        height: pokeIdDb.height,
        img: pokeIdDb.img,
        type: pokeIdDb.type.map((e) => e.dataValues.name),
      };
      res.status(200).send(pokeDb);
    } else {
      var num = parseInt(id);
      var pokeIdApi = await axios
        .get(`https://pokeapi.co/api/v2/pokemon/${num}`)
        .then((res) => res.data);

      var pokeApi = {
        id: pokeIdApi.id,
        name: pokeIdApi.name,
        types: pokeIdApi.types.map((e) => e.type.name),
        hp: pokeIdApi.stats[0].base_stat,
        attack: pokeIdApi.stats[1].base_stat,
        defense: pokeIdApi.stats[2].base_stat,
        speed: pokeIdApi.stats[5].base_stat,
        weight: pokeIdApi.weight,
        height: pokeIdApi.height,
        img: pokeIdApi.sprites.other["official-artwork"].front_default,
      };

      res.status(200).send(pokeApi);
    }
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.post("/", async (req, res) => {
  const { name, hp, attack, defense, speed, height, weight, types, img } =
    req.body;

  console.log(types);
  try {
    var creatingPoke = await Pokemon.create({
      name: name,
      hp: hp,
      attack: attack,
      defense: defense,
      speed: speed,
      height: height,
      weight: weight,
      img: img,
      created: true,
    });

    types.map(async (e) => {
      // encontrar lo que quiero o lo creo, si lo encuentro lo pasa por la variable t, y la segunda si lo encontro o lo creo
      let [t, created] = await Type.findOrCreate({ where: { name: e } });
      // agrego al pokemon el types
      creatingPoke.addType(t);
    });

    res.status(200).send(creatingPoke);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
