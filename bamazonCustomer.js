const mysql = require("mysql2");
const inquirer = require("inquirer");

let pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "bamazon",
  password: "toor"
});

let connection = pool.promise();

const promptUserBuy = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the ID of the product you would like to buy?",
        name: "productID"
      }
    ])
    .then(answer => {
      let itemID = answer.productID;
      promptUserQuantity(itemID);
    });
};

const promptUserQuantity = itemID => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "How many would you like to buy?",
        name: "productQuantity"
      }
    ])
    .then(answer => {
      let itemQuantity = answer.productQuantity;
      checkAndBuy(itemID, itemQuantity);
    });
};

const checkAndBuy = (itemID, itemQuantity) => {
  connection
    .execute(
      `SELECT stock_quantity, price, product_sales FROM products WHERE id = '${itemID}';`
    )
    .then(result => {
      let currentStock = result[0][0].stock_quantity;
      let itemPrice = result[0][0].price;
      let productSales = result[0][0].productSales;
      if (itemQuantity <= currentStock) {
        let newStockQuantity = currentStock - itemQuantity;
        reduceStock(
          newStockQuantity,
          itemID,
          itemPrice,
          itemQuantity,
          productSales
        );
      } else {
        console.log(
          `Not enough items in stock. Current stock available: ${currentStock}`
        );
        connection.end();
      }
    })
    .catch(err => {
      console.log(err);
    });
};

const reduceStock = (
  newStockQuantity,
  itemID,
  itemPrice,
  itemQuantity,
  productSales = 0
) => {
  connection
    .execute(
      `UPDATE products SET stock_quantity = '${newStockQuantity}' WHERE id = '${itemID}';`
    )
    .then(result => {
      let total = itemPrice * itemQuantity;
      let product_sales = productSales + total;
      console.log(product_sales);
      console.log(`Your total is $${total}`);
      connection
        .execute(
          `UPDATE products SET product_sales = '${product_sales}' WHERE id = '${itemID}'`
        )
        .then(result => {
          console.log("Product sales updated");
          connection.end();
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

connection
  .execute(
    "SELECT id, product_name, price FROM products WHERE stock_quantity > 0;"
  )
  .then(result => {
    for (let i = 0; i < result[0].length; i++) {
      console.log(
        `Product ID: ${result[0][i].id} Product Name: ${
          result[0][i].product_name
        } Price: $${result[0][i].price}`
      );
    }
    promptUserBuy();
  })
  .catch(err => {
    console.log(err);
  });
