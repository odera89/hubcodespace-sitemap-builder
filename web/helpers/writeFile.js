import { writeFile } from "fs";

export const handleWriteFile = async function (path, content) {
  return new Promise((resolve, reject) => {
    writeFile(path, content, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};
