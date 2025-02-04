const fs = require("fs");

const logger = async (message) => {
  fs.appendFile("logs.txt", "\n" + message, (error) => {
    if (error) {
      throw error;
    }
  });
};

module.exports = logger;
