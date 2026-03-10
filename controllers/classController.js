const db = require('../config/db');

const getAllClasses = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT c.id, c.class_name,
        (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) AS student_count
      FROM classes c
      ORDER BY c.id
    `);
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getSectionsByClass = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT sec.id, sec.section_name, c.class_name,
        (SELECT COUNT(*) FROM students s
         WHERE s.section_id = sec.id) AS student_count
      FROM sections sec
      JOIN classes c ON sec.class_id = c.id
      WHERE sec.class_id = ?
      ORDER BY sec.section_name
    `, [req.params.classId]);

        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllSections = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT sec.id, sec.section_name, c.id AS class_id, c.class_name
      FROM sections sec
      JOIN classes c ON sec.class_id = c.id
      ORDER BY c.id, sec.section_name
    `);
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAllClasses, getSectionsByClass, getAllSections };
