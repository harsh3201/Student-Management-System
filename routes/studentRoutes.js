const {
    getAllStudents,
    getStudentById,
    getStudentsByClass,
    getStudentsByClassAndSection,
    addStudent,
    updateStudent,
    deleteStudent,
} = require('../controllers/studentController');

module.exports = [
    { method: 'GET', path: '/', handler: getAllStudents },
    { method: 'GET', path: '/class/:classId', handler: getStudentsByClass },
    { method: 'GET', path: '/class/:classId/section/:sectionId', handler: getStudentsByClassAndSection },
    { method: 'GET', path: '/:id', handler: getStudentById },
    { method: 'POST', path: '/', handler: addStudent },
    { method: 'PUT', path: '/:id', handler: updateStudent },
    { method: 'DELETE', path: '/:id', handler: deleteStudent },
];
