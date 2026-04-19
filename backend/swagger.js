const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description:
      'REST API for TaskFlow — a real-time collaborative project management application.\n\n' +
      '## Features\n' +
      '- JWT + Session authentication\n' +
      '- Projects with invite links & email invitations\n' +
      '- Kanban boards with columns & cards\n' +
      '- Teams with member & project management\n' +
      '- Real-time updates via Socket.IO\n' +
      '- File uploads (backgrounds, attachments)\n\n' +
      '## WebSocket Events\n' +
      'Connect via Socket.IO to receive real-time updates:\n' +
      '- `board:card-added` — new card created\n' +
      '- `board:card-updated` — card modified\n' +
      '- `board:card-moved` — card moved between columns\n' +
      '- `board:card-deleted` — card removed\n' +
      '- `board:column-added` — new column\n' +
      '- `board:column-renamed` — column title changed\n' +
      '- `board:column-deleted` — column removed\n' +
      '- `board:presence` — active users on board\n' +
      '- `board:cursor-move` — live cursor positions',
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
      UserSettings: {
        type: 'object',
        properties: {
          darkMode: { type: 'boolean' },
          emailNotifications: { type: 'boolean' },
          pushNotifications: { type: 'boolean' },
          weeklyDigest: { type: 'boolean' },
          language: { type: 'string' },
          timezone: { type: 'string' },
          profileVisibility: { type: 'string', enum: ['public', 'team', 'private'] },
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
          _id: { type: 'string' },
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
          color: { type: 'string' },
          backgroundImage: { type: 'string' },
          team: { type: 'string', nullable: true },
          members: { type: 'array', items: { $ref: '#/components/schemas/Member' } },
          invitations: { type: 'array', items: { $ref: '#/components/schemas/Invitation' } },
          inviteCode: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Team ───────────────────────────────────
      TeamMember: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { $ref: '#/components/schemas/UserProfile' },
          role: { type: 'string', enum: ['owner', 'admin', 'member'] },
          joinedAt: { type: 'string', format: 'date-time' },
        },
      },
      Team: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          members: { type: 'array', items: { $ref: '#/components/schemas/TeamMember' } },
          projects: { type: 'array', items: { type: 'string' } },
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

    // ── Users ────────────────────────────────────
    '/api/users/profile': {
      put: {
        tags: ['Users'],
        summary: 'Update profile info',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  occupation: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/UserProfile' } } } } } },
          409: { description: 'Username or email already taken', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users/password': {
      put: {
        tags: ['Users'],
        summary: 'Change password',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password updated', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Current password incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users/settings': {
      get: {
        tags: ['Users'],
        summary: 'Get user settings',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User settings', content: { 'application/json': { schema: { type: 'object', properties: { settings: { $ref: '#/components/schemas/UserSettings' } } } } } },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user settings',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  darkMode: { type: 'boolean' },
                  emailNotifications: { type: 'boolean' },
                  pushNotifications: { type: 'boolean' },
                  weeklyDigest: { type: 'boolean' },
                  language: { type: 'string' },
                  timezone: { type: 'string' },
                  profileVisibility: { type: 'string', enum: ['public', 'team', 'private'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Settings updated', content: { 'application/json': { schema: { type: 'object', properties: { settings: { $ref: '#/components/schemas/UserSettings' } } } } } },
        },
      },
    },
    '/api/users/account': {
      delete: {
        tags: ['Users'],
        summary: 'Delete user account',
        description: 'Permanently deletes the user account, removes from all projects, and cleans up empty projects.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Account deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
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
    '/api/projects/my-invitations': {
      get: {
        tags: ['Projects'],
        summary: 'List pending invitations for the current user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Pending invitations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    invitations: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          projectId: { type: 'string' },
                          projectName: { type: 'string' },
                          invitationId: { type: 'string' },
                          role: { type: 'string' },
                          invitedBy: { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' } } },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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
      delete: {
        tags: ['Projects'],
        summary: 'Delete a project (owner only)',
        description: 'Deletes the project and all associated boards.',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          403: { description: 'Only the owner can delete', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/{id}/appearance': {
      patch: {
        tags: ['Projects'],
        summary: 'Update project color/background',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  color: { type: 'string' },
                  backgroundImage: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Appearance updated', content: { 'application/json': { schema: { type: 'object', properties: { project: { type: 'object', properties: { color: { type: 'string' }, backgroundImage: { type: 'string' } } } } } } } },
          403: { description: 'Not a member', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/{id}/background': {
      post: {
        tags: ['Projects'],
        summary: 'Upload a project background image',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['background'],
                properties: {
                  background: { type: 'string', format: 'binary', description: 'Image file (max 10 MB)' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Background uploaded', content: { 'application/json': { schema: { type: 'object', properties: { backgroundImage: { type: 'string' } } } } } },
          400: { description: 'No file uploaded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
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
    '/api/projects/{id}/invitations/{invId}/accept': {
      post: {
        tags: ['Projects'],
        summary: 'Accept an invitation',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Project ID' },
          { name: 'invId', in: 'path', required: true, schema: { type: 'string' }, description: 'Invitation ID' },
        ],
        responses: {
          200: { description: 'Invitation accepted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, project: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } } } } } } },
          403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/{id}/invitations/{invId}/decline': {
      post: {
        tags: ['Projects'],
        summary: 'Decline an invitation',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Project ID' },
          { name: 'invId', in: 'path', required: true, schema: { type: 'string' }, description: 'Invitation ID' },
        ],
        responses: {
          200: { description: 'Invitation declined', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
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
        summary: 'Update board name/description/color/background',
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
    '/api/boards/{id}/background': {
      post: {
        tags: ['Boards'],
        summary: 'Upload a custom board background image',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary', description: 'Image file (max 10 MB)' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Background uploaded', content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string' } } } } } },
          400: { description: 'No file uploaded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Board not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
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

    // ── Teams ─────────────────────────────────────
    '/api/teams': {
      get: {
        tags: ['Teams'],
        summary: 'List teams the current user belongs to',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Team list', content: { 'application/json': { schema: { type: 'object', properties: { teams: { type: 'array', items: { $ref: '#/components/schemas/Team' } } } } } } },
        },
      },
      post: {
        tags: ['Teams'],
        summary: 'Create a new team',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Team created', content: { 'application/json': { schema: { type: 'object', properties: { team: { $ref: '#/components/schemas/Team' } } } } } },
          400: { description: 'Name required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/teams/{id}': {
      get: {
        tags: ['Teams'],
        summary: 'Get team with members and projects',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Team detail', content: { 'application/json': { schema: { type: 'object', properties: { team: { $ref: '#/components/schemas/Team' } } } } } },
          403: { description: 'Not a member', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Teams'],
        summary: 'Update team info (owner/admin only)',
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
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Team updated', content: { 'application/json': { schema: { type: 'object', properties: { team: { $ref: '#/components/schemas/Team' } } } } } },
          403: { description: 'Only owners and admins', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Teams'],
        summary: 'Delete team (owner only)',
        description: 'Deletes the team and unlinks all associated projects (projects are not deleted).',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Team deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          403: { description: 'Only the owner', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/teams/{id}/members': {
      post: {
        tags: ['Teams'],
        summary: 'Invite a member by email or username',
        description: 'Also adds the user to all team projects.',
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
          200: { description: 'Member added', content: { 'application/json': { schema: { type: 'object', properties: { team: { $ref: '#/components/schemas/Team' } } } } } },
          400: { description: 'User already a member', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Only owners and admins', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Team or user not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/teams/{id}/members/{memberId}/role': {
      put: {
        tags: ['Teams'],
        summary: 'Change member role (owner only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'memberId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['admin', 'member'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Role updated', content: { 'application/json': { schema: { type: 'object', properties: { team: { $ref: '#/components/schemas/Team' } } } } } },
          400: { description: 'Cannot change owner role', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Only the owner', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/teams/{id}/members/{memberId}': {
      delete: {
        tags: ['Teams'],
        summary: 'Remove a member from the team',
        description: 'Also removes the member from all team projects (unless they are the project owner).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'memberId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Member removed', content: { 'application/json': { schema: { type: 'object', properties: { team: { $ref: '#/components/schemas/Team' } } } } } },
          400: { description: 'Cannot remove owner', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Only owners and admins', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/teams/{id}/projects': {
      post: {
        tags: ['Teams'],
        summary: 'Add a project to the team',
        description: 'Create a new project or import an existing one into the team. All team members are added to the project.',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Name for a new project (required if no projectId)' },
                  projectId: { type: 'string', description: 'ID of an existing project to import' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Project added to team', content: { 'application/json': { schema: { type: 'object', properties: { project: { $ref: '#/components/schemas/Project' } } } } } },
          400: { description: 'Project already belongs to a team / name required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Only owners and admins', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Team or project not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/teams/{id}/projects/{projectId}': {
      delete: {
        tags: ['Teams'],
        summary: 'Remove project from team',
        description: 'Unlinks the project from the team (does not delete the project).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Project removed from team', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          403: { description: 'Only owners and admins', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
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
    { name: 'Users', description: 'User profile, password, settings & account management' },
    { name: 'Projects', description: 'Project management, invitations & invite links' },
    { name: 'Boards', description: 'Kanban boards with background images' },
    { name: 'Cards', description: 'Cards within board columns (CRUD, move, attachments)' },
    { name: 'Columns', description: 'Board columns (add, rename, delete)' },
    { name: 'Teams', description: 'Team management, members & team projects' },
    { name: 'Admin', description: 'Admin-only session management' },
  ],
};

module.exports = swaggerSpec;
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
