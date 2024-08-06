const mongoose = require("mongoose");

const RoleSch = new mongoose.Schema({
    name: String
});

const Role = mongoose.model(
    "Role", RoleSch
);

module.exports = Role;