const request = require('supertest');
const app = require('../server');
const { Key, StringValue, Language, sequelize } = require('../models');

// Mock models
jest.mock('../models', () => {
  const mockSequelize = {
    sync: jest.fn().mockResolvedValue(true),
    transaction: jest.fn(() => ({
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true)
    }))
  };
  
  const mockLanguage = {
    findOne: jest.fn(),
    findAll: jest.fn()
  };
  
  const mockKey = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  };
  
  const mockStringValue = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
  };
  
  return {
    sequelize: mockSequelize,
    Language: mockLanguage,
    Key: mockKey,
    StringValue: mockStringValue
  };
});

describe('Key API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/keys', () => {
    it('should return all keys with string values', async () => {
      // Mock database response
      const mockKeys = [
        {
          id: 1,
          name: 'welcome.message',
          description: 'Welcome message',
          StringValues: [
            {
              id: 1,
              value: 'Welcome to our app',
              languageId: 1,
              keyId: 1,
              Language: { id: 1, code: 'en', name: 'English', isDefault: true }
            }
          ]
        }
      ];
      
      Key.findAll.mockResolvedValue(mockKeys);
      
      const response = await request(app)
        .get('/api/keys')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('welcome.message');
      expect(response.body[0].StringValues).toHaveLength(1);
      expect(Key.findAll).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors', async () => {
      // Mock database error
      Key.findAll.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .get('/api/keys')
        .expect('Content-Type', /json/)
        .expect(500);
      
      expect(response.body.message).toBeDefined();
      expect(Key.findAll).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('POST /api/keys', () => {
    it('should create a new key with string values', async () => {
      // Mock default language
      const mockDefaultLanguage = { id: 1, code: 'en', name: 'English', isDefault: true };
      Language.findOne.mockResolvedValue(mockDefaultLanguage);
      
      // Mock key data
      const newKey = {
        name: 'button.submit',
        description: 'Submit button text',
        stringValues: [
          { languageId: 1, value: 'Submit' }
        ]
      };
      
      // Mock created key
      const createdKey = {
        id: 1,
        name: newKey.name,
        description: newKey.description,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock created key with string values
      const createdKeyWithStringValues = {
        ...createdKey,
        StringValues: [
          {
            id: 1,
            value: 'Submit',
            languageId: 1,
            keyId: 1,
            Language: mockDefaultLanguage
          }
        ]
      };
      
      Key.create.mockResolvedValue(createdKey);
      StringValue.create.mockResolvedValue({
        id: 1,
        value: 'Submit',
        languageId: 1,
        keyId: 1
      });
      Key.findByPk.mockResolvedValue(createdKeyWithStringValues);
      
      const response = await request(app)
        .post('/api/keys')
        .send(newKey)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body.name).toBe('button.submit');
      expect(response.body.StringValues).toBeDefined();
      expect(Key.create).toHaveBeenCalled();
      expect(StringValue.create).toHaveBeenCalled();
    });
    
    it('should require a default language value', async () => {
      // Mock default language
      const mockDefaultLanguage = { id: 1, code: 'en', name: 'English', isDefault: true };
      Language.findOne.mockResolvedValue(mockDefaultLanguage);
      
      // Missing value for default language
      const invalidKey = {
        name: 'button.cancel',
        description: 'Cancel button text',
        stringValues: [
          { languageId: 2, value: 'Annuler' } // Not the default language
        ]
      };
      
      const response = await request(app)
        .post('/api/keys')
        .send(invalidKey)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.message).toBeDefined();
      expect(Key.create).not.toHaveBeenCalled();
    });
  });
  
  describe('PUT /api/keys/:id', () => {
    it('should update an existing key and its string values', async () => {
      // Mock key instance
      const existingKey = {
        id: 1,
        name: 'button.submit',
        description: 'Submit button text',
        update: jest.fn().mockResolvedValue(true)
      };
      
      // Mock updated key with values
      const updatedKeyWithValues = {
        id: 1,
        name: 'button.submit',
        description: 'Updated button text',
        StringValues: [
          {
            id: 1,
            value: 'Submit',
            languageId: 1,
            keyId: 1,
            Language: { id: 1, code: 'en', name: 'English', isDefault: true }
          },
          {
            id: 2,
            value: 'Soumettre',
            languageId: 2,
            keyId: 1,
            Language: { id: 2, code: 'fr', name: 'French', isDefault: false }
          }
        ]
      };
      
      // Mock update data
      const updateData = {
        description: 'Updated button text',
        stringValues: [
          { languageId: 1, value: 'Submit' },
          { languageId: 2, value: 'Soumettre' }
        ]
      };
      
      Key.findByPk.mockResolvedValueOnce(existingKey);
      StringValue.findOne.mockResolvedValue(null); // No existing values
      StringValue.create.mockResolvedValue(true);
      Key.findByPk.mockResolvedValueOnce(updatedKeyWithValues);
      
      const response = await request(app)
        .put('/api/keys/1')
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.description).toBe('Updated button text');
      expect(response.body.StringValues).toHaveLength(2);
      expect(existingKey.update).toHaveBeenCalled();
    });
    
    it('should return 404 if key not found', async () => {
      Key.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/keys/999')
        .send({ description: 'Not Found' })
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.message).toBeDefined();
    });
  });
  
  describe('DELETE /api/keys/:id', () => {
    it('should delete a key and its string values', async () => {
      // Mock key instance
      const mockKey = {
        id: 1,
        name: 'button.submit',
        description: 'Submit button text',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Key.findByPk.mockResolvedValue(mockKey);
      
      await request(app)
        .delete('/api/keys/1')
        .expect(200);
      
      expect(Key.findByPk).toHaveBeenCalledWith('1');
      expect(mockKey.destroy).toHaveBeenCalled();
    });
    
    it('should return 404 if key not found', async () => {
      Key.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .delete('/api/keys/999')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.message).toBeDefined();
    });
  });
}); 