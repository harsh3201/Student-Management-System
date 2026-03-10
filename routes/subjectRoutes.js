const {
    getAllSubjects,
    getSubjectById,
    getSubjectsByClass,
    addSubject,
    updateSubject,
    deleteSubject,
} = require('../controllers/subjectController');

module.exports = [
    { method: 'GET', path: '/', handler: getAllSubjects },
    { method: 'GET', path: '/class/:classId', handler: getSubjectsByClass },
    { method: 'GET', path: '/:id', handler: getSubjectById },
    { method: 'POST', path: '/', handler: addSubject },
    { method: 'PUT', path: '/:id', handler: updateSubject },
    { method: 'DELETE', path: '/:id', handler: deleteSubject },
];
