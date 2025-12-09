import db from '../database/db.js';

export class Board {
  static getAll() {
    return db.prepare('SELECT * FROM boards ORDER BY name').all();
  }

  static getById(id) {
    return db.prepare('SELECT * FROM boards WHERE id = ?').get(id);
  }

  static create(name, description = null) {
    return db.prepare('INSERT INTO boards (name, description) VALUES (?, ?)').run(name, description);
  }

  static getActiveCheckout(boardId) {
    return db.prepare(`
      SELECT * FROM checkouts 
      WHERE board_id = ? AND checked_in_at IS NULL 
      ORDER BY checked_out_at DESC 
      LIMIT 1
    `).get(boardId);
  }

  static checkout(boardId, userId, username, customMessage = null) {
    return db.prepare(`
      INSERT INTO checkouts (board_id, user_id, username, custom_message)
      VALUES (?, ?, ?, ?)
    `).run(boardId, userId, username, customMessage);
  }

  static checkin(boardId, userId) {
    return db.prepare(`
      UPDATE checkouts 
      SET checked_in_at = CURRENT_TIMESTAMP
      WHERE board_id = ? AND user_id = ? AND checked_in_at IS NULL
    `).run(boardId, userId);
  }

  static getUserCheckouts(userId) {
    return db.prepare(`
      SELECT c.*, b.name as board_name, b.description as board_description
      FROM checkouts c
      JOIN boards b ON c.board_id = b.id
      WHERE c.user_id = ? AND c.checked_in_at IS NULL
      ORDER BY c.checked_out_at DESC
    `).all(userId);
  }

  static getAllActiveCheckouts() {
    return db.prepare(`
      SELECT c.*, b.name as board_name, b.description as board_description
      FROM checkouts c
      JOIN boards b ON c.board_id = b.id
      WHERE c.checked_in_at IS NULL
      ORDER BY c.checked_out_at DESC
    `).all();
  }

  static getPanelConfig(guildId) {
    return db.prepare('SELECT * FROM panel_config WHERE guild_id = ?').get(guildId);
  }

  static setPanelConfig(guildId, channelId, messageId = null) {
    const existing = db.prepare('SELECT * FROM panel_config WHERE guild_id = ?').get(guildId);
    if (existing) {
      return db.prepare(`
        UPDATE panel_config 
        SET channel_id = ?, message_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE guild_id = ?
      `).run(channelId, messageId, guildId);
    } else {
      return db.prepare(`
        INSERT INTO panel_config (guild_id, channel_id, message_id)
        VALUES (?, ?, ?)
      `).run(guildId, channelId, messageId);
    }
  }

  static findBoardByNameOrId(input) {
    // Try to find by ID first
    const byId = db.prepare('SELECT * FROM boards WHERE id = ?').get(parseInt(input));
    if (byId) return byId;
    
    // Try to find by name (case insensitive)
    const byName = db.prepare('SELECT * FROM boards WHERE LOWER(name) = LOWER(?)').get(input);
    if (byName) return byName;
    
    // Try partial match
    const partial = db.prepare('SELECT * FROM boards WHERE LOWER(name) LIKE LOWER(?) LIMIT 1').get(`%${input}%`);
    return partial || null;
  }
}

