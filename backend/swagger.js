const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description: 'REST API for TaskFlow — a real-time collaborative project management application.',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local development' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      // ── Auth ───────────────────────────────────
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          username: { type: 'string', nullable: true },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          occupation: { type: 'string' },
          avatarColor: { type: 'string' },
          profileImage: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/UserProfile' },
        },
      },

      // ── Project ────────────────────────────────
      Member: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/UserProfile' },
          role: { type: 'string', enum: ['owner', 'admin', 'member'] },
          joinedAt: { type: 'string', format: 'date-time' },
        },
      },
      Invitation: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'member'] },
          status: { type: 'string', enum: ['pending', 'accepted', 'declined'] },
          invitedBy: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          members: { type: 'array', items: { $ref: '#/components/schemas/Member' } },
          invitations: { type: 'array', items: { $ref: '#/components/schemas/Invitation' } },
          inviteCode: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Board / Column / Card ──────────────────
      Label: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          color: { type: 'string' },
        },
      },
      Attachment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          originalName: { type: 'string' },
          url: { type: 'string' },
          size: { type: 'number' },
          uploadedAt: { type: 'string', format: 'date-time' },
        },
      },
      Assignee: {
        type: 'object',
        properties: {
          user: { type: 'string', description: 'User ObjectId' },
          name: { type: 'string' },
          avatar: { type: 'string' },
          color: { type: 'string' },
        },
      },
      Card: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          dueDate: { type: 'string' },
          labels: { type: 'array', items: { $ref: '#/components/schemas/Label' } },
          comments: { type: 'integer' },
          attachments: { type: 'array', items: { $ref: '#/components/schemas/Attachment' } },
          progress: { type: 'integer', minimum: 0, maximum: 100 },
          assignee: { $ref: '#/components/schemas/Assignee' },
          order: { type: 'integer' },
        },
      },
      Column: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          cards: { type: 'array', items: { $ref: '#/components/schemas/Card' } },
          order: { type: 'integer' },
        },
      },
      Board: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          project: { type: 'string' },
          color: { type: 'string' },
          backgroundImage: { type: 'string' },
          columns: { type: 'array', items: { $ref: '#/components/schemas/Column' } },
          createdBy: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Admin ──────────────────────────────────
      Session: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          userId: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          expires: { type: 'string', format: 'date-time' },
        },
      },

      // ── Common ─────────────────────────────────
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },

  // ═══════════════════════════════════════════════
  //  PATHS
  // ═══════════════════════════════════════════════
  paths: {
    // ── Auth ─────────────────────────────────────
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  username: { type: 'string' },
                  occupation: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Account or username already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Missing credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out (destroys session)',
        responses: {
          200: { description: 'Logged out', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Current user', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/UserProfile' } } } } } },
          401: { description: 'Not authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ── Projects ─────────────────────────────────
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects the current user belongs to',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Project list', content: { 'application/json': { schema: { type: 'object', properties: { projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } } } } },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create a new project',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Project created', content: { 'application/json': { schema: { type: 'object', properties: { project: { $ref: '#/components/schemas/Project' } } } } } },
          400: { description: 'Name required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get a single project',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project detail', content: { 'application/json': { schema: { type: 'object', properties: { project: { $ref: '#/components/schemas/Project' } } } } } },
          403: { description: 'Not a member', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/{id}/invite': {
      post: {
        tags: ['Projects'],
        summary: 'Invite a user by email or username',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['emailOrUsername'],
                properties: {
                  emailOrUsername: { type: 'string' },
                  role: { type: 'string', enum: ['admin', 'member'], default: 'member' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Invitation sent', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          403: { description: 'Only admins can invite', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Project or user not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Already a member or already invited', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/{id}/invite-link': {
      get: {
        tags: ['Projects'],
        summary: 'Get the invite link URL',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Invite link', content: { 'application/json': { schema: { type: 'object', properties: { inviteUrl: { type: 'string' }, inviteCode: { type: 'string' } } } } } },
          403: { description: 'Only admins can get invite link', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/{id}/regenerate-invite': {
      post: {
        tags: ['Projects'],
        summary: 'Regenerate the invite code',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'New invite link', content: { 'application/json': { schema: { type: 'object', properties: { inviteUrl: { type: 'string' }, inviteCode: { type: 'string' } } } } } },
          403: { description: 'Only admins', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/join/{code}': {
      post: {
        tags: ['Projects'],
        summary: 'Join a project via invite code',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Joined project', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, project: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } } } } } } },
          404: { description: 'Invalid invite link', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ── Boards ────────────────────────────────────
    '/api/boards/project/{projectId}': {
      get: {
        tags: ['Boards'],
        summary: 'List boards for a project',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Board list', content: { 'application/json': { schema: { type: 'object', properties: { boards: { type: 'array', items: { $ref: '#/components/schemas/Board' } } } } } } },
          403: { description: 'Not a member', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/boards': {
      post: {
        tags: ['Boards'],
        summary: 'Create a board',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'projectId'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  color: { type: 'string' },
                  backgroundImage: { type: 'string' },
                  projectId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Board created', content: { 'application/json': { schema: { type: 'object', properties: { board: { $ref: '#/components/schemas/Board' } } } } } },
          400: { description: 'Name and projectId required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/boards/{id}': {
      get: {
        tags: ['Boards'],
        summary: 'Get a board with all columns and cards',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Board with project', content: { 'application/json': { schema: { type: 'object', properties: { board: { $ref: '#/components/schemas/Board' }, project: { $ref: '#/components/schemas/Project' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Boards'],
        summary: 'Update board name/description/color',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  color: { type: 'string' },
                  backgroundImage: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Board updated', content: { 'application/json': { schema: { type: 'object', properties: { board: { $ref: '#/components/schemas/Board' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Boards'],
        summary: 'Delete a board',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Board deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ── Cards ─────────────────────────────────────
    '/api/boards/{id}/cards': {
      post: {
        tags: ['Cards'],
        summary: 'Add a card to a column',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Board ID' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['columnId', 'title'],
                properties: {
                  columnId: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  dueDate: { type: 'string' },
                  labels: { type: 'array', items: { $ref: '#/components/schemas/Label' } },
                  assignee: { $ref: '#/components/schemas/Assignee' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Card created', content: { 'application/json': { schema: { type: 'object', properties: { card: { $ref: '#/components/schemas/Card' } } } } } },
          400: { description: 'columnId and title required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Board or column not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/boards/{id}/cards/{cardId}': {
      put: {
        tags: ['Cards'],
        summary: 'Update a card',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Board ID' },
          { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  dueDate: { type: 'string' },
                  labels: { type: 'array', items: { $ref: '#/components/schemas/Label' } },
                  assignee: { $ref: '#/components/schemas/Assignee' },
                  progress: { type: 'integer', minimum: 0, maximum: 100 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Card updated', content: { 'application/json': { schema: { type: 'object', properties: { card: { $ref: '#/components/schemas/Card' } } } } } },
          404: { description: 'Board or card not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Cards'],
        summary: 'Delete a card',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Board ID' },
          { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Card deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/boards/{id}/cards/{cardId}/move': {
      post: {
        tags: ['Cards'],
        summary: 'Move a card to another column',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Board ID' },
          { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['targetColumnId'],
                properties: { targetColumnId: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Card moved', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, cardId: { type: 'string' }, sourceColumnId: { type: 'string' }, targetColumnId: { type: 'string' } } } } } },
          404: { description: 'Board, card, or target column not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/boards/{id}/cards/{cardId}/attachments': {
      post: {
        tags: ['Cards'],
        summary: 'Upload an attachment to a card',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Board ID' },
          { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary', description: 'File to upload (max 10 MB)' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Attachment uploaded', content: { 'application/json': { schema: { type: 'object', properties: { attachment: { $ref: '#/components/schemas/Attachment' } } } } } },
          400: { description: 'No file uploaded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Board or card not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/boards/{id}/cards/{cardId}/attachments/{attachmentId}': {
      delete: {
        tags: ['Cards'],
        summary: 'Delete an attachment',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Board ID' },
          { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'attachmentId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Attachment deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ── Columns ───────────────────────────────────
    '/api/boards/{id}/columns': {
      post: {
        tags: ['Columns'],
        summary: 'Add a column to a board',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Board ID' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: { title: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Column created', content: { 'application/json': { schema: { type: 'object', properties: { column: { $ref: '#/components/schemas/Column' } } } } } },
          400: { description: 'Title required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/boards/{id}/columns/{columnId}': {
      put: {
        tags: ['Columns'],
        summary: 'Rename a column',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Board ID' },
          { name: 'columnId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { title: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Column renamed', content: { 'application/json': { schema: { type: 'object', properties: { column: { $ref: '#/components/schemas/Column' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Columns'],
        summary: 'Delete a column',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Board ID' },
          { name: 'columnId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Column deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ── Admin ─────────────────────────────────────
    '/api/admin/sessions': {
      get: {
        tags: ['Admin'],
        summary: 'List all active sessions (admin only)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Session list', content: { 'application/json': { schema: { type: 'object', properties: { sessions: { type: 'array', items: { $ref: '#/components/schemas/Session' } } } } } } },
          403: { description: 'Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/admin/sessions/{sessionId}': {
      delete: {
        tags: ['Admin'],
        summary: 'Destroy a specific session (admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Session destroyed', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          404: { description: 'Session not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/admin/sessions/user/{userId}': {
      delete: {
        tags: ['Admin'],
        summary: 'Destroy all sessions for a user (admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Sessions destroyed', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          404: { description: 'No sessions found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },

  tags: [
    { name: 'Auth', description: 'Authentication & user profile' },
    { name: 'Projects', description: 'Project management & invitations' },
    { name: 'Boards', description: 'Kanban boards' },
    { name: 'Cards', description: 'Cards within board columns' },
    { name: 'Columns', description: 'Board columns' },
    { name: 'Admin', description: 'Admin-only session management' },
  ],
};

module.exports = swaggerSpec;
