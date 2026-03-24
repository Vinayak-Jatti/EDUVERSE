# Contact Module: Career Signal Ingress

## 1. Description
A secure, persistent bridge for career applications and peer inquiries. Handles file binary broadcasts (Resumes) and formal mail triggers.

## 2. Technical Stack
- **Multer**: Signal capture (Binary files).
- **Cloudinary**: Node-to-Cloud persistence.
- **Nodemailer**: Formal broadcast to target recipient.

## 3. Mandatory Ingress Signal (Fields)
- `first_name`: Signal origin identity (string, max 100).
- `last_name`: Signal origin identity (string, max 100).
- `email`: Target node for feedback (string, validated).
- `campus`: Affiliation context (string).
- `resume`: Binary PDF/Docx signal (mandatory).

## 4. Logic Flow
1. User submits Career Signal.
2. Multer parses binary resume data.
3. Node persists application to MySQL graph (`contact_applications`).
4. Nodemailer broadcasts a formal notification to the Career Node Administrator.
