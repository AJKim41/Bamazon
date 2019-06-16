const mysql = require("mysql2");
const inquirer = require("inquirer");

let pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "bamazon",
  password: "toor"
});

let connection = pool.promise();

const displayItems = () => {
  connection
    .execute("SELECT id, product_name, price FROM products;")
    .then(result => {
      for (let i = 0; i < result[0].length; i++) {
        console.log(
          `Product ID: ${result[0][i].id} Product Name: ${
            result[0][i].product_name
          } Price: $${result[0][i].price}`
        );
      }
    })
    .catch(err => {
      console.log(err);
    });
};

const addInventory = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message:
          "Which item would you like to update the inventory of (enter item id)?",
        name: "itemID"
      },
      {
        type: "input",
        message: "How much would you like to add?",
        name: "newStockQuantity"
      }
    ])
    .then(answer => {
      connection
        .execute(
          `UPDATE products SET stock_quantity = '${
            answer.newStockQuantity
          }' WHERE id = '${answer.itemID}';`
        )
        .then(result => {
          console.log(`Inventory has been updated`);
          connection.end();
        })
        .catch(err => {
          console.log(err);
        });
    });
};

const addProduct = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the item name?",
        name: "itemName"
      },
      {
        type: "input",
        message: "What is the department?",
        name: "departmentName"
      },
      {
        type: "input",
        message: "What is the price?",
        name: "itemPrice"
      },
      {
        type: "input",
        message: "How many are in stock?",
        name: "stockQuantity"
      }
    ])
    .then(answer => {
      connection.execute(
        `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("${
          answer.itemName
        }", "${answer.departmentName}", "${answer.itemPrice}", "${
          answer.stockQuantity
        }");`
      );
    });
};

const viewLowInventory = () => {
  connection
    .execute(
      `SELECT id, product_name, stock_quantity FROM products WHERE stock_quantity <= 5;`
    )
    .then(result => {
      for (let i = 0; i < result[0].length; i++) {
        console.log(
          `Product ID: ${result[0][i].id} Product Name: ${
            result[0][i].product_name
          } stockQuantity: $${result[0][i].stock_quantity}`
        );
      }
    })
    .catch(err => {
      console.log(err);
    });
};

const startManagerApp = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ],
        name: "listOption"
      }
    ])
    .then(answer => {
      switch (answer.listOption) {
        case "View Products for Sale":
          displayItems();
          break;
        case "View Low Inventory":
          viewLowInventory();
          break;
        case "Add to Inventory":
          addInventory();
          break;
        case "Add New Product":
          addProduct();
          break;
      }
      connection.end();
    });
};

startManagerApp();
