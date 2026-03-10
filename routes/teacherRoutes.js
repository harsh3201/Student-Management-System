const {
    getAllTeachers,
    getTeacherById,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    assignSubject,
    removeSubject,
} = require('../controllers/teacherController');

module.exports = [
    { method: 'GET', path: '/', handler: getAllTeachers },
    { method: 'GET', path: '/:id', handler: getTeacherById },
    { method: 'POST', path: '/', handler: addTeacher },
    { method: 'PUT', path: '/:id', handler: updateTeacher },
    { method: 'DELETE', path: '/:id', handler: deleteTeacher },
    { method: 'POST', path: '/assign-subject', handler: assignSubject },
    { method: 'DELETE', path: '/:teacher_id/subject/:subject_id', handler: removeSubject },
];
