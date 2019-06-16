const mysql = require("mysql2");
const inquirer = require("inquirer");

let pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "bamazon",
  password: "toor"
});

let connection = pool.promise();

const departmentProductSales = () => {
  connection
    .execute(
      `SELECT department_id, d.department_name, over_head_costs, product_sales FROM products p INNER JOIN departments d ON p.department_name = d.department_name GROUP BY department_name;`
    )
    .then(result => {
      for (let i = 0; i < result[0].length; i++) {
        console.log(
          `Department ID: ${result[0][i].department_id} Department Name: ${
            result[0][i].department_name
          } Over Head Costs: ${result[0][i].over_head_costs} Product Sales: ${
            result[0][i].product_sales
          } Total Profit: ${+result[0][i].over_head_costs -
            +result[0][i].product_sales}`
        );
      }
    })
    .catch(err => {
      console.log(err);
    });
};

inquirer
  .prompt([
    {
      type: "list",
      message: "What would you like to do?",
      choices: ["View Product Sales by Department", "Add new department"],
      name: "listOption"
    }
  ])
  .then(answer => {
    switch (answer.listOption) {
      case "View Product Sales by Department":
        departmentProductSales();
        break;
      case "Add new department":
        break;
    }
    connection.end();
  });
