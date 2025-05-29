const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Division Management API',
      version: '1.0.0',
      description: 'A comprehensive REST API for managing divisions with SQL Server database. This API provides full CRUD operations with duplicate prevention and soft delete functionality.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Divisions',
        description: 'Division management operations'
      }
    ],
  components: {
    schemas: {
      Division: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
              description: 'The auto-generated unique identifier of the division',
              example: 1,
              readOnly: true
          },
            divisionName: {
            type: 'string',
              description: 'The name of the division (must be unique)',
              example: 'Engineering',
              maxLength: 255
          },
            divisionCode: {
            type: 'string',
              description: 'The short code for the division (must be unique)',
              example: 'ENG',
              maxLength: 50
            },
            divisionSAPCode: {
            type: 'string',
              description: 'The SAP system code (optional, must be unique if provided)',
              example: 'ENG001',
              maxLength: 50,
              nullable: true
          },
            isActive: {
              type: 'boolean',
              description: 'Boolean flag indicating if the division is active',
              example: true,
              default: true
          }
          },
          required: ['divisionName', 'divisionCode']
      },
        DivisionInput: {
        type: 'object',
        properties: {
            divisionName: {
              type: 'string',
              description: 'The name of the division (must be unique)',
              example: 'Engineering',
              maxLength: 255
          },
            divisionCode: {
            type: 'string',
              description: 'The short code for the division (must be unique)',
              example: 'ENG',
              maxLength: 50
          },
            divisionSAPCode: {
            type: 'string',
              description: 'The SAP system code (optional, must be unique if provided)',
              example: 'ENG001',
              maxLength: 50,
              nullable: true
            },
            isActive: {
              type: 'boolean',
              description: 'Boolean flag indicating if the division is active',
              example: true,
              default: true
        }
          },
          required: ['divisionName', 'divisionCode']
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
              description: 'Indicates if the request was successful'
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
              description: 'Success message'
            },
            data: {
              description: 'Response data (varies by endpoint)'
    }
  }
        },
        DivisionListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Division'
              }
            },
            count: {
              type: 'integer',
              example: 5,
              description: 'Total number of divisions returned'
            }
          }
        },
        DivisionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/Division'
            }
          }
        },
        CreateDivisionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Division created successfully'
            },
            data: {
              $ref: '#/components/schemas/Division'
            }
          }
        },
        UpdateDivisionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Division updated successfully'
            },
            data: {
              $ref: '#/components/schemas/Division'
            }
          }
        },
        DeleteResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Division deactivated successfully'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message description'
            },
            error: {
              type: 'string',
              example: 'Detailed error information',
              description: 'Additional error details (optional)'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Division name is required'
            }
          }
        },
        ConflictError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Division name already exists. No duplicate allowed.'
            }
          }
        },
        NotFoundError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Division not found'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'API is running'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2023-12-07T10:30:00.000Z',
              description: 'Current server timestamp'
            }
          }
        }
      },
      parameters: {
        DivisionId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1
          },
          description: 'Unique identifier of the division',
          example: 1
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad request - Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/NotFoundError'
              }
            }
          }
        },
        Conflict: {
          description: 'Conflict - Duplicate data detected',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ConflictError'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check endpoint',
          description: 'Check if the API server is running and responsive',
          operationId: 'healthCheck',
          responses: {
            '200': {
              description: 'API is running successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HealthResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/api/divisions': {
        get: {
          tags: ['Divisions'],
          summary: 'Get all divisions',
          description: 'Retrieve a list of all divisions in the system, including both active and inactive ones',
          operationId: 'getAllDivisions',
          responses: {
            '200': {
              description: 'List of all divisions retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/DivisionListResponse'
                  }
                }
              }
            },
            '500': {
              $ref: '#/components/responses/InternalServerError'
            }
          }
        },
        post: {
          tags: ['Divisions'],
          summary: 'Create a new division',
          description: 'Create a new division with unique name, code, and optional SAP code. All fields must be unique across the system.',
          operationId: 'createDivision',
          requestBody: {
            required: true,
            description: 'Division data to create',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DivisionInput'
                },
                examples: {
                  engineering: {
                    summary: 'Engineering Division',
                    value: {
                      divisionName: 'Engineering',
                      divisionCode: 'ENG',
                      divisionSAPCode: 'ENG001',
                      isActive: true
                    }
                  },
                  marketing: {
                    summary: 'Marketing Division',
                    value: {
                      divisionName: 'Marketing',
                      divisionCode: 'MKT',
                      divisionSAPCode: 'MKT001',
                      isActive: true
                    }
                  },
                  withNumbers: {
                    summary: 'Division with numeric codes',
                    value: {
                      divisionName: 'camera2',
                      divisionCode: 20,
                      divisionSAPCode: 20,
                      isActive: 0
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Division created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/CreateDivisionResponse'
                  }
                }
              }
            },
            '400': {
              $ref: '#/components/responses/BadRequest'
            },
            '409': {
              $ref: '#/components/responses/Conflict'
            },
            '500': {
              $ref: '#/components/responses/InternalServerError'
            }
          }
        }
      },
      '/api/divisions/active': {
        get: {
          tags: ['Divisions'],
          summary: 'Get active divisions only',
          description: 'Retrieve a list of only active divisions (where isActive = true)',
          operationId: 'getActiveDivisions',
          responses: {
            '200': {
              description: 'List of active divisions retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/DivisionListResponse'
                  }
                }
              }
            },
            '500': {
              $ref: '#/components/responses/InternalServerError'
            }
          }
        }
      },
      '/api/divisions/{id}': {
        get: {
          tags: ['Divisions'],
          summary: 'Get division by ID',
          description: 'Retrieve a specific division by its unique identifier',
          operationId: 'getDivisionById',
          parameters: [
            {
              $ref: '#/components/parameters/DivisionId'
            }
          ],
          responses: {
            '200': {
              description: 'Division found and retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/DivisionResponse'
                  }
                }
              }
            },
            '404': {
              $ref: '#/components/responses/NotFound'
            },
            '500': {
              $ref: '#/components/responses/InternalServerError'
            }
          }
        },
        put: {
          tags: ['Divisions'],
          summary: 'Update a division',
          description: 'Update an existing division. All unique constraints are validated excluding the current record.',
          operationId: 'updateDivision',
          parameters: [
            {
              $ref: '#/components/parameters/DivisionId'
            }
          ],
          requestBody: {
            required: true,
            description: 'Updated division data',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DivisionInput'
                },
                examples: {
                  update: {
                    summary: 'Update division example',
                    value: {
                      divisionName: 'Updated Engineering',
                      divisionCode: 'ENG',
                      divisionSAPCode: 'ENG001',
                      isActive: true
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Division updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UpdateDivisionResponse'
                  }
                }
              }
            },
            '400': {
              $ref: '#/components/responses/BadRequest'
            },
            '404': {
              $ref: '#/components/responses/NotFound'
            },
            '409': {
              $ref: '#/components/responses/Conflict'
            },
            '500': {
              $ref: '#/components/responses/InternalServerError'
            }
          }
        },
        delete: {
          tags: ['Divisions'],
          summary: 'Soft delete a division',
          description: 'Deactivate a division by setting isActive to false. This is a soft delete operation.',
          operationId: 'softDeleteDivision',
          parameters: [
            {
              $ref: '#/components/parameters/DivisionId'
            }
          ],
          responses: {
            '200': {
              description: 'Division deactivated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/DeleteResponse'
                  }
                }
              }
            },
            '404': {
              $ref: '#/components/responses/NotFound'
            },
            '500': {
              $ref: '#/components/responses/InternalServerError'
            }
          }
        }
      },
      '/api/divisions/{id}/permanent': {
        delete: {
          tags: ['Divisions'],
          summary: 'Permanently delete a division',
          description: 'Permanently remove a division from the database. This action cannot be undone.',
          operationId: 'permanentDeleteDivision',
          parameters: [
            {
              $ref: '#/components/parameters/DivisionId'
            }
          ],
          responses: {
            '200': {
              description: 'Division deleted permanently',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Division deleted permanently'
                      }
                    }
                  }
                }
              }
            },
            '404': {
              $ref: '#/components/responses/NotFound'
            },
            '500': {
              $ref: '#/components/responses/InternalServerError'
            }
          }
        }
      }
    }
  },
  apis: ['./app.js'], // Path to the API files for JSDoc comments
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};