import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Plans",
      [
        {
          name: "Plano Individual",
          users: 1,
          connections: 1,
          queues: 3,
          value: 49.90,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Plano Plus",
          users: 5,
          connections: 3,
          queues: 10,
          value: 99.90,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Plano Pro",
          users: 10,
          connections: 10,
          queues: 20,
          value: 199.90,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Plans", {});
  }
};
