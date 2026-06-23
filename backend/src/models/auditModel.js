const db = require('../config/db');

const logAction = async (userId, action, entity, entityId, oldValues = null, newValues = null) => {
    // Karena kolom old_values dan new_values di MySQL bertipe JSON,
    // kita harus men-stringify object JavaScript sebelum menyimpannya
    const oldData = oldValues ? JSON.stringify(oldValues) : null;
    const newData = newValues ? JSON.stringify(newValues) : null;

    await db.execute(
        `INSERT INTO audit_logs (user_id, action, entity, entity_id, old_values, new_values) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, entity, entityId, oldData, newData]
    );
};

module.exports = {
    logAction
};