const { getAllClasses, getSectionsByClass, getAllSections } = require('../controllers/classController');

module.exports = [
    { method: 'GET', path: '/', handler: getAllClasses },
    { method: 'GET', path: '/sections', handler: getAllSections },
    { method: 'GET', path: '/:classId/sections', handler: getSectionsByClass },
];
