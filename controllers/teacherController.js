const db = require('../config/db');

const getAllTeachers = async (req, res) => {
    try {
        const [teachers] = await db.execute(`
      SELECT
        t.id, t.full_name, t.email, t.phone, t.address,
        t.gender, t.date_joined, t.created_at
      FROM teachers t
      ORDER BY t.full_name
    `);

        const teacherIds = teachers.map(t => t.id);
        if (teacherIds.length === 0)
            return res.status(200).json({ success: true, count: 0, data: [] });

        const [subjects] = await db.execute(`
      SELECT ts.teacher_id, s.id AS subject_id, s.subject_name, c.class_name
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      JOIN classes  c ON s.class_id    = c.id
      WHERE ts.teacher_id IN (${teacherIds.map(() => '?').join(',')})
    `, teacherIds);

        const subjectMap = {};
        subjects.forEach(sub => {
            if (!subjectMap[sub.teacher_id]) subjectMap[sub.teacher_id] = [];
            subjectMap[sub.teacher_id].push({
                subject_id: sub.subject_id,
                subject_name: sub.subject_name,
                class_name: sub.class_name
            });
        });

        const data = teachers.map(t => ({
            ...t,
            assigned_subjects: subjectMap[t.id] || []
        }));

        res.status(200).json({ success: true, count: data.length, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getTeacherById = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM teachers WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Teacher not found' });

        const teacher = rows[0];

        const [subjects] = await db.execute(`
      SELECT s.id AS subject_id, s.subject_name, c.class_name
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      JOIN classes  c ON s.class_id    = c.id
      WHERE ts.teacher_id = ?
    `, [teacher.id]);

        res.status(200).json({
            success: true,
            data: { ...teacher, assigned_subjects: subjects }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const addTeacher = async (req, res) => {
    try {
        const { full_name, email, phone, address, gender, date_joined } = req.body;

        if (!full_name || !email)
            return res.status(400).json({
                success: false,
                message: 'full_name and email are required'
            });

        const [result] = await db.execute(`
      INSERT INTO teachers (full_name, email, phone, address, gender, date_joined)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [full_name, email, phone || null, address || null, gender || null, date_joined || null]);

        res.status(201).json({
            success: true,
            message: 'Teacher added successfully',
            data: { id: result.insertId, full_name, email }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Email already exists' });
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, address, gender, date_joined } = req.body;

        const [existing] = await db.execute('SELECT id FROM teachers WHERE id = ?', [id]);
        if (existing.length === 0)
            return res.status(404).json({ success: false, message: 'Teacher not found' });

        await db.execute(`
      UPDATE teachers SET
        full_name   = COALESCE(?, full_name),
        email       = COALESCE(?, email),
        phone       = COALESCE(?, phone),
        address     = COALESCE(?, address),
        gender      = COALESCE(?, gender),
        date_joined = COALESCE(?, date_joined)
      WHERE id = ?
    `, [
            full_name || null, email || null, phone || null,
            address || null, gender || null, date_joined || null,
            id
        ]);

        res.status(200).json({ success: true, message: 'Teacher updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Email already exists' });
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM teachers WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'Teacher not found' });

        res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const assignSubject = async (req, res) => {
    try {
        const { teacher_id, subject_id } = req.body;

        if (!teacher_id || !subject_id)
            return res.status(400).json({
                success: false,
                message: 'teacher_id and subject_id are required'
            });

        const [teacher] = await db.execute('SELECT id FROM teachers WHERE id = ?', [teacher_id]);
        if (teacher.length === 0)
            return res.status(404).json({ success: false, message: 'Teacher not found' });

        const [subject] = await db.execute('SELECT id FROM subjects WHERE id = ?', [subject_id]);
        if (subject.length === 0)
            return res.status(404).json({ success: false, message: 'Subject not found' });

        const [count] = await db.execute(
            'SELECT COUNT(*) AS total FROM teacher_subjects WHERE teacher_id = ?',
            [teacher_id]
        );
        if (count[0].total >= 2)
            return res.status(400).json({
                success: false,
                message: 'A teacher cannot be assigned more than 2 subjects (business rule)'
            });

        await db.execute(
            'INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)',
            [teacher_id, subject_id]
        );

        res.status(201).json({
            success: true,
            message: 'Subject assigned to teacher successfully'
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({
                success: false,
                message: 'This subject is already assigned to the teacher'
            });
        res.status(500).json({ success: false, message: err.message });
    }
};

const removeSubject = async (req, res) => {
    try {
        const { teacher_id, subject_id } = req.params;
        const [result] = await db.execute(
            'DELETE FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?',
            [teacher_id, subject_id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });

        res.status(200).json({
            success: true,
            message: 'Subject removed from teacher successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllTeachers,
    getTeacherById,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    assignSubject,
    removeSubject,
};
