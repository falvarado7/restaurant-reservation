
exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE tables RESTART IDENTITY CASCADE")
    .then(function () {
      return knex("tables").insert([
        { table_name: "Bar #1", capacity: 1, image_url: "https://images.unsplash.com/photo-1732525819066-88074e2d2748?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { table_name: "Bar #2", capacity: 1, image_url: "https://images.unsplash.com/photo-1732525819066-88074e2d2748?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"  },
        { table_name: "#1", capacity: 6, image_url: "https://images.unsplash.com/photo-1574923216693-3bdd71bf103a?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { table_name: "#2", capacity: 6, image_url: "https://images.unsplash.com/photo-1574923216693-3bdd71bf103a?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      ]);
    });
};
