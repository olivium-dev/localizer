const request = require('supertest');
const express = require('express');
const app = require('../server');
const { Language } = require('../models');

// Mock app if server.js doesn't export the app
jest.mock('../models', () => {
  const mockLanguage = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    Language: mockLanguage,
    sequelize: {
      sync: jest.fn().mockResolvedValue(true)
    }
  };
});

describe('Language API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/languages', () => {
    it('should return all languages', async () => {
      // Mock database response
      const mockLanguages = [
        { id: 1, code: 'en', name: 'English', isDefault: true },
        { id: 2, code: 'fr', name: 'French', isDefault: false }
      ];
      
      Language.findAll.mockResolvedValue(mockLanguages);
      
      const response = await request(app)
        .get('/api/languages')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveLength(2);
      expect(response.body[0].code).toBe('en');
      expect(response.body[1].code).toBe('fr');
      expect(Language.findAll).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors', async () => {
      // Mock database error
      Language.findAll.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .get('/api/languages')
        .expect('Content-Type', /json/)
        .expect(500);
      
      expect(response.body.message).toBeDefined();
      expect(Language.findAll).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('POST /api/languages', () => {
    it('should create a new language', async () => {
      // Mock language data
      const newLanguage = {
        code: 'de',
        name: 'German',
        isDefault: false
      };
      
      // Mock database response
      const createdLanguage = { 
        id: 3, 
        ...newLanguage,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      Language.create.mockResolvedValue(createdLanguage);
      
      const response = await request(app)
        .post('/api/languages')
        .send(newLanguage)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body.code).toBe('de');
      expect(response.body.name).toBe('German');
      expect(Language.create).toHaveBeenCalledWith(newLanguage);
    });
    
    it('should validate required fields', async () => {
      // Missing required fields
      const invalidLanguage = {
        code: '', // Empty code
        name: 'Invalid'
      };
      
      const response = await request(app)
        .post('/api/languages')
        .send(invalidLanguage)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.message).toBeDefined();
      expect(Language.create).not.toHaveBeenCalled();
    });
  });
  
  describe('PUT /api/languages/:id', () => {
    it('should update an existing language', async () => {
      // Mock language data
      const languageId = 2;
      const updateData = {
        name: 'French (Updated)',
        isDefault: true
      };
      
      // Mock language instance
      const mockLanguage = {
        id: languageId,
        code: 'fr',
        name: 'French',
        isDefault: false,
        update: jest.fn().mockResolvedValue({
          id: languageId,
          code: 'fr',
          name: updateData.name,
          isDefault: updateData.isDefault
        })
      };
      
      Language.findByPk.mockResolvedValue(mockLanguage);
      Language.update.mockResolvedValue([1]);
      
      const response = await request(app)
        .put(`/api/languages/${languageId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.name).toBe('French (Updated)');
      expect(response.body.isDefault).toBe(true);
      expect(Language.findByPk).toHaveBeenCalledWith(String(languageId));
    });
    
    it('should return 404 if language not found', async () => {
      Language.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/languages/999')
        .send({ name: 'Not Found' })
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.message).toBeDefined();
    });
  });
  
  describe('DELETE /api/languages/:id', () => {
    it('should delete a language', async () => {
      // Mock language instance
      const mockLanguage = {
        id: 2,
        code: 'fr',
        name: 'French',
        isDefault: false,
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Language.findByPk.mockResolvedValue(mockLanguage);
      
      await request(app)
        .delete('/api/languages/2')
        .expect(200);
      
      expect(Language.findByPk).toHaveBeenCalledWith('2');
      expect(mockLanguage.destroy).toHaveBeenCalled();
    });
    
    it('should not allow deletion of default language', async () => {
      // Mock default language
      const mockDefaultLanguage = {
        id: 1,
        code: 'en',
        name: 'English',
        isDefault: true,
        destroy: jest.fn()
      };
      
      Language.findByPk.mockResolvedValue(mockDefaultLanguage);
      
      const response = await request(app)
        .delete('/api/languages/1')
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.message).toBeDefined();
      expect(mockDefaultLanguage.destroy).not.toHaveBeenCalled();
    });
    
    it('should return 404 if language not found', async () => {
      Language.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .delete('/api/languages/999')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.message).toBeDefined();
    });
  });
}); 