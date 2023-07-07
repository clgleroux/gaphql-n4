# Delivecrous-Back

Pour ce faire nous avons besoin de deux tables

1 | Dish

- title: STRING
- description: STRING
- allergens : STRING
- image : STRING

2 | Bakset

- address: STRING
- city: STRING
- cp: STRING
- dishes: [INTEGER]

Il faut évidemment créer une relation entre ces deux tables
Avec : Basket.hasMany(Dish, {foreignKey: "dishes"});

Pour la suite nous devons créer des produits avec la commande suivante

```mutation Mutation {
  addDish(
    allergens: "cacahuète"
    description: "Un nem ou rouleau impérial ou nem rán ou chả giò ou fried spring roll, spring roll ou vietnamese roll est une spécialité culinaire traditionnelle emblématique de la cuisine vietnamienne, à base de beignet salé farci frit entouré d’une galette de riz."
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Nem_03.jpg/640px-Nem_03.jpg"
    title: "Nems"
    ) {
    allergens
    description
    id
    image
    title
    }
  }
```

Ensuite nous devons créer un panier

```mutation CreateBasket {
  createBasket (
    address: "Place"
    city: "Lyon"
    cp: "69000"
    ) {
    address
    city
    cp
  }
}
```

Une fois le panier créer nous pouvons ajouter des produits dans ce panier grace à notre relation

```mutation AddDishToBasket {
  addDishToBasket (idBasket: "1", idDish: "1") {
    address
    dishes {
      id
    }
  }
}
```

Nous avons évidement les query pour vérifier que tout fonctionne correctement

```query Dishes {
  dishes {
    id
    description
    allergens
    image
    title
  }
}
```

ou encore

```query Baskets {
  baskets {
    address
    city
    cp
    dishes {
      id
    }
  }
}
```

Il nous faut pour que tout ça marche correctement différent resolver comme par exemple :

```addDishToBasket: async (parent, args) => {
  const { idBasket, idDish } = args;

  const basket = await Basket.findByPk(idBasket);
  if (!basket) {
    throw new Error('Basket not found');
  }

  const dish = await Dish.findByPk(idDish);
  if (!dish) {
    throw new Error('Dish not found');
  }

  await basket.addDish(dish);

  return await Basket.findByPk(idBasket, { include: [Dish] });
},
```

Les difficultés rencontrées sont les suivantes :

- Mise en place du lien entre mes deux types sur GraphQL (Majuscule et pluriel sur le nom de base)

Le projet tourne dans sont ensemble et il répond aux attentes.
