const db = require('../config/db');

const getAllStudents = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT
        s.id,
        s.full_name,
        s.email,
        s.phone,
        s.date_of_birth,
        s.gender,
        s.address,
        s.guardian_name,
        s.guardian_phone,
        c.class_name,
        sec.section_name,
        s.roll_number,
        s.admission_date,
        s.created_at
      FROM students s
      JOIN classes  c   ON s.class_id   = c.id
      JOIN sections sec ON s.section_id = sec.id
      ORDER BY c.id, sec.section_name, s.full_name
    `);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getStudentById = async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT
        s.id, s.full_name, s.email, s.phone, s.date_of_birth,
        s.gender, s.address, s.guardian_name, s.guardian_phone,
        c.class_name, sec.section_name, s.roll_number,
        s.admission_date, s.created_at, s.updated_at
      FROM students s
      JOIN classes  c   ON s.class_id   = c.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE s.id = ?
    `, [req.params.id]);

        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Student not found' });

        res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const [rows] = await db.execute(`
      SELECT
        s.id, s.full_name, s.email, s.phone, s.gender,
        c.class_name, sec.section_name, s.roll_number, s.admission_date
      FROM students s
      JOIN classes  c   ON s.class_id   = c.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE s.class_id = ?
      ORDER BY sec.section_name, s.full_name
    `, [classId]);

        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getStudentsByClassAndSection = async (req, res) => {
    try {
        const { classId, sectionId } = req.params;
        const [rows] = await db.execute(`
      SELECT
        s.id, s.full_name, s.email, s.phone, s.gender,
        c.class_name, sec.section_name, s.roll_number, s.admission_date
      FROM students s
      JOIN classes  c   ON s.class_id   = c.id
      JOIN sections sec ON s.section_id = sec.id
      WHERE s.class_id = ? AND s.section_id = ?
      ORDER BY s.full_name
    `, [classId, sectionId]);

        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const addStudent = async (req, res) => {
    try {
        const {
            full_name, email, phone, date_of_birth, gender,
            address, guardian_name, guardian_phone,
            class_id, section_id, roll_number, admission_date
        } = req.body;

        if (!full_name || !class_id || !section_id)
            return res.status(400).json({
                success: false,
                message: 'full_name, class_id, and section_id are required'
            });

        const [secCheck] = await db.execute(
            'SELECT id FROM sections WHERE id = ? AND class_id = ?',
            [section_id, class_id]
        );
        if (secCheck.length === 0)
            return res.status(400).json({
                success: false,
                message: 'The provided section does not belong to the given class'
            });

        const [result] = await db.execute(`
      INSERT INTO students
        (full_name, email, phone, date_of_birth, gender,
         address, guardian_name, guardian_phone,
         class_id, section_id, roll_number, admission_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            full_name, email || null, phone || null, date_of_birth || null,
            gender || null, address || null, guardian_name || null,
            guardian_phone || null, class_id, section_id,
            roll_number || null, admission_date || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Student admitted successfully',
            data: { id: result.insertId, full_name, class_id, section_id }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Email already exists' });
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name, email, phone, date_of_birth, gender,
            address, guardian_name, guardian_phone,
            class_id, section_id, roll_number, admission_date
        } = req.body;

        const [existing] = await db.execute('SELECT id FROM students WHERE id = ?', [id]);
        if (existing.length === 0)
            return res.status(404).json({ success: false, message: 'Student not found' });

        if (class_id && section_id) {
            const [secCheck] = await db.execute(
                'SELECT id FROM sections WHERE id = ? AND class_id = ?',
                [section_id, class_id]
            );
            if (secCheck.length === 0)
                return res.status(400).json({
                    success: false,
                    message: 'The provided section does not belong to the given class'
                });
        }

        await db.execute(`
      UPDATE students SET
        full_name      = COALESCE(?, full_name),
        email          = COALESCE(?, email),
        phone          = COALESCE(?, phone),
        date_of_birth  = COALESCE(?, date_of_birth),
        gender         = COALESCE(?, gender),
        address        = COALESCE(?, address),
        guardian_name  = COALESCE(?, guardian_name),
        guardian_phone = COALESCE(?, guardian_phone),
        class_id       = COALESCE(?, class_id),
        section_id     = COALESCE(?, section_id),
        roll_number    = COALESCE(?, roll_number),
        admission_date = COALESCE(?, admission_date)
      WHERE id = ?
    `, [
            full_name || null, email || null, phone || null,
            date_of_birth || null, gender || null, address || null,
            guardian_name || null, guardian_phone || null,
            class_id || null, section_id || null,
            roll_number || null, admission_date || null,
            id
        ]);

        res.status(200).json({ success: true, message: 'Student updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Email already exists' });
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM students WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'Student not found' });

        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    getStudentsByClass,
    getStudentsByClassAndSection,
    addStudent,
    updateStudent,
    deleteStudent,
};
