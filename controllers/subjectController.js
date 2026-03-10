const db = require('../config/db');

const getAllSubjects = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT s.id, s.subject_name, c.id AS class_id, c.class_name, s.created_at
      FROM subjects s
      JOIN classes c ON s.class_id = c.id
      ORDER BY c.id, s.subject_name
    `);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getSubjectById = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT s.id, s.subject_name, c.id AS class_id, c.class_name, s.created_at
      FROM subjects s
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);

        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Subject not found' });

        const [teachers] = await db.execute(`
      SELECT t.id AS teacher_id, t.full_name, t.email
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      WHERE ts.subject_id = ?
    `, [req.params.id]);

        res.status(200).json({
            success: true,
            data: { ...rows[0], assigned_teachers: teachers }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getSubjectsByClass = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT s.id, s.subject_name, c.class_name
      FROM subjects s
      JOIN classes c ON s.class_id = c.id
      WHERE s.class_id = ?
      ORDER BY s.subject_name
    `, [req.params.classId]);

        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const addSubject = async (req, res) => {
    try {
        const { subject_name, class_id } = req.body;

        if (!subject_name || !class_id)
            return res.status(400).json({
                success: false,
                message: 'subject_name and class_id are required'
            });

        const [classCheck] = await db.execute('SELECT id FROM classes WHERE id = ?', [class_id]);
        if (classCheck.length === 0)
            return res.status(404).json({ success: false, message: 'Class not found' });

        const [result] = await db.execute(
            'INSERT INTO subjects (subject_name, class_id) VALUES (?, ?)',
            [subject_name, class_id]
        );

        res.status(201).json({
            success: true,
            message: 'Subject added successfully',
            data: { id: result.insertId, subject_name, class_id }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({
                success: false,
                message: 'This subject already exists for the given class'
            });
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_name, class_id } = req.body;

        const [existing] = await db.execute('SELECT id FROM subjects WHERE id = ?', [id]);
        if (existing.length === 0)
            return res.status(404).json({ success: false, message: 'Subject not found' });

        if (class_id) {
            const [classCheck] = await db.execute('SELECT id FROM classes WHERE id = ?', [class_id]);
            if (classCheck.length === 0)
                return res.status(404).json({ success: false, message: 'Class not found' });
        }

        await db.execute(`
      UPDATE subjects SET
        subject_name = COALESCE(?, subject_name),
        class_id     = COALESCE(?, class_id)
      WHERE id = ?
    `, [subject_name || null, class_id || null, id]);

        res.status(200).json({ success: true, message: 'Subject updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({
                success: false,
                message: 'This subject already exists for the given class'
            });
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM subjects WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'Subject not found' });

        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllSubjects,
    getSubjectById,
    getSubjectsByClass,
    addSubject,
    updateSubject,
    deleteSubject,
};
