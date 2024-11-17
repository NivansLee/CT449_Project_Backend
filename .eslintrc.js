module.exports = {
    // Cấu hình môi trường làm việc cho ESLint
    env: {
        // Cho phép sử dụng các biến và cú pháp của Node.js
        node: true,
        // Cho phép sử dụng CommonJS
        commonjs: true,
        // Cho phép sử dụng các tính năng của ECMAScript 2021
        es2021: true,
    },
    // Kế thừa các cấu hình mặc định của ESLint và Prettier
    extends: ['eslint:recommended', 'prettier'],
};