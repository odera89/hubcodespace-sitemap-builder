import { readFile, writeFile } from "fs";

export const handleReadFile = async function (path) {
  return new Promise((resolve, reject) => {
    readFile(path, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};
