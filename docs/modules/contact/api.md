# Contact Module API Specification

## 🚀 Public Application Ingress

### `POST /api/v1/contact/apply`

Broadcasts a new career application signal to the target sector. Requires binary Signal (Resume).

**Request Headers:**
- `Content-Type: multipart/form-data`

**Request Payload:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `first_name` | String(100) | YES | Given name of signal origin. |
| `last_name` | String(100) | YES | Surname of signal origin. |
| `email` | String(255) | YES | Verified feedback signal node (Email). |
| `campus` | String(255) | NO | Affiliation context within the ecosystem. |
| `resume` | Binary (File) | YES | PDF or DOCX file. Max size: 5MB. |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Application broadcasted successfully to EDUVERSE Career Node.",
  "data": {
    "id": "e4f8-4a9c-9c9c"
  }
}
```

**Error Responses:**
- `400 BAD_REQUEST`: Signals missing (e.g., no resume file).
- `500 INTERNAL_SERVER_ERROR`: Broadcast failure or DB timeout.
