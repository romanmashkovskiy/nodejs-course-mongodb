// const fs = require('fs');
// const path = require('path');
//
// const p = path.join(
//     path.dirname(process.mainModule.filename),
//     'data',
//     'card.json'
// );
//
// class Card {
//     static async add(course) {
//         const card = await Card.fetch();
//
//         const index = card.courses.findIndex(c => c.id === course.id);
//
//         if (index !== -1) {
//             card.courses[index].count++;
//         } else {
//             course.count = 1;
//             card.courses.push(course);
//         }
//
//         card.price = Number(card.price) + Number(course.price);
//
//         return new Promise((resolve, reject) => {
//             fs.writeFile(
//                 p,
//                 JSON.stringify(card),
//                 (err) => {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve();
//                     }
//                 }
//             );
//         })
//     }
//
//     static fetch() {
//         return new Promise((resolve, reject) => {
//             fs.readFile(
//                 p,
//                 'utf-8',
//                 (err, data) => {
//                     if (err) reject(err);
//                     resolve(JSON.parse(data));
//                 }
//             );
//         })
//     }
//
//     static async remove(id) {
//         const card = await Card.fetch();
//
//         const index = card.courses.findIndex(c => c.id === id);
//         const course = card.courses[index];
//
//         if (course.count === 1) {
//             card.courses = card.courses.filter(c => c.id !== id);
//         } else {
//             card.courses[index].count --;
//         }
//
//         card.price -= course.price;
//
//         return new Promise((resolve, reject) => {
//             fs.writeFile(
//                 p,
//                 JSON.stringify(card),
//                 (err) => {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve(card);
//                     }
//                 }
//             );
//         })
//     }
//
// }
//
// module.exports = Card;